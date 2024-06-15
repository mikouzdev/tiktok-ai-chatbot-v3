import * as dotenv from "dotenv";
import * as path from "path";

const rootDir = path.resolve(__dirname, "../../../"); // Get the root directory of the project
dotenv.config({ path: path.join(rootDir, ".env") }); // Load environment variables from the .env file in the root directory

export const config = {
  port: process.env.PORT || 3001,
  tiktokSessionId: process.env.TIKTOK_SESSION_ID,
  openAiApiKey: process.env.OPENAI_API_KEY,
};

// console.log("Config loaded:", config);
