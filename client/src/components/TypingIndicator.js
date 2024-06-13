import React from "react";

function TypingIndicator({ isTyping }) {
  return (
    <>
      {isTyping && (
        <div className="typing-indicator-container">
          <b className="typing-indicator">.</b>
        </div>
      )}
    </>
  );
}

export default TypingIndicator;
