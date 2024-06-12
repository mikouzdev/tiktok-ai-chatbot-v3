export const { promisify } = require("util");
export const fs = require("fs");
export const writeFile = promisify(fs.writeFile);
export const path = require("path");

const useTextToSpeech = true; // Set to true to enable text-to-speech

const { OpenAI } = require("openai");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const handleAudioRequestNew = async (req, res) => {
  const { text } = req.query;
  console.log("received" + text);
  const speechFile = path.resolve("./speech.mp3");

  if (!text) {
    return res.status(400).send("Text parameter is required.");
  }

  try {
    if (useTextToSpeech) {
      try {
        const response = await openai.audio.speech.create({
          model: "tts-1",
          voice: "nova",
          input: text,
        });

        const buffer = Buffer.from(await response.arrayBuffer());
        await writeFile(speechFile, buffer);

        res.writeHead(200, {
          "Content-Type": "audio/mpeg",
        });

        const fileStream = fs.createReadStream(speechFile);
        fileStream.pipe(res);

        fileStream.on("end", () => {
          console.log("TTS file sent and stream ended");
          // Optionally, delete the file after sending it
          fs.unlink(speechFile, (err) => {
            if (err) {
              console.error("Error deleting the file:", err);
            } else {
              console.log("TTS file deleted after sending");
            }
          });
        });

        fileStream.on("error", (err) => {
          console.error("Error streaming the file:", err);
          if (!res.headersSent) {
            res.sendStatus(500);
          }
        });
      } catch (err) {
        console.error("Error generating TTS:", err);
        if (!res.headersSent) {
          res.sendStatus(500);
        }
      }
    } else {
      res.status(400).send("Text-to-speech is not enabled.");
    }
  } catch (err) {
    console.error("Error in handleAudioRequestNew:", err);
    if (!res.headersSent) {
      res.sendStatus(500);
    }
  }
};

module.exports = { handleAudioRequestNew };
