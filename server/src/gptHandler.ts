import { config } from "./config/config";
import { logger } from "./utils/logger";
require("dotenv").config();

const { OpenAI } = require("openai");
const openai = new OpenAI({
  apiKey: config.openAiApiKey,
});

//#region ChatGPT declarations

// ChatGPT parameters
const MODEL: string = "gpt-4o";
const MAX_TOKENS: number = 120; // output max tokens
const TEMPERATURE: number = 1; // 0-2, higher is more creative, lower is more coherent

const prompts = {
  //
  generalUser: `Answer the TikTok live comments in a humorous and natural way.`, // Prompt for general users
  //
  follower: `Answer the TikTok live comments in a humorous and natural way. User is following you!`, // Prompt for followers
  //
  friend: `Answer the TikTok live comments in a humorous and natural way. User is your friend!`, // Prompt for friends
};

// #endregion

// Function to handle generating the answer
export async function handleAnswer(
  question: string,
  followRole: number,
  socket: any
) {
  try {
    const result: string = await callGPT(followRole, question);
    socket.emit("Answer", result); // Emit the answer to the client
  } catch (err) {
    logger.error("Error on handleAnswer:", err);
  }
}

//#region Main functions

// Function to handle fetching the gpt response
async function callGPT(followRole: number, question: string) {
  const systemPrompt = generateSystemMessage(followRole);
  const finalPrompt = `${systemPrompt}\n`; // Add a newline after the system message

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: finalPrompt },
        { role: "user", content: question },
      ],
      max_tokens: MAX_TOKENS,
      temperature: TEMPERATURE,
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error on callGPT: ", error);
    throw error;
  }
}

// Helper function to generate a system message based on followRole
function generateSystemMessage(followRole: number) {
  switch (followRole) {
    case 0: // General user
      return prompts.generalUser;
    case 1: // Follower
      return prompts.follower;
    case 2: // Friend
      return prompts.friend;
    default:
      return prompts.generalUser; // Default to general user
  }
}
//#endregion
