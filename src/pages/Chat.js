import { useEffect, useState } from "react";
import { getMessages, sendMessage } from "../services/api";

function Chat() {

  const groupId = 1;

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const data = await getMessages(groupId);
      setMessages(data || []);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const handleSend = async () => {

    if (!text.trim()) return;

    const messageData = {
      groupId: groupId,
      userId: 1,
      message: text
    };

    try {
      await sendMessage(messageData);
      setText("");
      loadMessages();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="container">

      <h2>Group Chat</h2>

      <div
        style={{
          border: "1px solid gray",
          padding: "10px",
          height: "200px",
          overflow: "auto",
          marginBottom: "10px"
        }}
      >
        {messages.length === 0 ? (
          <p>No messages yet</p>
        ) : (
          messages.map((msg) => (
            <p key={msg.id}>
              <b>User {msg.userId}:</b> {msg.message}
            </p>
          ))
        )}
      </div>

      <input
        placeholder="Type message"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <br /><br />

      <button onClick={handleSend}>
        Send
      </button>

    </div>
  );
}

export default Chat;