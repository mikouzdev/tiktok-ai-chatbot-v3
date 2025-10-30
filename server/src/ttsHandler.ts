import { Request, Response } from "express";
import OpenAI from "openai";
import { config } from "./config/config";
import fs = require("fs");
import path = require("path");

const openai = new OpenAI({
  apiKey: config.openAiApiKey,
});


// endpoint /audio
export async function handleAudioRequest(req: Request, res: Response) {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).send("Text parameter is required.");
    }

    console.log("Received text for TTS:", req.body);

    const audioFilePath = await generateTextToSpeech(text); // Generate the TTS file
    await streamSpeechFile(res, audioFilePath); // Stream the TTS file to the client
  } catch (err) {
    handleError(res, err);
  }
}

// api call to openai to generate tts
async function generateTextToSpeech(text: string): Promise<string> {
  const filePath = path.resolve(`./speech_${Date.now()}_${Math.random()}.mp3`);

  const response = await openai.audio.speech.create({
    model: "gpt-4o-mini-tts",
    voice: "coral",
    input: text,
    instructions: "Speak in a cheerful and positive tone."
  });

  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.promises.writeFile(filePath, buffer);
  return filePath;
}

// Function to stream the TTS file to the client
async function streamSpeechFile(res: Response, filePath: string) {
  res.writeHead(200, { "Content-Type": "audio/mpeg" });
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);

  fileStream.on("end", async () => {
    console.log("TTS file sent and stream ended");
    await fs.promises.unlink(filePath);
    console.log("TTS file deleted after sending");
  });

  fileStream.on("error", (err) => {
    console.error("Error streaming the file:", err);
    res.end();
  });
}

// Function to handle errors
function handleError(res: Response, error: any) {
  console.error("Error in handleAudioRequest:", error);
  if (!res.headersSent) {
    res.sendStatus(500);
  }
}

module.exports = { handleAudioRequest };
