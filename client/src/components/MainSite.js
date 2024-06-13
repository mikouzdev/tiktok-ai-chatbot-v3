import React, { useCallback, useContext, useEffect, useState } from "react";

import Chat from "./Chat";
import InputContainer from "./InputContainer";
import SiteContainer from "./SiteContainer";
import { SocketContext } from "./SocketProvider";
import UsernameInput from "./UsernameInput";
import "./css/MainSite.css";

const MAX_MESSAGES = 2;

const MainSite = () => {
  const socket = useContext(SocketContext);
  const [connectionStatus, setConnectionStatus] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [username, setUsername] = useState("");
  const [messages, setMessages] = useState([]);
  const [audio, setAudio] = useState(null);
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

        setIsTyping(newMessages.length === 1);

        return newMessages;
      });
    },
    [setMessages, setIsTyping]
  );

  const handleInputChange = (event) => {
    setUsername(event.target.value);
    // addMessageToChat("testi", "testi kommentti", "0", "comment");
    // addMessageToChat("AI", "testi vastaus", "0", "answer");
  };

  const handleStart = (event) => {
    event.preventDefault();
    socket.emit("TikTokUsername", username);
    setUsername("");
  };

  const handleDisconnect = () => {
    if (audio) {
      audio.pause(); // Stop audio if playing
    }
    setMessages([]);
    setConnectionStatus("");
    setIsConnected(false);
    socket.emit("TikTokDisconnect");
  };

  const fetchAudioAndPlay = useCallback(
    async (text) => {
      try {
        const response = await fetch(
          `/api/audio?text=${encodeURIComponent(text)}`
        );
        const blob = await response.blob();
        const audio = new Audio(URL.createObjectURL(blob));

        addMessageToChat("👽", text, 3, "answer");

        setAudio(audio); // Set audio to state
        audio.play();

        audio.addEventListener("ended", () => {
          socket.emit("TextToSpeechFinished");
          setAudio(null); // Reset audio
        });
      } catch (error) {
        console.error("Error fetching audio:", error);
      }
    },
    [addMessageToChat, socket]
  );

  const handleConnectionStatus = useCallback((data) => {
    const { type, message } = data;
    setConnectionStatus(`${type}: ${message}`);
    setIsConnected(type === "success");
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("ConnectionStatus", handleConnectionStatus);
      return () => {
        socket.off("ConnectionStatus", handleConnectionStatus);
      };
    }
  }, [socket, handleConnectionStatus]);

  // Handling comment
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

  // Handling AIs answer
  useEffect(() => {
    if (socket) {
      const handleAnswer = (data) => {
        fetchAudioAndPlay(data);
      };
      socket.on("Answer", handleAnswer);

      return () => {
        socket.off("Answer", handleAnswer);
      };
    }
  }, [socket, fetchAudioAndPlay]);

  return (
    <div>
      <SiteContainer
        className="body-container"
        connectionStatus={connectionStatus}
      >
        <InputContainer className="top-container">
          <UsernameInput
            username={username}
            handleInputChange={handleInputChange}
            handleStart={handleStart}
            handleDisconnect={handleDisconnect}
            connectionStatus={connectionStatus}
            isConnected={isConnected}
          />
        </InputContainer>
        <Chat className="chat-container" id="chats" messages={messages}>
          {isTyping && (
            <div className="typing-indicator-container">
              <b className="typing-indicator">.</b>
            </div>
          )}
        </Chat>
      </SiteContainer>
    </div>
  );
};

export default MainSite;
