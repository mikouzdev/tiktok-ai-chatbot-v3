import React from "react";

function UsernameInput({
  handleStart,
  handleDisconnect,
  username,
  handleInputChange,
  connectionStatus,
  isConnected,
}) {
  return (
    <div>
      <div className="header-container">
        {/* <h3 id="username">Enter username:</h3> */}
        <p>{connectionStatus}</p>
      </div>
      <form onSubmit={handleStart}>
        <div className="input-container" id="chat">
          <input
            autoComplete="off"
            value={username}
            onChange={handleInputChange}
            className="input"
            type="text"
            placeholder="Username"
            id="username"
            required
          />

          {isConnected ? (
            <button className="button stop" onClick={handleDisconnect}>
              Stop
            </button>
          ) : (
            <button className="button start" type="submit">
              Start
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default UsernameInput;
