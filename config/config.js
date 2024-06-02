require("dotenv").config();

const config = {
  port: process.env.PORT || 3001,
  elevenLabsApiKey: process.env.ELEVENLABS_API_KEY,
  elevenLabsVoiceId: process.env.ELEVENLABS_VOICE_ID,
  tiktokSessionId: process.env.TIKTOK_SESSION_ID,
  useTextToSpeech: process.env.USE_TEXT_TO_SPEECH === "true",
};

module.exports = config;
