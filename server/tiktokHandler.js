// tiktokHandler.js

const { WebcastPushConnection } = require("tiktok-live-connector");
const logger = require("../utils/logger.js");
const commentQueue = require("./commentQueue.js");
const gptHandler = require("./gptHandler.js");
const config = require("../config/config.js");
const path = require("path");
const fs = require("fs");
const { removeDuplicateComments } = require("./duplicateRemover");

let tiktokLiveConnection;
let tiktokUsername;
let allowCommentProcessing = true;
let prevComment;
const useTextToSpeech = config.useTextToSpeech;

// Data structure to store user comments
let userComments = {};
// Load user comments
loadUserComments();
// Set interval to loop remove duplicate comments every 3 minutes from the json file
setInterval(removeDuplicateComments, 180000); // 180000 milliseconds = 3 minutes

// Function to initialize the socket connection and event handlers
const initialize = (socket, io) => {
  // Example call to the function

  socket.on("TikTokUsername", (data) => handleUsername(data, socket));
  socket.on("TikTokDisconnect", () => handleTikTokDisconnect(socket));

  socket.on("disconnect", () => {
    logger.info("User disconnected from socket.");
    handleTikTokDisconnect(socket);
  });

  // Handle when text to speech finished playing
  socket.on("TextToSpeechFinished", () => {
    handleTextToSpeechFinished(socket);
  });
};

//#region Connections
// Function to handle the TikTok live connection and its configuration
const handleTikTokLiveConnection = (socket) => {
  socket.emit("ConnectionStatus", { type: "info", message: "Connecting..." });

  // Disconnect previous if there is.
  if (tiktokLiveConnection) {
    tiktokLiveConnection.disconnect();
    logger.info("Disconnected by new user.");
  }

  // Handle connecting to the live
  tiktokLiveConnection = new WebcastPushConnection(tiktokUsername, {
    processInitialData: false,
    // sessionId: config.tiktokSessionId,
    enableWebsocketUpgrade: true,
  });

  tiktokLiveConnection
    .connect()
    .then((state) => {
      logger.info(
        `Connected to roomId ${state.roomId}\n sessionID: ${config.tiktokSessionId}\n Title: ${state.roomInfo.title}`
      );
      socket.emit("ConnectionStatus", {
        type: "success",
        message: "Connected",
      });
    })
    .catch((err) => {
      logger.error("Failed to connect", err);
      socket.emit("ConnectionStatus", {
        type: "error",
        message: "Error connecting.",
      });
    });

  // Function to handle incoming chats
  tiktokLiveConnection.on("chat", (data) => {
    // Send the comment to handling with the neccesary parameters
    handleComment(data.uniqueId, data.comment, data.followRole, socket); // followRole: 0 = none; 1 = follower; 2 = friends
  });

  // Function to log the disconnect event
  tiktokLiveConnection.on("disconnected", () =>
    logger.info("Disconnected from TikTok live")
  );

  // Function to handle a error on the connection
  tiktokLiveConnection.on("error", (err) => {
    console.error("Error!", err);
  });
};

// Function to handle the tiktok disconnection
const handleTikTokDisconnect = () => {
  if (tiktokLiveConnection) {
    tiktokLiveConnection.disconnect();
    commentQueue.clear();
  }
  allowCommentProcessing = true;
};
//#endregion

// Function to handle the incoming TikTok username
const handleUsername = (incomingUsername, socket) => {
  if (!incomingUsername) {
    logger.info(`[SERVER]: TIKTOK USERNAME CANT BE EMPTY`);
    socket.emit("ConnectionStatus", {
      type: "error",
      message: "Username is empty",
    });
    return;
  }
  if (incomingUsername.length < 4 || incomingUsername.length > 30) {
    logger.info(`[SERVER]: TIKTOK USERNAME IS INVALID LENGTH`);
    socket.emit("ConnectionStatus", {
      type: "error",
      message: "Username invalid length",
    });
    return;
  }

  // Format username correctly
  if (!incomingUsername.startsWith("@")) {
    incomingUsername = "@" + incomingUsername;
  }

  tiktokUsername = incomingUsername;
  handleTikTokLiveConnection(socket);
};

//#region Comment handling

