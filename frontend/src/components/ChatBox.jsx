import { useEffect, useState } from "react";
import { sendMessage, listenToMessages } from "../services/chatService";
import { useAuth } from "../context/useAuth";

const ChatBox = ({ chatId, onClose }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!chatId) return;
    const unsubscribe = listenToMessages(chatId, setMessages);
    return () => unsubscribe();
  }, [chatId]);

  const handleSend = async () => {
    if (!text.trim()) return;
    await sendMessage(chatId, currentUser.uid, text);
    setText("");
  };

  return (
    <div style={styles.box}>
      <div style={styles.header}>
        <span>💬 Chat</span>
        <button onClick={onClose}>✖</button>
      </div>

      <div style={styles.messages}>
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              ...styles.message,
              alignSelf:
                m.senderId === currentUser.uid ? "flex-end" : "flex-start",
              background:
                m.senderId === currentUser.uid ? "#7f3fbf" : "#eee",
              color:
                m.senderId === currentUser.uid ? "#fff" : "#000",
            }}
          >
            {m.text}
          </div>
        ))}
      </div>

      <div style={styles.inputRow}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type message..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default ChatBox;

const styles = {
  box: {
    position: "fixed",
    bottom: "90px",
    right: "20px",
    width: "320px",
    height: "420px",
    background: "#fff",
    borderRadius: "14px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
    zIndex: 999,
  },
  header: {
    padding: "12px",
    borderBottom: "1px solid #ddd",
    display: "flex",
    justifyContent: "space-between",
    fontWeight: "700",
  },
  messages: {
    flex: 1,
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    overflowY: "auto",
  },
  message: {
    padding: "8px 12px",
    borderRadius: "12px",
    maxWidth: "75%",
    fontSize: "14px",
  },
  inputRow: {
    display: "flex",
    gap: "8px",
    padding: "10px",
  },
};
