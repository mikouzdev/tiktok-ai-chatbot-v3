const ElevenLabs = require("elevenlabs-node");
const logger = require("../utils/logger.js");
const config = require("../config/config.js");

const voice = new ElevenLabs({
  apiKey: config.elevenLabsApiKey,
  voiceId: config.elevenLabsVoiceId,
});

const handleAudioRequest = (req, res) => {
  const { text } = req.query;

  if (!text) {
    // Check for empty text
    return res.status(400).send("Text parameter is required.");
  }

  const useTextToSpeech = config.useTextToSpeech;
  if (useTextToSpeech) {
    voice
      .textToSpeechStream({
        // Configuration
        textInput: text,
        stability: 0.5,
        similarityBoost: 0.25,
        modelId: "eleven_multilingual_v2",
        responseType: "stream",
        speakerBoost: false,
      })
      .then((stream) => stream.pipe(res))
      .catch((err) => {
        logger.error(err);
        res.sendStatus(500);
      });
  } else {
    res.send("Text-to-speech is not enabled."); // If tts is not enabled, respond with an error.
  }
};

module.exports = { handleAudioRequest };
