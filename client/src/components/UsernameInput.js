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
        <p className="connection-status">{connectionStatus}</p>
      </div>
      <form onSubmit={handleStart}>
        <div className="input-container" id="chat">
          <input
            autoComplete="off"
            value={username}
            onChange={handleInputChange}
            className="input"
            type="text"
            placeholder="@tiktok_username"
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
                      <a
              href="/moderation"
              target="_blank"
              rel="noopener noreferrer"
              className="cog-icon"
              title="Moderation"
            >
              ⚙️
            </a>
        </div>
      </form>
    </div>
  );
}

export default UsernameInput;
