export const fs = require("fs");
export const path = require("path");

// Function to remove duplicate comments from the userComments object
export function removeDuplicateComments() {
  // Load the current user comments
  const filePath = path.join(__dirname, "./data/userComments.json");
  if (!fs.existsSync(filePath)) {
    console.error("User comments file does not exist.");
    return;
  }

  const data = fs.readFileSync(filePath, "utf-8");
  const userComments = JSON.parse(data);

  // Iterate over each user in the userComments object
  for (const user in userComments) {
    if (userComments.hasOwnProperty(user)) {
      // Use a Set to remove duplicate comments
      const uniqueComments = [...new Set(userComments[user])];
      userComments[user] = uniqueComments;
    }
  }

  // Save the updated userComments object back to the JSON file
  fs.writeFileSync(filePath, JSON.stringify(userComments, null, 2), "utf-8");
  console.log("Duplicate comments removed and data saved.");
}

module.exports = { removeDuplicateComments };
