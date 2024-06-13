import React from "react";

function ChatContainer({ className, messages, children }) {
  return (
    <div className={className}>
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
      {children}
    </div>
  );
}

export default ChatContainer;
