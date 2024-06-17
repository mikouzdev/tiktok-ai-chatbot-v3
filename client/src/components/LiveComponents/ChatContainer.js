import React, { useCallback, useContext, useEffect, useState } from "react";
import { SocketContext } from "../SocketProvider";
import TypingIndicator from "../TypingIndicator";

const MAX_MESSAGES = 2; // Maximum amount of messages to show in chat

function ChatContainer() {
  const socket = useContext(SocketContext);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

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

        setIsTyping(newMessages.length === 1); // Set isTyping to true if there is only one message

        return newMessages;
      });
    },
    [setMessages, setIsTyping]
  );

  // handle fetching audio and playing it
  const fetchAudioAndPlay = useCallback(
    async (text) => {
      try {
        const response = await fetch(
          `/api/audio?text=${encodeURIComponent(text)}`
        );

        const blob = await response.blob();
        const audio = new Audio(URL.createObjectURL(blob));

        addMessageToChat("👽", text, 3, "answer");

        audio.play();

        audio.addEventListener("ended", () => {
          socket.emit("TextToSpeechFinished");
        });
      } catch (error) {
        console.error("Error fetching audio:", error);
      }
    },
    [addMessageToChat, socket]
  );

  // handle comment
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

      // Start handling comment after received "Comment"
      socket.on("Comment", handleComment);

      return () => {
        socket.off("Comment", handleComment);
      };
    }
  }, [socket, addMessageToChat]); // Add addMessageToChat to the dependency array

  // Handling GPTs answer
  useEffect(() => {
    if (socket) {
      // Handle answer
      function handleAnswer(data) {
        fetchAudioAndPlay(data); // Fetch the tts and play it
      }
      socket.on("Answer", handleAnswer);
      return () => {
        socket.off("Answer", handleAnswer);
      };
    }
  }, [socket, fetchAudioAndPlay]);

  return (
    <div className="chat-container">
      {messages.map((message, index) => (
        <h3 key={index} className={message.className}>
          <div className="msg-top">
            <span className="username">{message.username}</span>
            <span className="follow-role">
              {message.followRole === 0
                ? "Ei seuraa"
                : message.followRole === 1
                ? "Follower"
                : message.followRole === 2
                ? "Friend"
                : "AI"}
            </span>
          </div>
          <span className="comment-txt">{message.commentText}</span>
        </h3>
      ))}
      <TypingIndicator isTyping={isTyping} />
    </div>
  );
}

export default ChatContainer;
