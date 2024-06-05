/**
 * This component is the main component of the TikTok Live AI application.
 * It manages the connection status, username input, chat messages, and audio playback.
 * It communicates with the server using socket events to send and receive data.
 * The component renders the chat interface, including the username input, chat messages, and a badass cyberpunk clock.
 */

//#region Imports
import React, { useCallback, useContext, useEffect, useState } from "react";
import Chat from "./Chat";
import Container from "./Container";
import CyberpunkClock from "./CyberpunkClock";
import InputContainer from "./InputContainer";
import { SocketContext } from "./SocketProvider";
import UsernameInput from "./UsernameInput";
//#endregion

//css
import "./css/MainSite.css";

const MainSite = () => {
  const socket = useContext(SocketContext); // Get the socket instance from the context
  const [connectionStatus, setConnectionStatus] = useState(""); // State for connection status
  const [isConnected, setIsConnected] = useState(false); // State for connection status
  const [username, setUsername] = useState(""); // State for username input
  const [messages, setMessages] = useState([]); // State for chat messages
  const [audio, setAudio] = useState(null); // State for audio object

  const [isTyping, setIsTyping] = useState(false); // State for typing indicator

  // Function to add a new message to the chat
  const addMessageToChat = useCallback(
    (username, commentText, followRole, className) => {
      setMessages((prevMessages) => {
        // Clear messages if there are already two of them
        const newMessages =
          prevMessages.length >= 2
            ? [{ username, commentText, followRole, className }]
            : [
                ...prevMessages,
                { username, commentText, followRole, className },
              ];

        // Update isTyping state based on the number of messages
        setIsTyping(newMessages.length === 1);

        return newMessages;
      });
    },
    []
  );

  // Function to handle username input change
  const handleInputChange = (event) => {
    setUsername(event.target.value);

    // addMessageToChat("@jormanej3_32", "test", 0, "comment");

    // addMessageToChat(`👽`, "botin vastaus", 3, "answer");
  };

  // Function to handle starting the chat
  const handleStart = (event) => {
    event.preventDefault();
    socket.emit("TikTokUsername", username); // Send the username to the server
    document.getElementById("username").innerText = `@${username}`; // Update the username display
    setUsername(""); // Clear the username input
  };

  // Function to handle disconnecting
  const handleDisconnect = () => {
    if (audio) {
      audio.pause(); // Pause the audio if it's playing
    }
    setMessages([]); // Clear the chat messages
    setConnectionStatus(""); // Reset the connection status
    setIsConnected(false); // Set the connection status to false
    socket.emit("TikTokDisconnect"); // Send a disconnect event to the server
  };

  // Function to handle sending text-to-speech
  const handleSendTTS = useCallback(
    (text) => {
      console.log("Trying to send TTS...");
      fetch(`/api/audio?text=${encodeURIComponent(text)}`) // Fetch the audio from the server
        .then((res) => res.blob())
        .then((blob) => {
          const newAudio = new Audio(URL.createObjectURL(blob)); // Create a new Audio object with the received audio blob
          setAudio(newAudio); // Set the audio state
          newAudio.play(); // Play the audio
          addMessageToChat(`👽`, text, 3, "answer"); // Add the answer message to the chat
          newAudio.addEventListener("ended", () => {
            console.log("TTS done playing");
            socket.emit("TextToSpeechFinished"); // Send an event to the server when the audio finishes playing
          });
        })
        .catch((err) => {
          console.error(err); // Log any errors that occur during the fetch
        });
    },
    [socket, addMessageToChat]
  );

  // Handle connection status updates
  useEffect(() => {
    if (socket) {
      const handleConnectionStatus = (data) => {
        if (data.type === "error") {
          setConnectionStatus(`Error: ${data.message}`);
          setIsConnected(false);
        } else if (data.type === "info") {
          setConnectionStatus(`Info: ${data.message}`);
          setIsConnected(false);
        } else if (data.type === "success") {
          setConnectionStatus(`Success: ${data.message}`);
          setIsConnected(true);
        }
      };
      socket.on("ConnectionStatus", handleConnectionStatus); // Listen for connection status events from the server

      return () => {
        socket.off("ConnectionStatus", handleConnectionStatus); // Clean up the event listener when the component unmounts
      };
    }
  }, [socket]);

  // Handle incoming comments
  useEffect(() => {
    if (socket) {
      const handleComment = (data) => {
        if (data.type === "comment") {
          addMessageToChat(
            data.commentUsername,
            data.commentText,
            data.followRole,
            "comment"
          ); // Add the comment to the chat
        }
        console.log(data);
      };
      socket.on("Comment", handleComment); // Listen for comment events from the server

      return () => {
        socket.off("Comment", handleComment); // Clean up the event listener when the component unmounts
      };
    }
  }, [socket, addMessageToChat]);

  // Handle incoming answers
  useEffect(() => {
    if (socket) {
      const handleAnswer = (data) => {
        console.log("Received GPT answer");
        handleSendTTS(data); // Send the received answer for text-to-speech
      };
      socket.on("Answer", handleAnswer); // Listen for answer events from the server

      return () => {
        socket.off("Answer", handleAnswer); // Clean up the event listener when the component unmounts
      };
    }
  }, [socket, handleSendTTS]);

  return (
    <div>
      <Container className="body-container" connectionStatus={connectionStatus}>
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
      </Container>
    </div>
  );
};

export default MainSite;
