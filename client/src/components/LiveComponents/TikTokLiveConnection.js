import React, { useCallback, useContext, useEffect, useState } from "react";
import { SocketContext } from "../SocketProvider";
import UsernameInput from "../UsernameInput";

const TikTokLiveConnection = () => {
  const socket = useContext(SocketContext);

  const [username, setUsername] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("");
  const [isConnectedToTikTok, setIsConnectedToTikTok] = useState(false);

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const startLiveConnection = (event) => {
    event.preventDefault();

    if (!socket.connected) {
      return; // Prevent username submission if not connected to socket
    }

    socket.emit("TikTokUsername", username);
    setUsername("");
  };

  const disconnectFromLive = () => {
    setConnectionStatus("");
    setIsConnectedToTikTok(false);
    socket.emit("DisconnectFromTikTok");
  };

  const updateLiveConnectionStatus = useCallback((data) => {
    const { type, message } = data;
    setConnectionStatus(`${type}: ${message}`);
    setIsConnectedToTikTok(type === "success");
  }, []);

  useEffect(() => {
    const handleConnectionStatus = (data) => {
      updateLiveConnectionStatus(data);
    };

    const handleConnectError = (error) => {
      setConnectionStatus(`Error: ${error.message}`);
    };

    if (socket) {
      // Add event listeners
      socket.on("ConnectionStatus", handleConnectionStatus);
      socket.on("connect_error", handleConnectError);
    }

    return () => {
      // Cleanup
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
        handleInputChange={handleUsernameChange}
        handleStart={startLiveConnection}
        handleDisconnect={disconnectFromLive}
        connectionStatus={connectionStatus}
        isConnected={isConnectedToTikTok}
      />
    </div>
  );
};

export default TikTokLiveConnection;
