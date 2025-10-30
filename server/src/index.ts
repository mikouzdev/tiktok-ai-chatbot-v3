// server.js
import { logger } from "./utils/logger";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import {
  handleTestComment,
  handleTextToSpeechFinished,
  handleTikTokDisconnect,
  handleUsername,
} from "./tiktokHandler";
import { getQueue, initialize, deleteComment } from "./commentQueue"; // Import your queue module
import { updatePrompts } from "./gptHandler";
import router from "./api/router";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // Ensure this is correct
    credentials: true,
  })
);

app.use(express.json());

app.use("/api", router);
app.use("/", express.static("./dist/client"));

app.get("/{*splat}", (_req, res) => {
  res.sendFile("index.html", { root: "./dist/client" });
});

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// setup the socket connection and event listeners
io.on("connection", (socket: any) => {
  console.log(`Connected clients count: ${io.engine.clientsCount}`);

  // tiktokHandler event listeners
  socket.on("TikTokUsername", (data: string) => handleUsername(data, socket));
  socket.on("DisconnectFromTikTok", () => handleTikTokDisconnect());

  // queue event listeners
  socket.emit("UpdateQueue", getQueue()); // Send the current queue to the client

  // ttsHandler event listeners
  socket.on("TextToSpeechStatus", (data: { status: string }) =>
    handleTextToSpeechFinished(socket, data.status)
  );

  socket.on("disconnect", () => {
    console.log(`Connected clients count: ${io.engine.clientsCount}`);
  });
});

initialize(io); // Initialize the queue module with the socket object

// Function to handle the api calls of removing a comment from the queue
app.post("/api/deleteComment", (req: any, res: any) => {
  const { index } = req.body;
  if (index !== undefined) {
    const success = deleteComment(index);
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

// function to handle the incoming username from the client
app.post("/api/username", (req: any, res: any) => {
  const { username } = req.body;
  if (username) {
    console.log("Trying connectiong to LIVE by: ", username);
    handleUsername(username, io);
    res.json({ success: true, message: "Username received successfully" });
  } else {
    res.status(400).json({ success: false, message: "Username is required" });
  }
});

// function to handle the api calls of adding a test comment
app.post("/api/testComment", (req: any, res: any) => {
  const { user, comment, followRole } = req.body;
  if (user && comment && followRole !== undefined) {
    handleTestComment(user, comment, followRole, io); // io as the socket object

    logger.info("Test comment received successfully");
    // Send a success response
    res.json({ success: true, message: "Test comment received successfully" });
  } else {
    // Send an error response if required data is missing
    res.status(400).json({ success: false, message: "Missing required data" });
    console.log("Missing required data for test comment");
  }
});

// Function to handle updating prompts
// recieves the prompts from the client
app.post("/api/updatePrompts", (req: any, res: any) => {
  const { defaultPrompt: defaultPrompt, followerPrompt: followerPrompt, friendPrompt: friendPrompt } = req.body;

  if (defaultPrompt !== undefined && followerPrompt !== undefined && friendPrompt !== undefined) {
    // Here you would typically update your prompts in your database or file system
    // For this example, we'll just log the received prompts
    logger.info("Received updated prompts:");
    logger.info(`Default: ${defaultPrompt}`);
    logger.info(`Follower: ${followerPrompt}`);
    logger.info(`Friend: ${friendPrompt}`);

    updatePrompts(defaultPrompt, followerPrompt, friendPrompt);

    // Send a success response
    res.json({ success: true, message: "Prompts updated successfully" });
  } else {
    // Send an error response if required data is missing
    res.status(400).json({ success: false, message: "Missing required prompt data" });
    console.error("Missing required prompt data");
  }
});

const port = process.env.PORT || 3001;
server.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
});
