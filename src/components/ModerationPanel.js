/**
 *
 *  This component renders a moderation panel "page" for managing the tiktok live comment queue.
 *  It receives queue updates from the server via a socket connection and allows deleting comments.
 *  Route: /moderation
 *
 */

//#region Imports
import React, { useContext, useEffect, useState } from "react";
import { SocketContext } from "./SocketProvider";
//#endregion

//css
import "./css/ModerationPanel.css";

function ModerationPanel() {
  const socket = useContext(SocketContext);
  const [queueList, setQueueList] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (socket) {
      // Listen for queue updates from the server
      socket.on("queueUpdate", (data) => {
        setQueueList(data);
        setError(""); // Clear any previous errors
      });

      // Handle connection errors
      socket.on("connect_error", () => {
        setError("Failed to connect to the server. Please try again later.");
      });

      // Clean up on unmount
      return () => {
        socket.off("queueUpdate");
        socket.off("connect_error");
      };
    }
  }, [socket]);

  const deleteComment = (index) => {
    fetch("/api/deleteComment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ index }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // The queue will be updated automatically via the socket update
        } else {
          setError("Failed to delete the comment.");
        }
      })
      .catch((error) => {
        console.error("Error deleting comment:", error);
        setError("Failed to delete the comment. Please try again later.");
      });
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 0:
        return "Nonfollower";
      case 1:
        return "Follower";
      case 2:
        return "Friend";
      default:
        return "Unknown";
    }
  };

  // Function to generate a random comment item for testing purposes
  const generateRandomComment = () => {
    const users = ["User1", "User2", "User3", "User4", "User5"];
    const comments = [
      "This is a test comment, This is a test comment, This is a test comment, This is a test comment, This is a test comment, This is a test comment,",
      "Another random comment",
      "Lorem ipsum dolor sit amet",
      "Testing the moderation panel",
      "Random comment for styling purposes",
    ];
    const roles = [0, 1, 2];

    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomComment = comments[Math.floor(Math.random() * comments.length)];
    const randomRole = roles[Math.floor(Math.random() * roles.length)];

    return {
      user: randomUser,
      comment: randomComment,
      followRole: randomRole,
    };
  };

  // Function to add a random comment item to the queue
  const addRandomComment = () => {
    const randomComment = generateRandomComment();
    setQueueList((prevQueue) => [...prevQueue, randomComment]);
  };

  return (
    <div className="mod-panel-site">
      <div className="mod-queue-panel">
        <h1 className="mod-queue-panel-title">Comment queue</h1>
        {error && <p className="error">{error}</p>}
        {queueList.length === 0 ? (
          <p className="empty-queue">The queue is empty.</p>
        ) : (
          <ul className="queue-list">
            {queueList.map((item, index) => (
              <li key={index} className="queue-item">
                <div className="queue-item-a">
                  <div className="queue-item-b">
                    <strong className="mod-panel-user">{item.user}</strong>
                    <span className="mod-panel-role">
                      {getRoleLabel(item.followRole)}
                    </span>
                  </div>
                  <span className="mod-panel-comment">{item.comment}</span>
                </div>

                <button
                  onClick={() => deleteComment(index)}
                  className="delete-button"
                >
                  🗑️
                </button>
              </li>
            ))}
          </ul>
        )}
        {/* Button to add a random comment item for testing */}
        <button onClick={addRandomComment} className="add-random-button">
          Add Random Comment
        </button>
      </div>
      {/* Test */}
    </div>
  );
}

export default ModerationPanel;
