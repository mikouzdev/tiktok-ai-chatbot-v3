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

// For fetching mfw

// Correctly configure CORS middleware
app.use(
  cors({
    origin: "http://localhost:3000", // Ensure this is correct
    credentials: true,
  })
);

// Middleware to parse JSON bodies
app.use(express.json());

app.get("/api/audio", ttsHandler.handleAudioRequest);

app.post("/api/deleteComment", (req, res) => {
  const { index } = req.body;
  if (index !== undefined) {
    queue.deleteComment(index);
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, message: "Index is required" });
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
