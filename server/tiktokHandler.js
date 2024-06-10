// tiktokHandler.js

const { WebcastPushConnection } = require("tiktok-live-connector");
const logger = require("../utils/logger.js");
const commentQueue = require("./commentQueue.js");
const gptHandler = require("./gptHandler.js");
const config = require("../config/config.js");

const { removeDuplicateComments } = require("./duplicateRemover");

let tiktokLiveConnection;
let tiktokUsername;
let allowCommentProcessing = true;
let prevComment;
const useTextToSpeech = config.useTextToSpeech;

setInterval(removeDuplicateComments, 180000); // Remove duplicate comments every 3 minutes

//#region Connections and initialization

// Initialize the socket connection
const initialize = (socket) => {
  socket.on("TikTokUsername", (data) => handleUsername(data, socket));
  socket.on("TikTokDisconnect", () => handleTikTokDisconnect(socket));

  socket.on("disconnect", () => {
    logger.info("User disconnected from socket.");
    handleTikTokDisconnect(socket);
  });

  socket.on("TextToSpeechFinished", () => {
    // Handle the text-to-speech finished event
    handleTextToSpeechFinished(socket);
  });
};

// Handle the connection to the TikTok live and the incoming comments
const handleTikTokLiveConnection = (socket) => {
  socket.emit("ConnectionStatus", { type: "info", message: "Connecting..." });

  // Handle disconnection if there is already a connection to prevent multiple connections
  if (tiktokLiveConnection) {
    handleTikTokDisconnect();
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

  // On new comment event...
  tiktokLiveConnection.on("chat", (data) => {
    // Send the comment to handling with the neccesary parameters
    handleComment(data.uniqueId, data.comment, data.followRole, socket); // followRole: 0 = none; 1 = follower; 2 = friends
  });

  // Log if the connection is disconnected from the tiktok live
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
    tiktokLiveConnection.disconnect(); // Disconnect from the TikTok live
    commentQueue.clear(); // Clear the comment queue
  }
  allowCommentProcessing = true; // Set comment processing back to true
};
//#endregion

// Function to handle the incoming TikTok username
const handleUsername = (incomingUsername, socket) => {
  if (!incomingUsername) {
    // Check if the username is empty
    logger.info(`[SERVER]: TIKTOK USERNAME CANT BE EMPTY`);
    socket.emit("ConnectionStatus", {
      type: "error",
      message: "Username is empty",
    });
    return;
  }
  if (incomingUsername.length < 4 || incomingUsername.length > 30) {
    // Check if the username is too short or too long
    logger.info(`[SERVER]: TIKTOK USERNAME IS INVALID LENGTH`);
    socket.emit("ConnectionStatus", {
      type: "error",
      message: "Username invalid length",
    });
    return;
  }

  // Check if the username starts with an @ symbol, if not, add it
  if (!incomingUsername.startsWith("@")) {
    incomingUsername = "@" + incomingUsername;
  }

  tiktokUsername = incomingUsername; // Set the TikTok username to the incoming username
  handleTikTokLiveConnection(socket); // Handle the connection to the TikTok live
};

//#region Comment processing

// Handling function of a test comment
const handleTestComment = (user, comment, followRole, socket) => {
  logger.info("Handling a test comment.");
  handleComment(user, comment, followRole, socket);
};

// Step 1: Handle the comment
const handleComment = (user, comment, followRole, socket) => {
  if (!commentRulesPassed(comment)) {
    // Check if the comment passes the rules
    return;
  }

  logger.info(`Step 1: Handling comment from ${user}`);

  // Adds comment to queue if another is being already processed, otherwise just process the comment.
  if (!allowCommentProcessing) {
    // If comment processing is disabled (another comment is being processed)
    const addedToQueue = commentQueue.enqueue({ user, comment, followRole }); // Add comment to queue
    if (!addedToQueue) {
      // If the comment was not added to the queue (queue is full)
      logger.info("IGNORING COMMENT: Queue is full"); // Log that the comment was not added to the queue
    }
    return; // Return if the comment was not added to the queue (queue was full)
  }

  processComment(user, comment, followRole, socket);
};

// Step 2: Process the comment
const processComment = (user, comment, followRole, socket) => {
  logger.info(`Step 2: Processing comment from ${user}`);

  allowCommentProcessing = false; // Disable comment processing to prevent multiple comments being processed at the same time
  prevComment = comment; // Set the previous comment to the current comment to prevent duplicate comments

  const formattedComment = `${user}: ${comment}`; // Format the comment with the username and the comment (e.g. "username: comment")

  // Sends the comment with the needed parameters to the GPT handler
  gptHandler.handleAnswer(
    formattedComment,
    followRole,

    socket,
    useTextToSpeech,
    () => {
      allowCommentProcessing = true;
    }
  );

  // Emits the comment to the frontend
  socket.emit("Comment", {
    type: "comment",
    commentUsername: user,
    commentText: comment,
    followRole: followRole,
  });
};

// Step 3: Handle the text-to-speech finished event
function handleTextToSpeechFinished(socket) {
  allowCommentProcessing = true;
  logger.info("Final step: Text-to-speech finished.");
  checkQueueComments(socket);
}

// Step 4: Check the queue for comments
function checkQueueComments(socket) {
  if (commentQueue.size() > 0) {
    // If there are comments in the queue
    const nextComment = commentQueue.dequeue(); // Dequeue the next comment from the queue
    logger.queue(
      `Processing next: \nQueue size is now: ${commentQueue.size()}` // Log the next comment and the queue size
    );
    processComment(
      // if there are comments in the queue, process the next comment
      nextComment.user,
      nextComment.comment,
      nextComment.followRole,
      socket
    );
  } else {
    logger.queue("Queue is empty."); // If there are no comments in the queue, log that the queue is empty
  }
}
//#endregion

// Handles checking if the comment passes the rules then returns a boolean
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

module.exports = { initialize, handleTestComment };
