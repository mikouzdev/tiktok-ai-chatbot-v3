import React, { useCallback, useContext, useEffect, useState } from "react";

import ChatContainer from "./ChatContainer";
import "./css/MainSite.css";
import InputContainer from "./InputContainer";
import SiteContainer from "./SiteContainer";
import { SocketContext } from "./SocketProvider";
import TypingIndicator from "./TypingIndicator";
import UsernameInput from "./UsernameInput";

const MAX_MESSAGES = 2; // Maximum amount of messages to show in chat

const MainSite = () => {
  const socket = useContext(SocketContext);
  const [connectionStatus, setConnectionStatus] = useState(""); // Connection status
  const [isConnectedToTikTok, setIsConnectedToLive] = useState(false); // TikTok live connection status
  const [isConnectedToSocket, setIsConnectedToSocket] = useState(false); // Socket connection status
  const [isTyping, setIsTyping] = useState(false);
  const [username, setUsername] = useState("");
  const [messages, setMessages] = useState([]);
  const [audio, setAudio] = useState(null);

  // handle adding a message to chat
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

  // handles input change for tiktok live username
  const handleInputChange = (event) => {
    setUsername(event.target.value);
    // addMessageToChat("testi", "testi kommentti", "0", "comment");
    // addMessageToChat("AI", "testi vastaus", "0", "answer");
  };

  // handles tiktok live connection
  const handleStart = (event) => {
    event.preventDefault(); // Prevent form submission
    if (!isConnectedToSocket) {
      // Check if not connected to socket
      setIsConnectedToSocket("Not connected to socket");
      return;
    }

    socket.emit("TikTokUsername", username); // Emit username to server
    setUsername(""); // clear username input field
  };

  // handles disconnection from tiktok live
  const handleDisconnect = () => {
    if (audio) {
      audio.pause(); // Stop audio when disconnecting
    }

    setMessages([]); // Clear messages
    setConnectionStatus(""); // Clear connection status
    setIsConnectedToLive(false); // Set connection status to false
    socket.emit("DisconnectFromTikTok"); // emit the disconnection event to server
  };

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

  // handle live connection status text
  const updateLiveConnectionStatus = useCallback((data) => {
    const { type, message } = data;
    setConnectionStatus(`${type}: ${message}`);
    setIsConnectedToLive(type === "success");
  }, []);

  // useEffect to handle tiktok live connection status
  useEffect(() => {
    if (socket) {
      socket.on("ConnectionStatus", updateLiveConnectionStatus);
      return () => {
        socket.off("ConnectionStatus", updateLiveConnectionStatus);
      };
    }
  }, [socket, updateLiveConnectionStatus]);

  // useEffect to handle socket connection
  useEffect(() => {
    if (socket) {
      socket.on("SocketIsConnected", () => {
        setIsConnectedToSocket(true);
      });
    }
  });

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
      <SiteContainer className="body-container">
        <InputContainer className="top-container">
          <UsernameInput
            username={username}
            handleInputChange={handleInputChange}
            handleStart={handleStart}
            handleDisconnect={handleDisconnect}
            connectionStatus={connectionStatus}
            isConnected={isConnectedToTikTok}
          />
        </InputContainer>
        <ChatContainer
          className="chat-container"
          id="chats"
          messages={messages}
        >
          {/* {isTyping && (
            <div className="typing-indicator-container">
              <b className="typing-indicator">.</b>
            </div>
          )} */}
          <TypingIndicator isTyping={isTyping} />
        </ChatContainer>
      </SiteContainer>
    </div>
  );
};

export default MainSite;
