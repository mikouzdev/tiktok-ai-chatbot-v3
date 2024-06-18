// Requiring necessary modules
import { Request, Response } from "express";
import { OpenAI } from "openai";
import { config } from "./config/config";
import fs = require("fs");
import path = require("path");

// Constants
const speechFilePath = path.resolve("./speech.mp3");

// Creating an instance of OpenAI
const openai = new OpenAI({
  apiKey: config.openAiApiKey,
});

// Function to handle audio request
async function handleAudioRequest(req: Request, res: Response) {
  try {
    const { text } = req.query;
    console.log("Received text:", text);

    if (!text) {
      return res.status(400).send("Text parameter is required.");
    }

    const ttsFilePath = await generateTextToSpeech(text); // Generate the TTS file
    await streamSpeechFile(res, ttsFilePath); // Stream the TTS file to the client
    deleteSpeechFile(ttsFilePath); // Delete the TTS file after streaming
  } catch (err) {
    handleError(res, err);
  }
}

// Function to generate the text-to-speech audio
async function generateTextToSpeech(text) {
  try {
    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: "nova",
      input: text,
    });

    const buffer = Buffer.from(await response.arrayBuffer()); // Convert the response to a buffer
    fs.writeFileSync(speechFilePath, buffer); // Write the buffer to a file

    return speechFilePath; // Return the file path
  } catch (err) {
    console.error("Error generating TTS:", err);
    throw err;
  }
}

// Function to stream the TTS file to the client
function streamSpeechFile(res, filePath) {
  return new Promise<void>((resolve, reject) => {
    res.writeHead(200, { "Content-Type": "audio/mpeg" });

    const fileStream = fs.createReadStream(filePath); // Create a read stream for the file
    fileStream.pipe(res); // Pipe the file stream to the response

    fileStream.on("end", () => {
      console.log("TTS file sent and stream ended");
      resolve();
    });

    fileStream.on("error", (err) => {
      console.error("Error streaming the file:", err);
      reject(err);
    });
  });
}

// Function to delete the TTS file after streaming
function deleteSpeechFile(filePath) {
  try {
    fs.unlinkSync(filePath);
    console.log("TTS file deleted after sending");
  } catch (err) {
    console.error("Error deleting the file:", err);
  }
}

// Function to handle errors
function handleError(res, error) {
  console.error("Error in handleAudioRequest:", error);
  if (!res.headersSent) {
    res.sendStatus(500);
  }
}

module.exports = { handleAudioRequest };
