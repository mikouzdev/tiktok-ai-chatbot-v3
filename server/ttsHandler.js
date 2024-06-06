const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
const config = require("../config/config.js");
const { promisify } = require("util");
const writeFile = promisify(fs.writeFile);

const openai = new OpenAI();

const handleAudioRequestNew = async (req, res) => {
  const { text } = req.query;
  const speechFile = path.resolve("./speech.mp3");

  if (!text) {
    return res.status(400).send("Text parameter is required.");
  }

  try {
    const useTextToSpeech = config.useTextToSpeech;
    if (useTextToSpeech) {
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
    } else {
      res.send("Text-to-speech is not enabled.");
    }
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.sendStatus(500);
    }
  }
};

module.exports = { handleAudioRequestNew };
