import { useState } from "react";
import { createGroup } from "../services/api";
import { useNavigate } from "react-router-dom";

function CreateGroup() {

  const [groupName, setGroupName] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!groupName || !subject || !description) {
      alert("Please fill all fields");
      return;
    }

    const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");

    const group = {
      groupName,
      subject,
      description,
      createdBy: 1,
      createdByName: user.name || "Unknown",
      isPrivate: isPrivate,
    };

    try {
      const result = await createGroup(group);

      const createdGroups = JSON.parse(localStorage.getItem("createdGroups") || "[]");
      createdGroups.push({ ...group, id: result.id || Date.now() });
      localStorage.setItem("createdGroups", JSON.stringify(createdGroups));

      alert("Group Created Successfully!");
      setGroupName("");
      setSubject("");
      setDescription("");
      setIsPrivate(false);
      navigate("/dashboard");

    } catch (error) {
      console.error("Error creating group:", error);
      alert("Error creating group");
    }
  };

  return (
    <div className="container">
      <h2>Create Study Group</h2>

      <form onSubmit={handleSubmit}>

        <input
          placeholder="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />

        <input
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />

        <input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Public / Private Toggle */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px",
          background: "var(--surface-alt)",
          border: "1.5px solid var(--border)",
          borderRadius: "8px",
          marginTop: "4px",
        }}>
          <div>
            <div style={{ fontWeight: "600", fontSize: "0.9rem", color: "var(--text)" }}>
              {isPrivate ? "🔒 Private Group" : "🌐 Public Group"}
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>
              {isPrivate
                ? "Members need your approval to join"
                : "Anyone can join instantly"}
            </div>
          </div>
          <div
            onClick={() => setIsPrivate(!isPrivate)}
            style={{
              width: "44px", height: "24px",
              borderRadius: "99px",
              background: isPrivate ? "var(--accent)" : "var(--border)",
              cursor: "pointer",
              position: "relative",
              transition: "background 0.2s",
              flexShrink: 0,
            }}
          >
            <div style={{
              position: "absolute",
              top: "3px",
              left: isPrivate ? "23px" : "3px",
              width: "18px", height: "18px",
              borderRadius: "50%",
              background: "#fff",
              transition: "left 0.2s",
              boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
            }} />
          </div>
        </div>

        <button type="submit">Create Group</button>

      </form>
    </div>
  );
}

export default CreateGroup;