// Handling function of a test comment
const handleTestComment = (user, comment, followRole, socket) => {
  logger.info("Handling a test comment.");
  handleComment(user, comment, followRole, socket);
};

// Step 1
// Function to handle incoming comments
const handleComment = (user, comment, followRole, socket) => {
  if (!commentRulesPassed(comment)) {
    return;
  }

  logger.info(`Step 1: Handling comment from ${user}`);

  // Adds comment to queue if another is being already processed.
  if (!allowCommentProcessing) {
    const addedToQueue = commentQueue.enqueue({ user, comment, followRole });
    if (!addedToQueue) {
      logger.info("IGNORING COMMENT: Queue is full");
    }
    return;
  }

  processComment(user, comment, followRole, socket);
};

// Step 2
// Function to process a comment.
const processComment = (user, comment, followRole, socket) => {
  logger.info(`Step 2: Processing comment from ${user}`);
  allowCommentProcessing = false;
  prevComment = comment;

  const formatedComment = `${user}: ${comment}`;
  const pastCommentsString = getUserPastComments(user); // Retrieve and format past comments for the user
  // logger.info(`Past comments from ${user}:`);
  // logger.info(pastCommentsString);

  // Handle sending comment to the GPT
  gptHandler.handleAnswer(
    formatedComment,
    followRole,
    pastCommentsString,
    socket,
    useTextToSpeech,
    () => {
      allowCommentProcessing = true;
    }
  );

  // Add comment to comment history array
  addUserCommentToArray(user, comment);

  // Emit comment to front
  socket.emit("Comment", {
    type: "comment",
    commentUsername: user,
    commentText: comment,
    followRole: followRole,
  });
};

// Function to verify comments content follows certain set rules.
function commentRulesPassed(comment) {
  if (
    comment.startsWith("@") || // To verify comment isnt a reply
    comment.length > 200 || // To verify comment isnt too long
    comment.length < 2 || // To verify comment isnt too short
    comment === prevComment // To verify comment isnt the same as the previous
  ) {
    logger.info("IGNORING COMMENT: Failed comment rules");
    return false;
  } else {
    return true;
  }
}
//#endregion

// Function to handle what to do when text to speech has finished playing
function handleTextToSpeechFinished(socket) {
  allowCommentProcessing = true;
  logger.info("Final step: Text-to-speech finished.");

  // Start processing queue after tts; if there is a queue.
  // Check if there is a queue
  if (commentQueue.size() > 0) {
    const nextComment = commentQueue.dequeue(); // Get the next comment from the queue
    logger.queue(
      `Processing next: \nQueue size is now: ${commentQueue.size()}`
    );
    processComment(
      nextComment.user,
      nextComment.comment,
      nextComment.followRole,
      socket
    );
  }
}

// Function to handle fetcing the users past comments
const getUserPastComments = (user) => {
  if (userComments[user]) {
    const pastComments = userComments[user];
    const formattedComments = pastComments
      .map((comment, index) => `${index + 1}: ${comment}`)
      .join("\n");
    return formattedComments;
  } else {
    return "No past comments from this user.";
  }
};

// Handle adding the incoming comment to the comment history
function addUserCommentToArray(user, comment) {
  // Update user comments data structure
  if (!userComments[user]) {
    userComments[user] = [];
  }
  userComments[user].push(comment);

  // Save user comments to a JSON file
  saveUserComments();
}

// Function to save the user comments to a JSON file (to keep a history on the past comments)
function saveUserComments() {
  try {
    fs.writeFileSync(
      path.join(__dirname, "./data/userComments.json"),
      JSON.stringify(userComments, null, 2),
      "utf-8"
    );
    logger.info("-- User comments successfully saved --");
  } catch (error) {
    console.error("Error saving user comments:", error);
  }
}

// Function to load user comments from a JSON file and assigning them to memory (userComments variable)
function loadUserComments() {
  const filePath = path.join(__dirname, "./data/userComments.json");
  if (fs.existsSync(filePath)) {
    try {
      const data = fs.readFileSync(filePath, "utf-8");
      userComments = JSON.parse(data);
      logger.info("-- User comments successfully loaded --");
    } catch (error) {
      console.error("Error loading user comments:", error);
    }
  } else {
    console.warn("User comments file does not exist.");
  }
}

module.exports = { initialize, handleTestComment };
