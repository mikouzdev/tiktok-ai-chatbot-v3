import React, { useState } from "react";

function TestCommentPanel() {
  const [error, setError] = useState("");
  const [testUser, setTestUser] = useState("");
  const [testComment, setTestComment] = useState("");
  const [testFollowRole, setTestFollowRole] = useState("0");

  // Function to handle sending a test comment
  const sendTestComment = async () => {
    try {
      const response = await fetch("/api/testComment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: testUser,
          comment: testComment,
          followRole: parseInt(testFollowRole),
        }),
      });

      if (response.ok) {
        // Comment sent successfully
        setTestUser("");
        setTestComment("");
        setTestFollowRole("0");
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
      <div className="mod-comment-inside">
        <input
          type="text"
          placeholder="Username"
          value={testUser}
          onChange={(e) => setTestUser(e.target.value)}
        />
        <input
          type="text"
          placeholder="Comment"
          value={testComment}
          onChange={(e) => setTestComment(e.target.value)}
        />
        <select
          value={testFollowRole}
          onChange={(e) => setTestFollowRole(e.target.value)}
        >
          <option value="0">None</option>
          <option value="1">Follower</option>
          <option value="2">Friend</option>
        </select>
        <button onClick={sendTestComment}>Add Test Comment</button>
      </div>
    </div>
  );
}

export default TestCommentPanel;
