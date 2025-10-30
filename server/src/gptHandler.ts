import { config } from "./config/config";
import { logger } from "./utils/logger";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: config.openAiApiKey,
});

//#region ChatGPT declarations

// ChatGPT parameters
const MODEL: string = "gpt-5-nano";

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
  followRole: string,
  socket: any
) {
  try {
    const result: string = await callGPT(followRole, question);
    if (!result) throw new Error("No response from GPT");
    socket.emit("Answer", result); // Emit the answer to the client
  } catch (err) {
    logger.error("Error on handleAnswer:", err);
  }
}

//#region Main functions

// Function to handle fetching the gpt response
async function callGPT(followRole: string, question: string): Promise<string> {
  const systemPrompt = generateSystemMessage(followRole);

  try {
    const response = await openai.responses.create({
      model: MODEL,
      input: [
        {
          "role": "developer",
          "content": [
            {
              "type": "input_text",
              "text": systemPrompt
            }
          ]
        },
        {
          "role": "user",
          "content": [
            {
              "type": "input_text",
              "text": question
            }
          ]
        }
      ],
      text: {
        "format": {
          "type": "text"
        },
        "verbosity": "low"
      },
      reasoning: {
        "effort": "minimal",
        "summary": null
      },
      tools: [],
      store: false,
    });
    if (!response.output_text) throw new Error("No output from GPT response");
    console.log("GPT Response:", response.output_text);
    return response.output_text;
  } catch (error) {
    console.error("Error on callGPT: ", error);
    throw error;
  }
}

// Helper function to generate a system message based on followRole
function generateSystemMessage(followRole: string) {
  switch (followRole) {
    case "0": // General user
      return prompts.generalUser;
    case "1": // Follower
      return prompts.follower;
    case "2": // Friend
      return prompts.friend;
    default:
      return prompts.generalUser; // Default to general user
  }
}
//#endregion

