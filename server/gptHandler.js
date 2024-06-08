const logger = require("../utils/logger.js");
const OpenAI = require("openai");
require("dotenv").config();

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

const handleAnswer = async (
  question,
  followRole,
  pastCommentsString,
  socket,
  useTextToSpeech,
  callback
) => {
  try {
    const result = await callGptApi(followRole, question, pastCommentsString);
    socket.emit("Answer", result);

    if (!useTextToSpeech) {
      setTimeout(callback, 10);
    }
  } catch (err) {
    logger.error("Error handling answer:", err);
  }
};

//#region Main functions
// Function to handle fetching the gpt output
async function callGptApi(followRole, question, pastCommentsString) {
  const systemMessage = generateSystemMessage(followRole);
  const finalPrompt = `${systemMessage}\n#USERS PAST COMMENTS:\n${pastCommentsString}#`;
  const randomTemp = Math.random(0.85, 1);

  // console.log(`|---\n${finalPrompt}\n---|`);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: finalPrompt },
        { role: "user", content: question },
      ],
      max_tokens: 120,
      temperature: randomTemp,
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
