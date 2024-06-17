// server.js
import { logger } from "./utils/logger";
export const express = require("express");
export const http = require("http");
export const socketio = require("socket.io");

export const tiktokHandler = require("./tiktokHandler");
export const ttsHandler = require("./ttsHandler");
export const queue = require("./commentQueue.js"); // Import your queue module
export const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Correctly configure CORS middleware
app.use(
  cors({
    origin: "http://localhost:3000", // Ensure this is correct
    credentials: true,
  })
);

// Middleware to parse JSON bodies
app.use(express.json());

queue.initialize(io); // Initialize the queue module with the socket object
// queue.simulateQueueData();

// Function to handle the api call of the tts
app.get("/api/audio", ttsHandler.handleAudioRequest);

// Function to handle the api calls of removing a comment from the queue
app.post("/api/deleteComment", (req, res) => {
  const { index } = req.body;
  if (index !== undefined) {
    const success = queue.deleteComment(index);
    if (success) {
      res.json({ success: true, message: "Comment deleted successfully" });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Failed to delete comment" });
    }
  } else {
    res.status(400).json({ success: false, message: "Index is required" });
  }
});

// function to handle the api calls of adding a test comment
app.post("/api/testComment", (req, res) => {
  const { user, comment, followRole } = req.body;
  if (user && comment && followRole !== undefined) {
    tiktokHandler.handleTestComment(user, comment, followRole, io); // io as the socket object

    logger.info("Test comment received successfully");
    // Send a success response
    res.json({ success: true, message: "Test comment received successfully" });
  } else {
    // Send an error response if required data is missing
    res.status(400).json({ success: false, message: "Missing required data" });
    console.log("Missing required data for test comment");
  }
});

// on socket connection, initialize the tiktok handler and send the current queue
io.on("connection", (socket) => {
  console.log(
    `\nSocket connected with id: ${socket.id}\nConnected clients count: ${io.engine.clientsCount}\n`
  );
  tiktokHandler.initialize(socket, io);
  socket.emit("queueUpdate", queue.getQueue()); // Send the current queue to the client
  socket.emit("SocketIsConnected"); // Send a message to the client that the socket is connected

  socket.on("disconnect", (reason: any) => {
    console.log(
      `\nSocket disconnected with id: ${socket.id}\nReason: ${reason}\nConnected clients count: ${io.engine.clientsCount}`
    );
  });
});

const port = process.env.PORT || 3001;
server.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
});
