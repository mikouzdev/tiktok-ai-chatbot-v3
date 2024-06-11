require("dotenv").config();
export const config = {
  port: process.env.PORT || 3001,
  tiktokSessionId: process.env.TIKTOK_SESSION_ID,
};

console.log("Config loaded:", config);
