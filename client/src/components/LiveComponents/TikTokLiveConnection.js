import React, { useCallback, useContext, useEffect, useState } from "react";
import { SocketContext } from "../SocketProvider";
import UsernameInput from "../UsernameInput";

const TikTokLiveConnection = () => {
  const socket = useContext(SocketContext);
  const [username, setUsername] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("");
  const [isConnectedToTikTok, setIsConnectedToTikTok] = useState(false);

  // Handle input change for TikTok live username
  const handleInputChange = (event) => {
    setUsername(event.target.value);
  };

  // Handles starting the TikTok live connection
  const handleConnectingToLive = (event) => {
    event.preventDefault();

    if (!socket.connected) {
      // prevent username submission if not connected to socket
      return;
    }

    socket.emit("TikTokUsername", username);
    setUsername("");
  };

  // Handle disconnection from TikTok live
  function handleDisconnectionFromLive() {
    setConnectionStatus("");
    setIsConnectedToTikTok(false);
    socket.emit("DisconnectFromTikTok");
  }

  // handle live connection status text
  const updateLiveConnectionStatus = useCallback((data) => {
    const { type, message } = data;
    setConnectionStatus(`${type}: ${message}`);
    setIsConnectedToTikTok(type === "success");
  }, []);

  // useEffect to handle tiktok live connection status
  useEffect(() => {
    const handleConnectionStatus = (data) => {
      // Handle connection status
      updateLiveConnectionStatus(data);
    };

    const handleConnectError = (error) => {
      // Handle connection error
      setConnectionStatus(`Error: ${error.message}`);
    };

    if (socket) {
      // Listen for connection status and error events
      socket.on("ConnectionStatus", handleConnectionStatus);
      socket.on("connect_error", handleConnectError);
    }

    return () => {
      // Clean up on unmount
      if (socket) {
        socket.off("ConnectionStatus", handleConnectionStatus);
        socket.off("connect_error", handleConnectError);
      }
    };
  }, [socket, updateLiveConnectionStatus]);

  return (
    <div>
      <UsernameInput
        username={username}
        handleInputChange={handleInputChange}
        handleStart={handleConnectingToLive}
        handleDisconnect={handleDisconnectionFromLive}
        connectionStatus={connectionStatus}
        isConnected={isConnectedToTikTok}
      />
    </div>
  );
};

export default TikTokLiveConnection;
