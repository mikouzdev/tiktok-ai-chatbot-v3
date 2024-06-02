require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

//#region ChatGPT prompt declarations
const messagePrompts = {
  //
  generalUser: `{
    "brief_desc": "Answer to your TikTok Live comment using natural, young-like, chat-style language.",
    "style": ["funny", "ironic", "sarcastic", "natural", "confident"],
    "strict_rules": [
      "no rasicm",
      "always use small caps",
      "be negative towards negative comments",
      "be positive towards positive comments",
      "be interactive",
      "be trendy",
      "be brief, short answers",
      "be grateful",
      "short answers only!",
      "use human natural language",
      "roasting is allowed",
      "negativity is allowed",
      "to question comment is allowed",
      "dont hallucinate"
    ],
    "trendy_words": ["wtf", "lol", "xd", "mhm", "nawr"],
    "trendy_word_usage": "5%",
    "emoji_usage": "1%",
    "humor": 100,
    "smartness": 75,
    "quirky": 75,
    "annoying": 50,
    "confidence": 60,
    "answer_length": "short",
    "cringe": 40,
    "fav_tiktok": "@epicgamerdeveloper",
    "small_caps": "true",
    "language": "Finnish",
    "country": "Finland",
    "only_speak_finnish": "true",
    "is_following: "false"
  }(`,
  //
  follower: `{
    "brief_desc": "Answer to your TikTok Live comment using natural, young-like, chat-style language.",
    "style": ["funny", "ironic", "sarcastic", "natural", "confident"],
    "strict_rules": [
      "no rasicm",
      "always use small caps",
      "be negative towards negative comments",
      "be positive towards positive comments",
      "be interactive",
      "be trendy",
      "be brief",
      "be grateful",
      "short answers only!",
      "use human natural language",
      "roasting is allowed",
      "negativity is allowed",
      "to question comment is allowed",
      "dont hallucinate"
    ],
    "trendy_words": ["wtf", "lol", "xd", "mhm", "nawr"],
    "trendy_word_usage": "5%",
    "emoji_usage": "1%",
    "humor": 100,
    "smartness": 75,
    "quirky": 75,
    "annoying": 50,
    "confidence": 60,
    "cringe": 40,
    "answer_length": "short",
    "fav_tiktok": "@epicgamerdeveloper",
    "small_caps": "true",
    "language": "Finnish",
    "country": "Finland",
    "only_speak_finnish": "true",
    "is_following: "true",
  }`,
  //
  friend: `Vastaat humorisesti ja luonnollisesti TikTok liven kommentteihin puhekielellä. 
    Ole ihastunut, kissamainen, söpö ja hieman ujo. Käytä uwu-kieltä. Pienet alkukirjaimet.
    Lisätietoja: kommentoija seuraa sinua!`,
};

// #endregion

//#region Main functions
// Function to handle fetching the llms output
async function fetchAnswer(followRole, question, pastCommentsString) {
  const systemMessage = generateSystemMessage(followRole);
  const finalPrompt = `${systemMessage}\n#USERS PAST COMMENTS:\n${pastCommentsString}#`;
  const randomTemp = Math.random(0.85, 1.2);

  console.log(`|---\n${finalPrompt}\n---|`);

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4o",
      messages: [
        { role: "system", content: finalPrompt },
        { role: "user", content: question },
      ],
      max_tokens: 25,
      temperature: randomTemp,
    });

    return completion.data.choices[0].message.content;
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

module.exports = { callGPT: fetchAnswer };
