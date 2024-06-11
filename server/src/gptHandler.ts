export const logger = require("../utils/logger.js");
require("dotenv").config();

const { OpenAI } = require("openai");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

//#region ChatGPT prompt declarations
const messagePrompts = {
  //
  generalUser: `Vastaat TikTok liven kommentteihin luonnollisella nuorisomaisella tyylillä. Käytä huumoria, ironiaa ja aina pieniä alkukirjaimia. Lyhyitä vastauksia.`,
  //
  follower: `Vastaat humorisesti ja luonnollisesti TikTok liven kommentteihin puhekielellä. 
    Ole ihastunut, kissamainen, söpö ja hieman ujo. Käytä uwu-kieltä. Pienet alkukirjaimet.
    Lisätietoja: kommentoija seuraa sinua!`,
  //
  friend: `Vastaat humorisesti ja luonnollisesti TikTok liven kommentteihin puhekielellä. 
    Ole ihastunut, kissamainen, söpö ja hieman ujo. Käytä uwu-kieltä. Pienet alkukirjaimet.
    Lisätietoja: kommentoija seuraa sinua!`,
};
// #endregion

export const handleAnswer = async (question, followRole, socket) => {
  try {
    const result = await callGptApi(followRole, question);
    socket.emit("Answer", result);
  } catch (err) {
    logger.error("Error handling answer:", err);
  }
};

//#region Main functions
// Function to handle fetching the gpt output
async function callGptApi(followRole, question) {
  const systemMessage = generateSystemMessage(followRole);
  const finalPrompt = `${systemMessage}\n`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: finalPrompt },
        { role: "user", content: question },
      ],
      max_tokens: 120,
      temperature: 1,
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error fetching answer:", error);
    throw error;
  }
}

// Helper function to generate a system message based on followRole
function generateSystemMessage(followRole) {
  switch (followRole) {
    case 0: // General user
      return messagePrompts.generalUser;
    case 1: // Follower
      return messagePrompts.follower;
    case 2: // Friend
      return messagePrompts.friend;
    default:
      return messagePrompts.generalUser;
  }
}
//#endregion

module.exports = { handleAnswer };
