const { callGPT } = require("./gpt.js");
const logger = require("../utils/logger.js");

const handleAnswer = async (
  question,
  followRole,
  pastCommentsString,
  socket,
  useTextToSpeech,
  callback
) => {
  try {
    const result = await callGPT(followRole, question, pastCommentsString);
    socket.emit("Answer", result);

    if (!useTextToSpeech) {
      setTimeout(callback, 10);
    }
  } catch (err) {
    logger.error("Error handling answer:", err);
  }
};

module.exports = { handleAnswer };
