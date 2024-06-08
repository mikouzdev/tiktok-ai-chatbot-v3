// server.js

require("dotenv").config();
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const logger = require("../utils/logger.js");
const tiktokHandler = require("./tiktokHandler");
const ttsHandler = require("./ttsHandler");
const queue = require("./commentQueue.js"); // Import your queue module
const cors = require("cors");

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

// Function to handle the api call of the tts
app.get("/api/audio", ttsHandler.handleAudioRequestNew);

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

// Function to handle receiving and logging test comments
app.post("/api/testComment", (req, res) => {
  const { user, comment, followRole } = req.body;
  if (user && comment && followRole !== undefined) {
    // Log the received test comment data
    // logger.info(
    //   `[TEST COMMENT]: User: ${user}, Comment: ${comment}, Follow Role: ${followRole}`
    // );

    tiktokHandler.handleTestComment(user, comment, followRole, io); // io as the socket object

    // Send a success response
    res.json({ success: true, message: "Test comment received successfully" });
  } else {
    // Send an error response if required data is missing
    res.status(400).json({ success: false, message: "Missing required data" });
  }
});

io.on("connection", (socket) => {
  logger.info(`[SERVER]: Connection established`);
  tiktokHandler.initialize(socket, io);
  socket.emit("queueUpdate", queue.getQueue());
});

queue.initialize(io);
// queue.simulateQueueData();

const port = process.env.PORT || 3001;
server.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
});
