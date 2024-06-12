/**
 *
 *  This component renders a moderation panel "page" for managing the tiktok live comment moderation.
 *  It receives queue updates from the server via a socket connection and allows deleting comments & adding test comments.
 *  Route: /moderation
 *
 */

//#region Imports
import React, { useContext, useEffect, useState } from "react";
import ModQueuePanel from "./ModQueuePanel";
import { SocketContext } from "./SocketProvider";
import TestCommentPanel from "./TestCommentPanel";
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
  // Handle the deletion of a comment from the queue

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
          setError("Failed to delete the comment");
        }
      })
      .catch((error) => {
        console.error("Error deleting comment:", error);
        setError("Failed to delete the comment. Please try again later.");
      });
  };

  // Function to generate a random comment on the queue for testing purposes (to see styling and functionality)
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
  const addRandomCommentToQueue = () => {
    const randomComment = generateRandomComment(); // Generate a random comment item
    setQueueList((prevQueue) => [...prevQueue, randomComment]); // Add the random comment to the queue
  };

  return (
    <div className="mod-panel-site">
      <ModQueuePanel
        queueList={queueList}
        error={error}
        deleteComment={deleteComment}
        addRandomComment={addRandomCommentToQueue}
        getRoleLabel={getRoleLabel}
      />
      {/* Test */}
      <TestCommentPanel />
    </div>
  );
}

export default ModerationPanel;
