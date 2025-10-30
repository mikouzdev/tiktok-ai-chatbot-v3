function UsernameInput(props: {
  handleStart: (e: React.FormEvent<HTMLFormElement>) => void,
  handleDisconnect: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
  username: string,
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  connectionStatus: string,
  isConnected: boolean,
}) {
  return (
    <div>
      <div className="header-container">
        {/* <h3 id="username">Enter username:</h3> */}
        <p className="connection-status">{props.connectionStatus}</p>
      </div>
      <form onSubmit={props.handleStart}>
        <div className="input-container" id="chat">
          <input
            autoComplete="off"
            value={props.username}
            onChange={props.handleInputChange}
            className="input"
            type="text"
            placeholder="@tiktok_username"
            id="username"
            required
          />

          {props.isConnected ? (
            <button className="button stop" onClick={props.handleDisconnect}>
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
