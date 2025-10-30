import dotenv from "dotenv/config";

export const config = {
  port: process.env.PORT || 3001,
  tiktokSessionId: process.env.TIKTOK_SESSION_ID,
  openAiApiKey: process.env.OPENAI_API_KEY,
};

console.log("Config loaded:", config);
