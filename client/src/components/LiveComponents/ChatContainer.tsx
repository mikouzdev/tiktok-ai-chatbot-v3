import { useContext, useEffect, useState } from "react";
import { SocketContext } from "../SocketProvider";
import TypingIndicator from "../TypingIndicator";
import Axios from "axios";

const MAX_MESSAGES = 2;

const followRoles: Record<string, string> = {
  "0": "Not following",
  "1": "Following",
  "2": "Friend",
  "3": "AI",
};

interface Message {
  className: string;
  username: string;
  commentText: string;
  followRole: string;
}

const MessageBox = ({ message }: { message: Message }) => (
  <h3 className={message.className}>
    <div className="msg-top">
      <span className="username">{message.username}</span>
      <span className="follow-role">{followRoles[message.followRole] || ""}</span>
    </div>
    <span className="comment-txt">{message.commentText}</span>
  </h3>
);

const ChatContainer = () => {
  const socket = useContext(SocketContext);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const addMsg = (m: Message) =>
    setMessages(prev => {
      const newMsgs = prev.length >= MAX_MESSAGES ? [m] : [...prev, m];
      setIsTyping(newMsgs.length === 1);
      return newMsgs;
    });

  const playAudio = async (text: string) => {
    if (!socket) return console.error("Socket not initialized");
    try {
      const res = await Axios.post("/api/audio", { text }, { responseType: "blob" });

      if (res.status !== 200) throw new Error("audio fetch failed");

      if (!res.headers["content-type"]?.startsWith("audio/")) throw new Error("Server did not return audio");

      addMsg({ username: "👽", commentText: text, followRole: "3", className: "answer" });

      const blob = res.data;
      const audio = new Audio(URL.createObjectURL(blob));
      audio.play();

      audio.onended = () => {
        socket.emit("TextToSpeechStatus", { status: "ended" });
      };

    } catch {
      socket.emit("TextToSpeechStatus", { status: "error" });
    }
  };

  interface Comment {
    type: string;
    commentUsername: string;
    commentText: string;
    followRole: string;
  }

  useEffect(() => {
    if (!socket) return;

    const onComment = (data: Comment) => {
      if (data.type === "comment") {
        addMsg({ username: data.commentUsername, commentText: data.commentText, followRole: data.followRole, className: "comment" });
      }
    };

    const onAnswer = (answerText: string) => {
      console.log("Received Answer:", answerText);
      playAudio(answerText);
    };

    socket.on("Comment", onComment);
    socket.on("Answer", onAnswer);
    return () => {
      socket.off("Comment");
      socket.off("Answer");
    };
  }, [socket]);

  return (
    <div className="chat-container">
      {messages.map((m, i) => <MessageBox key={i} message={m} />)}
      <TypingIndicator isTyping={isTyping} />
    </div>
  );
};

export default ChatContainer;
