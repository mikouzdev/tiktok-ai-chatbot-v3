import { config } from "./config/config";
import { logger } from "./utils/logger";
require("dotenv").config();

const { OpenAI } = require("openai");
const openai = new OpenAI({
  apiKey: config.openAiApiKey,
});

const fs = require("fs");

//#region ChatGPT declarations

// ChatGPT parameters
const MODEL: string = "chatgpt-4o-latest";
const MAX_TOKENS: number = 120; // output max tokens

const TEMPERATURE: number = 1; // 0-2, higher is more creative, lower is more coherent

let prompt = "";



const prompts = {
  //
  generalUser: `Answer the TikTok live comments in a humorous and natural way.`, // Prompt for general users
  //
  follower: ``, // Prompt for followers
  //
  friend: ``, // Prompt for friends
};

// updates the prompts coming from the client
export function updatePrompts(
  defaultPrompt: string,
  followerPrompt: string,
  friendPrompt: string
) {
  prompts.generalUser = defaultPrompt;
  prompts.follower = followerPrompt;
  prompts.friend = friendPrompt;

  console.log(prompts);
}

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
