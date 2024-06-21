import React, { useCallback, useContext, useEffect, useState } from "react";
import { SocketContext } from "../SocketProvider";
import TypingIndicator from "../TypingIndicator";

const MAX_MESSAGES = 2; // Maximum amount of messages to show in chat

// Utility function to get follow role description based on numeric value
const getFollowRoleDescription = (followRole) => {
  switch (followRole) {
    case 0:
      return "Not following";
    case 1:
      return "Follower";
    case 2:
      return "Friend";
    case 3:
      return "AI";
    default:
      return "";
  }
};

// Component to render individual messages
const Message = ({ message }) => (
  <h3 className={message.className}>
    <div className="msg-top">
      <span className="username">{message.username}</span>
      <span className="follow-role">
        {getFollowRoleDescription(message.followRole)}
      </span>
    </div>
    <span className="comment-txt">{message.commentText}</span>
  </h3>
);

const ChatContainer = () => {
  const socket = useContext(SocketContext);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  // Adds a message to the chat, ensuring we don't exceed MAX_MESSAGES
  const addMessageToChat = useCallback(
    (username, commentText, followRole, className) => {
      setMessages((prevMessages) => {
        const newMessages =
          prevMessages.length >= MAX_MESSAGES
            ? [{ username, commentText, followRole, className }]
            : [
                ...prevMessages,
                { username, commentText, followRole, className },
              ];

        setIsTyping(newMessages.length === 1);

        return newMessages;
      });
    },
    []
  );

  // Fetches audio, plays it and adds the corresponding message to the chat
  const fetchAudioAndPlay = useCallback(
    async (text) => {
      try {
        const response = await fetch(
          `/api/audio?text=${encodeURIComponent(text)}`
        );
        if (!response.ok) throw new Error("Network response was not ok");

        const blob = await response.blob();
        const audio = new Audio(URL.createObjectURL(blob));

        addMessageToChat("👽", text, 3, "answer");

        audio.play();
        audio.addEventListener("ended", () => {
          socket.emit("TextToSpeechStatus", { status: "ended" });
        });
      } catch (error) {
        console.error("Error fetching audio:", error);
        socket.emit("TextToSpeechStatus", { status: "error" });
      }
    },
    [addMessageToChat, socket]
  );

  useEffect(() => {
    if (socket) {
      const handleComment = (data) => {
        if (data.type === "comment") {
          addMessageToChat(
            data.commentUsername,
            data.commentText,
            data.followRole,
            "comment"
          );
        }
      };

      socket.on("Comment", handleComment);
      return () => socket.off("Comment", handleComment);
    }
  }, [socket, addMessageToChat]);

  useEffect(() => {
    if (socket) {
      const handleAnswer = (data) => fetchAudioAndPlay(data);
      socket.on("Answer", handleAnswer);
      return () => socket.off("Answer", handleAnswer);
    }
  }, [socket, fetchAudioAndPlay]);

  return (
    <div className="chat-container">
      {messages.map((message, index) => (
        <Message key={index} message={message} />
      ))}
      <TypingIndicator isTyping={isTyping} />
    </div>
  );
};

export default ChatContainer;
