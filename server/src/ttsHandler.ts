export const { promisify } = require("util");
export const fs = require("fs");
export const writeFile = promisify(fs.writeFile);
export const path = require("path");

const speechFile = path.resolve("./speech.mp3");

const { OpenAI } = require("openai");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const handleAudioRequest = async (req, res) => {
  const { text } = req.query;
  console.log("Received text:", text);

  if (!text) {
    // Check if the text parameter is provided
    return res.status(400).send("Text parameter is required.");
  }

  try {
    const ttsFilePath = await generateTextToSpeech(text); // Generate the TTS file
    await streamAudioFile(res, ttsFilePath); // Stream the TTS file to the client
    deleteTtsFile(ttsFilePath); // Delete the TTS file after streaming
  } catch (err) {
    // Handle errors
    console.error("Error in handleAudioRequest:", err);
    if (!res.headersSent) {
      res.sendStatus(500);
    }
  }
};

// Function to generate the text-to-speech audio
const generateTextToSpeech = async (text) => {
  try {
    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: "nova",
      input: text,
    });

    const buffer = Buffer.from(await response.arrayBuffer()); // Convert the response to a buffer
    fs.writeFileSync(speechFile, buffer); // Write the buffer to a file

    return speechFile; // Return the file path
  } catch (err) {
    console.error("Error generating TTS:", err);
    throw err;
  }
};

const streamAudioFile = (res, filePath) => {
  // Stream the TTS file to the client
  return new Promise<void>((resolve, reject) => {
    res.writeHead(200, {
      "Content-Type": "audio/mpeg",
    });

    const fileStream = fs.createReadStream(filePath); // Create a read stream for the file
    fileStream.pipe(res); // Pipe the file stream to the response

    fileStream.on("end", () => {
      // Handle the end of the stream
      console.log("TTS file sent and stream ended");
      resolve();
    });

    fileStream.on("error", (err) => {
      // Handle errors in the stream
      console.error("Error streaming the file:", err);
      reject(err);
    });
  });
};

const deleteTtsFile = (filePath) => {
  // Delete the TTS file after streaming
  try {
    fs.unlinkSync(filePath);
    console.log("TTS file deleted after sending");
  } catch (err) {
    console.error("Error deleting the file:", err);
  }
};

module.exports = { handleAudioRequest };
