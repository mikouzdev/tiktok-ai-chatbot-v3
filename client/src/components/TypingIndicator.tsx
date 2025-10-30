function TypingIndicator(props: { isTyping: boolean }) {
  return (
    <>
      {props.isTyping && (
        <div className="typing-indicator-container">
          <b className="typing-indicator">.</b>
        </div>
      )}
    </>
  );
}

export default TypingIndicator;
