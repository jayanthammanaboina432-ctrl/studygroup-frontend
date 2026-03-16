import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { getGroups } from "../services/api";

const EMOJIS = ["😀","😂","😍","🥰","😎","🤔","😢","😡","👍","👎","❤️","🔥","🎉","✅","💡","📚","🚀","💪","🙏","👋","😅","🤣","😊","😇","🥳","😴","🤯","😱","🤗","💯"];

function GroupDetail() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [groupName, setGroupName] = useState("");
  const [subject, setSubject] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [onlineMembers, setOnlineMembers] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTabFocused, setIsTabFocused] = useState(true);
  const [lightboxImg, setLightboxImg] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const storageKey = `chat_group_${groupId}`;
  const onlineKey = `online_group_${groupId}`;

  useEffect(() => {
    const onFocus = () => { setIsTabFocused(true); setUnreadCount(0); };
    const onBlur = () => setIsTabFocused(false);
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);
    return () => { window.removeEventListener("focus", onFocus); window.removeEventListener("blur", onBlur); };
  }, []);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const data = await getGroups();
        const group = data.find((g) => String(g.id) === String(groupId));
        if (group) { setGroupName(group.groupName); setSubject(group.subject); }
      } catch (error) { console.error("Error fetching group:", error); }
    };
    fetchGroup();
  }, [groupId]);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) setMessages(JSON.parse(saved));
  }, [groupId, storageKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!joined || !username) return;
    const updateOnline = () => {
      const onlineData = JSON.parse(localStorage.getItem(onlineKey) || "{}");
      onlineData[username] = Date.now();
      localStorage.setItem(onlineKey, JSON.stringify(onlineData));
    };
    updateOnline();
    const interval = setInterval(() => {
      updateOnline();
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setMessages((prev) => {
          if (parsed.length > prev.length && !isTabFocused) {
            setUnreadCount((c) => c + (parsed.length - prev.length));
          }
          return parsed;
        });
      }
      const onlineData = JSON.parse(localStorage.getItem(onlineKey) || "{}");
      const now = Date.now();
      const active = Object.entries(onlineData)
        .filter(([, time]) => now - time < 10000)
        .map(([name]) => name);
      setOnlineMembers(active);
    }, 2000);
    return () => {
      clearInterval(interval);
      const onlineData = JSON.parse(localStorage.getItem(onlineKey) || "{}");
      delete onlineData[username];
      localStorage.setItem(onlineKey, JSON.stringify(onlineData));
    };
  }, [joined, username, groupId, storageKey, onlineKey, isTabFocused]);

  const handleJoinChat = () => {
    if (!nameInput.trim()) { alert("Please enter your name"); return; }
    setUsername(nameInput.trim());
    setJoined(true);
    setUnreadCount(0);
  };

  const handleExit = () => {
    const confirmed = window.confirm("Are you sure you want to exit this group?");
    if (!confirmed) return;

    const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
    user.joinedGroups = (user.joinedGroups || []).filter(
      (g) => String(g.id) !== String(groupId)
    );
    localStorage.setItem("loggedInUser", JSON.stringify(user));

    const onlineData = JSON.parse(localStorage.getItem(onlineKey) || "{}");
    delete onlineData[username];
    localStorage.setItem(onlineKey, JSON.stringify(onlineData));

    navigate("/dashboard");
  };

  const sendMessage = (msgData) => {
    const updated = [...messages, msgData];
    setMessages(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const handleSend = () => {
    if (!newMessage.trim()) return;
    sendMessage({
      id: Date.now(),
      sender: username,
      text: newMessage.trim(),
      type: "text",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      timestamp: Date.now(),
      deleted: false,
    });
    setNewMessage("");
    setShowEmojiPicker(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("File too large. Max size is 2MB.");
      return;
    }
    const isImage = file.type.startsWith("image/");
    const reader = new FileReader();
    reader.onloadend = () => {
      sendMessage({
        id: Date.now(),
        sender: username,
        type: isImage ? "image" : "file",
        fileData: reader.result,
        fileName: file.name,
        fileSize: formatFileSize(file.size),
        fileType: file.type,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        timestamp: Date.now(),
        deleted: false,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleDelete = (msgId) => {
    const updated = messages.map((m) =>
      m.id === msgId ? { ...m, deleted: true, text: "", fileData: null } : m
    );
    setMessages(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const addEmoji = (emoji) => setNewMessage((prev) => prev + emoji);

  const getFileIcon = (fileType) => {
    if (fileType?.includes("pdf")) return "📄";
    if (fileType?.includes("word") || fileType?.includes("document")) return "📝";
    if (fileType?.includes("sheet") || fileType?.includes("excel")) return "📊";
    if (fileType?.includes("zip") || fileType?.includes("rar")) return "🗜️";
    if (fileType?.includes("video")) return "🎥";
    if (fileType?.includes("audio")) return "🎵";
    return "📎";
  };

  const renderFileBubble = (msg, isMe) => {
    return (
      <a
        href={msg.fileData}
        download={msg.fileName}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "12px 16px",
          borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          background: isMe ? "var(--accent)" : "var(--surface)",
          border: isMe ? "none" : "1px solid var(--border)",
          boxShadow: "var(--shadow-sm)",
          textDecoration: "none",
          maxWidth: "260px",
          transition: "opacity 0.2s",
        }}
        onMouseOver={(e) => e.currentTarget.style.opacity = "0.85"}
        onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
      >
        <div style={{ fontSize: "1.8rem", lineHeight: 1 }}>
          {getFileIcon(msg.fileType)}
        </div>
        <div>
          <div style={{
            fontSize: "0.875rem",
            fontWeight: "600",
            color: isMe ? "#fff" : "var(--text)",
            maxWidth: "160px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}>
            {msg.fileName}
          </div>
          <div style={{
            fontSize: "0.72rem",
            color: isMe ? "rgba(255,255,255,0.7)" : "var(--text-muted)",
            marginTop: "2px",
          }}>
            {msg.fileSize} · Click to download
          </div>
        </div>
      </a>
    );
  };

  if (!joined) {
    return (
      <div className="container">
        <h2>Join — {groupName || `Group #${groupId}`}</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "20px", fontSize: "0.9rem" }}>
          Enter your name to enter the group chat
        </p>
        <input
          type="text"
          placeholder="Your name"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleJoinChat()}
        />
        <button type="button" onClick={handleJoinChat} style={{ marginTop: "14px" }}>
          Enter Chat
        </button>
      </div>
    );
  }

  return (
    <div style={{
      width: "min(720px, calc(100vw - 32px))",
      background: "var(--surface)",
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-lg)",
      border: "1px solid var(--border)",
      overflow: "hidden",
      position: "relative",
      animation: "slideUp 0.4s cubic-bezier(0.16,1,0.3,1)",
    }}>

      <div style={{ height: "3px", background: "linear-gradient(90deg, var(--accent), var(--gold))" }} />

      {/* Header */}
      <div style={{ background: "var(--text)", color: "#fff", padding: "16px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "10px" }}>
              {groupName || `Group #${groupId}`}
              {unreadCount > 0 && (
                <span style={{
                  background: "var(--accent)", color: "#fff", borderRadius: "20px",
                  padding: "2px 8px", fontSize: "0.72rem", fontWeight: "700",
                }}>
                  {unreadCount} new
                </span>
              )}
            </div>
            <div style={{ fontSize: "0.78rem", opacity: 0.6, marginTop: "2px" }}>
              {subject && <span>{subject} · </span>}
              Chatting as <strong>{username}</strong>
            </div>
          </div>

          {/* Online + Exit Group */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#4caf50", boxShadow: "0 0 6px #4caf50" }} />
              <span style={{ fontSize: "0.78rem", opacity: 0.7 }}>{onlineMembers.length} online</span>
            </div>
            <button
              onClick={handleExit}
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                color: "#fff",
                padding: "6px 14px",
                fontSize: "0.78rem",
                fontWeight: "600",
                cursor: "pointer",
                width: "auto",
                marginTop: "0",
                boxShadow: "none",
                transition: "all 0.2s",
                fontFamily: "'DM Sans', sans-serif",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "rgba(192,57,43,0.7)";
                e.currentTarget.style.borderColor = "rgba(192,57,43,0.9)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
              }}
            >
              Exit Group
            </button>
          </div>
        </div>

        {onlineMembers.length > 0 && (
          <div style={{
            marginTop: "12px", padding: "10px 14px",
            background: "rgba(255,255,255,0.07)", borderRadius: "8px",
            display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap",
          }}>
            <span style={{ fontSize: "0.72rem", opacity: 0.6, marginRight: "4px" }}>ONLINE</span>
            {onlineMembers.map((member) => (
              <div key={member} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <div style={{
                  width: "26px", height: "26px", borderRadius: "50%",
                  background: member === username ? "var(--accent)" : "var(--gold)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.65rem", fontWeight: "700", color: "#fff",
                  border: "2px solid rgba(255,255,255,0.2)",
                }}>
                  {member.slice(0, 2).toUpperCase()}
                </div>
                <span style={{ fontSize: "0.78rem", opacity: 0.85 }}>
                  {member === username ? "You" : member}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Messages */}
      <div style={{
        height: "420px", overflowY: "auto", padding: "20px 24px",
        display: "flex", flexDirection: "column", gap: "10px",
        background: "var(--surface-alt)",
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "60px" }}>
            No messages yet. Say hello! 👋
          </div>
        )}

        {messages.map((msg, index) => {
          const isMe = msg.sender === username;
          const showDateSeparator = index === 0 || (
            new Date(msg.timestamp).toDateString() !==
            new Date(messages[index - 1]?.timestamp).toDateString()
          );

          return (
            <div key={msg.id}>
              {showDateSeparator && msg.timestamp && (
                <div style={{
                  textAlign: "center", margin: "10px 0", fontSize: "0.72rem",
                  color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "10px",
                }}>
                  <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
                  {new Date(msg.timestamp).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
                  <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
                {!msg.deleted && (
                  <div style={{
                    fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "3px",
                    paddingLeft: isMe ? "0" : "4px", paddingRight: isMe ? "4px" : "0",
                  }}>
                    {isMe ? "You" : msg.sender}
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", flexDirection: isMe ? "row-reverse" : "row" }}>
                  {msg.deleted ? (
                    <div style={{
                      padding: "8px 14px", borderRadius: "12px",
                      border: "1px dashed var(--border)", color: "var(--text-muted)",
                      fontSize: "0.8rem", fontStyle: "italic",
                    }}>
                      🚫 Message deleted
                    </div>
                  ) : msg.type === "image" ? (
                    <div
                      onClick={() => setLightboxImg(msg.fileData)}
                      style={{
                        maxWidth: "260px",
                        borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                        overflow: "hidden",
                        boxShadow: "var(--shadow-md)",
                        cursor: "pointer",
                        border: isMe ? "none" : "1px solid var(--border)",
                      }}
                    >
                      <img
                        src={msg.fileData}
                        alt={msg.fileName}
                        style={{ width: "100%", display: "block", maxHeight: "200px", objectFit: "cover" }}
                      />
                      <div style={{
                        padding: "6px 10px",
                        background: isMe ? "var(--accent)" : "var(--surface)",
                        fontSize: "0.72rem",
                        color: isMe ? "rgba(255,255,255,0.8)" : "var(--text-muted)",
                      }}>
                        📷 {msg.fileName}
                      </div>
                    </div>
                  ) : msg.type === "file" ? (
                    renderFileBubble(msg, isMe)
                  ) : (
                    <div style={{
                      maxWidth: "75%", minWidth: "60px", whiteSpace: "pre-wrap",
                      padding: "10px 16px",
                      borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                      background: isMe ? "var(--accent)" : "var(--surface)",
                      color: isMe ? "#fff" : "var(--text)",
                      fontSize: "0.9rem",
                      boxShadow: "var(--shadow-sm)",
                      border: isMe ? "none" : "1px solid var(--border)",
                      lineHeight: "1.5", wordBreak: "break-word",
                    }}>
                      {msg.text}
                    </div>
                  )}

                  {isMe && !msg.deleted && (
                    <button
                      onClick={() => handleDelete(msg.id)}
                      title="Delete message"
                      style={{
                        background: "transparent", border: "none", cursor: "pointer",
                        padding: "4px", fontSize: "0.75rem", color: "var(--text-muted)",
                        opacity: 0.5, transition: "opacity 0.2s",
                        width: "auto", marginTop: "0", boxShadow: "none",
                      }}
                      onMouseOver={(e) => e.currentTarget.style.opacity = "1"}
                      onMouseOut={(e) => e.currentTarget.style.opacity = "0.5"}
                    >
                      🗑
                    </button>
                  )}
                </div>

                {!msg.deleted && (
                  <div style={{
                    fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "3px",
                    paddingLeft: isMe ? "0" : "4px", paddingRight: isMe ? "4px" : "0",
                  }}>
                    {msg.time}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div style={{
          position: "absolute", bottom: "72px", left: "24px",
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius)", padding: "12px",
          boxShadow: "var(--shadow-lg)", display: "grid",
          gridTemplateColumns: "repeat(10, 1fr)", gap: "4px",
          zIndex: 100, animation: "slideUp 0.2s ease",
        }}>
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => addEmoji(emoji)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: "1.2rem", padding: "4px", borderRadius: "6px",
                transition: "background 0.15s", width: "auto", marginTop: "0", boxShadow: "none",
              }}
              onMouseOver={(e) => e.currentTarget.style.background = "var(--surface-alt)"}
              onMouseOut={(e) => e.currentTarget.style.background = "none"}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Input Row */}
      <div style={{
        display: "flex", alignItems: "center", gap: "8px",
        padding: "14px 20px", borderTop: "1px solid var(--border)",
        background: "var(--surface)",
      }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.mp4,.mp3"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          style={{
            background: showEmojiPicker ? "var(--accent-soft)" : "transparent",
            border: "1.5px solid var(--border)", borderRadius: "8px",
            padding: "9px 12px", cursor: "pointer", fontSize: "1.1rem",
            width: "auto", marginTop: "0", boxShadow: "none", transition: "all 0.2s",
          }}
          title="Emoji picker"
        >
          😊
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            background: "transparent", border: "1.5px solid var(--border)",
            borderRadius: "8px", padding: "9px 12px", cursor: "pointer",
            fontSize: "1.1rem", width: "auto", marginTop: "0", boxShadow: "none",
            transition: "all 0.2s", color: "var(--text-muted)",
          }}
          title="Attach file or image"
        >
          📎
        </button>

        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ flex: 1 }}
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={!newMessage.trim()}
          style={{
            width: "auto", padding: "10px 22px", marginTop: "0",
            background: newMessage.trim() ? "var(--accent)" : "var(--border)",
            color: newMessage.trim() ? "#fff" : "var(--text-muted)",
            border: "none", borderRadius: "8px", fontWeight: "600",
            cursor: newMessage.trim() ? "pointer" : "not-allowed",
            fontSize: "0.9rem", transition: "all 0.2s",
          }}
        >
          Send ↑
        </button>
      </div>

      {/* Lightbox */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.85)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 9999, cursor: "zoom-out",
            animation: "slideUp 0.2s ease",
          }}
        >
          <img
            src={lightboxImg}
            alt="preview"
            style={{
              maxWidth: "90vw", maxHeight: "90vh",
              borderRadius: "12px", boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          />
          <div style={{
            position: "absolute", top: "20px", right: "24px",
            color: "#fff", fontSize: "1.5rem", cursor: "pointer", opacity: 0.7,
          }}>
            ✕
          </div>
        </div>
      )}

    </div>
  );
}

export default GroupDetail;