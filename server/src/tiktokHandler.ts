// tiktokHandler.js

import { WebcastPushConnection } from "tiktok-live-connector";
import { config } from "./config/config";
import { logger } from "./utils/logger";
import commentQueue = require("./commentQueue.js");
import gptHandler = require("./gptHandler.js");

let tiktokLiveConnection: WebcastPushConnection;
let tiktokUsername: string;
let allowCommentProcessing: boolean = true;
let prevComment: string;

const USERNAME_MAX_LENGTH = 30;
const USERNAME_MIN_LENGTH = 4;

//#region Connections and initialization

export function handleTextToSpeechFinished(socket: any, status: string) {
  allowCommentProcessing = true;
  console.log("Text to speech status:", status);
  checkQueueForComments(socket);
}

// Handle the connection to the TikTok live and the incoming comments
function handleTikTokLiveConnection(socket: any) {
  socket.emit("ConnectionStatus", { type: "info", message: "Connecting..." });

  // Handle disconnection if there is already a connection to prevent multiple connections
  if (tiktokLiveConnection) {
    handleTikTokDisconnect();
    logger.info("Disconnected by new user.");
  }

  // Handle connecting to the live
  tiktokLiveConnection = new WebcastPushConnection(tiktokUsername, {
    processInitialData: false,
    sessionId: config.tiktokSessionId,
    enableWebsocketUpgrade: true,
  });

  // Connect to the TikTok live
  tiktokLiveConnection
    .connect()
    .then((state) => {
      logger.info(
        `Connected to roomId ${state.roomId}\n sessionID: ${config.tiktokSessionId}\n Live title: ${state.roomInfo.title}`
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

  // On a new comment event...
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
}

// Function to handle the tiktok disconnection
export function handleTikTokDisconnect() {
  if (tiktokLiveConnection) {
    tiktokLiveConnection.disconnect(); // Disconnect from the TikTok live
    commentQueue.clear(); // Clear the comment queue
  }
  allowCommentProcessing = true; // Set comment processing back to true
}
//#endregion

// Function to handle the incoming TikTok username
export function handleUsername(incomingUsername: string, socket: any) {
  if (!incomingUsername) {
    // username is empty
    logger.info(`[SERVER]: TIKTOK USERNAME CANT BE EMPTY`);
    emitConnectionStatus(socket, "error", "Username is empty");
    return;
  }
  if (
    incomingUsername.length < USERNAME_MIN_LENGTH ||
    incomingUsername.length > USERNAME_MAX_LENGTH
  ) {
    // username is invalid length
    logger.info(`[SERVER]: TIKTOK USERNAME IS INVALID LENGTH`);
    emitConnectionStatus(socket, "error", "Username invalid length");
    return;
  }

  // Check if the username starts with an @ symbol, if not, add it
  if (!incomingUsername.startsWith("@")) {
    incomingUsername = "@" + incomingUsername;
  }

  tiktokUsername = incomingUsername; // Set the TikTok username to the incoming username
  handleTikTokLiveConnection(socket); // Handle the connection to the TikTok live
}

// Function to emit the connection status
function emitConnectionStatus(socket: any, type: string, message: string) {
  socket.emit("ConnectionStatus", { type: type, message: message });
}

//#region Comment processing
// Handling function of a test comment
export function handleTestComment(
  user: string,
  comment: string,
  followRole: number,
  socket: any
) {
  logger.info("Handling a test comment.");
  handleComment(user, comment, followRole, socket);
}

// Step 1: Handle the comment
function handleComment(
  user: string,
  comment: string,
  followRole: number,
  socket: any
) {
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
}

// Step 2: Process the comment
function processComment(
  user: string,
  comment: string,
  followRole: number,
  socket: any
) {
  logger.info(`Step 2: Processing comment from ${user}`);

  allowCommentProcessing = false; // Disable comment processing to prevent multiple comments being processed at the same time
  prevComment = comment; // Set the previous comment to the current comment to prevent duplicate comments

  const formattedComment = `${user}: ${comment}`; // Format the comment with the username and the comment (e.g. "username: comment")

  // Sends the comment with the needed parameters to the GPT handler
  gptHandler.handleAnswer(formattedComment, followRole, socket);

  // Emits the comment to the frontend
  socket.emit("Comment", {
    type: "comment",
    commentUsername: user,
    commentText: comment,
    followRole: followRole,
  });
}

// Step 4: Check the queue for comments
function checkQueueForComments(socket: any) {
  if (commentQueue.size() > 0) {
    const nextComment = commentQueue.dequeue();
    if (nextComment) {
      // Check if nextComment is not undefined
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
  } else {
    logger.queue("Queue is empty.");
  }
}
//#endregion

// Handles checking if the comment passes the rules
function commentRulesPassed(comment: string) {
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
