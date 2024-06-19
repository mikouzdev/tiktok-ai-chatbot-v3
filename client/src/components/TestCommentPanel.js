import React, { useState } from "react";

/**
 * This component allows you to send test comments thatll go through the same process as comments that would've come from a tt live.
 */
const TestCommentPanel = () => {
  const [username, setUsername] = useState("");
  const [commentText, setCommentText] = useState("");
  const [followRole, setFollowRole] = useState("0");
  const [error, setError] = useState("");

  // This function sends a test comment to the server
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch("/api/testComment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: username,
          comment: commentText,
          followRole: parseInt(followRole, 10),
        }),
      });

      if (response.ok) {
        // Comment sent successfully
        setUsername("");
        setCommentText("");
        setFollowRole("0");
        setError("");
      } else {
        // Handle error response
        console.error("Failed to send test comment");
        setError("Error adding a comment");
      }
    } catch (error) {
      // Handle network or other errors
      console.error("Error sending test comment:", error);
      setError("Unknown error.");
    }
  };

  return (
    <div className="mod-comment-panel">
      <h1 className="mod-comment-title">Test Comment</h1>
      {error && <p className="error">{error}</p>}
      <form className="mod-comment-inside" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Comment"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          required
        />
        <select
          value={followRole}
          onChange={(e) => setFollowRole(e.target.value)}
          required
        >
          <option value="0">None</option>
          <option value="1">Follower</option>
          <option value="2">Friend</option>
        </select>
        <button type="submit">Add Test Comment</button>
      </form>
    </div>
  );
};

export default TestCommentPanel;
