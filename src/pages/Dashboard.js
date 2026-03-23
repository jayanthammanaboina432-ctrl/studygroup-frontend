import { useEffect, useState } from "react";
import { getGroups, joinGroup, deleteGroup } from "../services/api";
import { useNavigate } from "react-router-dom";

function Dashboard() {

  const [groups, setGroups] = useState([]);
  const [joinedIds, setJoinedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("All");
  const [editingGroup, setEditingGroup] = useState(null);
  const [editForm, setEditForm] = useState({ groupName: "", subject: "", description: "" });
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("loggedInUser") || "{}");

  useEffect(() => {
    loadGroups();
    const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
    setJoinedIds(user.joinedGroups || []);
  }, []);

  const loadGroups = async () => {
    try {
      const data = await getGroups();
      setGroups(data || []);
    } catch (error) {
      console.error("Error loading groups:", error);
    }
  };

  const getMemberCount = (groupId) => {
    const key = `group_members_${groupId}`;
    const members = JSON.parse(localStorage.getItem(key) || "[]");
    return members.length;
  };

  const getPendingRequests = (groupId) => {
    const key = `group_requests_${groupId}`;
    return JSON.parse(localStorage.getItem(key) || "[]");
  };

  const hasPendingRequest = (groupId) => {
    const requests = getPendingRequests(groupId);
    return requests.some((r) => r.name === currentUser.name);
  };

  const handleJoin = async (group) => {
    const joinData = { userId: 1, groupId: group.id };

    if (group.isPrivate) {
      const requests = getPendingRequests(group.id);
      if (requests.some((r) => r.name === currentUser.name)) {
        alert("You already sent a request. Please wait for approval.");
        return;
      }
      requests.push({ name: currentUser.name, email: currentUser.email, time: Date.now() });
      localStorage.setItem(`group_requests_${group.id}`, JSON.stringify(requests));
      alert("Join request sent! Wait for the group creator to approve.");
      return;
    }

    try {
      await joinGroup(joinData);
      const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
      const already = user.joinedGroups || [];
      if (!already.find((g) => g.id === group.id)) {
        user.joinedGroups = [...already, { id: group.id, groupName: group.groupName, subject: group.subject }];
        localStorage.setItem("loggedInUser", JSON.stringify(user));
        setJoinedIds(user.joinedGroups);

        const memberKey = `group_members_${group.id}`;
        const members = JSON.parse(localStorage.getItem(memberKey) || "[]");
        if (!members.includes(user.name)) {
          members.push(user.name);
          localStorage.setItem(memberKey, JSON.stringify(members));
        }
      }
      navigate(`/group/${group.id}`);
    } catch (error) {
      console.error("Error joining group:", error);
      alert("Error joining group");
    }
  };

  const handleAcceptRequest = (group, requester) => {
    const memberKey = `group_members_${group.id}`;
    const members = JSON.parse(localStorage.getItem(memberKey) || "[]");
    if (!members.includes(requester.name)) {
      members.push(requester.name);
      localStorage.setItem(memberKey, JSON.stringify(members));
    }
    const requests = getPendingRequests(group.id).filter((r) => r.name !== requester.name);
    localStorage.setItem(`group_requests_${group.id}`, JSON.stringify(requests));
    setGroups([...groups]);
    alert(`${requester.name} has been accepted!`);
  };

  const handleRejectRequest = (group, requester) => {
    const requests = getPendingRequests(group.id).filter((r) => r.name !== requester.name);
    localStorage.setItem(`group_requests_${group.id}`, JSON.stringify(requests));
    setGroups([...groups]);
  };

  // Delete group from backend + localStorage
  const handleDeleteGroup = async (groupId) => {
    const confirmed = window.confirm("Are you sure you want to delete this group? This cannot be undone.");
    if (!confirmed) return;

    try {
      await deleteGroup(groupId);

      localStorage.removeItem(`group_members_${groupId}`);
      localStorage.removeItem(`group_requests_${groupId}`);
      localStorage.removeItem(`chat_group_${groupId}`);
      localStorage.removeItem(`online_group_${groupId}`);

      const createdGroups = JSON.parse(localStorage.getItem("createdGroups") || "[]");
      localStorage.setItem("createdGroups", JSON.stringify(
        createdGroups.filter((g) => String(g.id) !== String(groupId))
      ));

      setGroups(groups.filter((g) => String(g.id) !== String(groupId)));
      alert("Group deleted successfully!");
    } catch (error) {
      console.error("Error deleting group:", error);
      alert("Error deleting group");
    }
  };

  const handleSaveEdit = (groupId) => {
    if (!editForm.groupName || !editForm.subject || !editForm.description) {
      alert("Please fill all fields");
      return;
    }
    setGroups(groups.map((g) =>
      String(g.id) === String(groupId) ? { ...g, ...editForm } : g
    ));
    setEditingGroup(null);
    alert("Group updated!");
  };

  const subjects = ["All", ...new Set(groups.map((g) => g.subject).filter(Boolean))];

  const filteredGroups = groups.filter((group) => {
    const matchesSearch =
      group.groupName?.toLowerCase().includes(search.toLowerCase()) ||
      group.subject?.toLowerCase().includes(search.toLowerCase()) ||
      group.description?.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = filterSubject === "All" || group.subject === filterSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div style={{ width: "min(680px, calc(100vw - 32px))" }}>

      {/* Header + Search */}
      <div style={{
        background: "var(--surface)", borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-lg)", border: "1px solid var(--border)",
        padding: "28px 32px", marginBottom: "20px", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg, var(--accent), var(--gold))" }} />

        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", marginBottom: "6px" }}>
          Study Groups
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: "0 0 22px" }}>
          {groups.length} groups available
        </p>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: "12px" }}>
          <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "1rem", pointerEvents: "none" }}>🔍</span>
          <input
            type="text"
            placeholder="Search by name, subject or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "12px 16px 12px 42px",
              fontFamily: "'DM Sans', sans-serif", fontSize: "0.938rem",
              color: "var(--text)", background: "var(--surface-alt)",
              border: "1.5px solid var(--border)", borderRadius: "8px", outline: "none",
            }}
            onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px rgba(192,57,43,0.10)"; }}
            onBlur={(e) => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
          />
          {search && (
            <span onClick={() => setSearch("")} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", fontSize: "1rem", color: "var(--text-muted)" }}>✕</span>
          )}
        </div>

        {/* Subject Pills */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {subjects.map((subject) => (
            <button key={subject} onClick={() => setFilterSubject(subject)} style={{
              padding: "6px 14px", borderRadius: "20px", border: "1.5px solid",
              borderColor: filterSubject === subject ? "var(--accent)" : "var(--border)",
              background: filterSubject === subject ? "var(--accent-soft)" : "transparent",
              color: filterSubject === subject ? "var(--accent)" : "var(--text-muted)",
              fontFamily: "'DM Sans', sans-serif", fontWeight: "600", fontSize: "0.8rem",
              cursor: "pointer", transition: "all 0.2s", width: "auto", marginTop: "0", boxShadow: "none",
            }}>
              {subject}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {(search || filterSubject !== "All") && (
        <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "12px", paddingLeft: "4px" }}>
          Showing <strong style={{ color: "var(--text)" }}>{filteredGroups.length}</strong> result{filteredGroups.length !== 1 ? "s" : ""}
          {search && <> for "<strong style={{ color: "var(--accent)" }}>{search}</strong>"</>}
        </div>
      )}

      {/* Group Cards */}
      {filteredGroups.length === 0 ? (
        <div style={{
          background: "var(--surface)", borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border)", padding: "48px 32px",
          textAlign: "center", boxShadow: "var(--shadow-md)",
        }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🔍</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", marginBottom: "8px" }}>No groups found</div>
          <button onClick={() => { setSearch(""); setFilterSubject("All"); }} style={{ width: "auto", padding: "10px 24px", fontSize: "0.875rem" }}>
            Clear Filters
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {filteredGroups.map((group) => {
            const alreadyJoined = joinedIds.find((g) => g.id === group.id);
            const memberCount = getMemberCount(group.id);
            const pendingRequests = getPendingRequests(group.id);
            const isEditing = editingGroup === group.id;
            const pending = hasPendingRequest(group.id);

            return (
              <div key={group.id} style={{
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)", padding: "22px 26px",
                boxShadow: "var(--shadow-sm)", transition: "box-shadow 0.2s, transform 0.2s",
              }}
                onMouseOver={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-md)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseOut={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-sm)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                {isEditing ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <input
                      value={editForm.groupName}
                      onChange={(e) => setEditForm({ ...editForm, groupName: e.target.value })}
                      placeholder="Group Name"
                      style={{ padding: "10px 14px", borderRadius: "8px", border: "1.5px solid var(--border)", fontFamily: "'DM Sans', sans-serif", fontSize: "0.9rem", outline: "none" }}
                    />
                    <input
                      value={editForm.subject}
                      onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                      placeholder="Subject"
                      style={{ padding: "10px 14px", borderRadius: "8px", border: "1.5px solid var(--border)", fontFamily: "'DM Sans', sans-serif", fontSize: "0.9rem", outline: "none" }}
                    />
                    <input
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      placeholder="Description"
                      style={{ padding: "10px 14px", borderRadius: "8px", border: "1.5px solid var(--border)", fontFamily: "'DM Sans', sans-serif", fontSize: "0.9rem", outline: "none" }}
                    />
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button onClick={() => handleSaveEdit(group.id)} style={{ flex: 1, padding: "10px", background: "var(--green)", fontSize: "0.875rem" }}>
                        Save Changes
                      </button>
                      <button onClick={() => setEditingGroup(null)} style={{ flex: 1, padding: "10px", background: "var(--border)", color: "var(--text-muted)", fontSize: "0.875rem" }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>

                        {/* Badges */}
                        <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px", flexWrap: "wrap" }}>
                          <div style={{
                            padding: "3px 10px", background: "var(--gold-soft)", color: "var(--gold)",
                            borderRadius: "20px", fontSize: "0.75rem", fontWeight: "600",
                            textTransform: "uppercase", letterSpacing: "0.05em",
                          }}>
                            {group.subject}
                          </div>
                          {group.isPrivate && (
                            <div style={{
                              padding: "3px 10px", background: "#f0f0ff", color: "#6366f1",
                              borderRadius: "20px", fontSize: "0.75rem", fontWeight: "600",
                            }}>
                              🔒 Private
                            </div>
                          )}
                        </div>

                        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.15rem", color: "var(--text)", margin: "0 0 6px" }}>
                          {group.groupName}
                        </h3>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: "0 0 10px", lineHeight: "1.5" }}>
                          {group.description}
                        </p>

                        {/* Member count */}
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                          👥 <strong style={{ color: "var(--text)" }}>{memberCount}</strong> member{memberCount !== 1 ? "s" : ""}
                          {group.createdByName && (
                            <span style={{ marginLeft: "10px" }}>· Created by <strong>{group.createdByName}</strong></span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginLeft: "16px", flexShrink: 0 }}>

                        <button
                          onClick={() => handleJoin(group)}
                          style={{
                            width: "auto", padding: "9px 20px", fontSize: "0.85rem", marginTop: "0",
                            background: alreadyJoined ? "var(--green)" : pending ? "var(--gold)" : "var(--accent)",
                            boxShadow: "none",
                          }}
                        >
                          {alreadyJoined ? "Open Chat" : pending ? "⏳ Pending" : group.isPrivate ? "Request to Join" : "Join Group"}
                        </button>

                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            onClick={() => { setEditingGroup(group.id); setEditForm({ groupName: group.groupName, subject: group.subject, description: group.description }); }}
                            style={{
                              flex: 1, padding: "7px 12px", fontSize: "0.78rem", marginTop: "0",
                              background: "var(--surface-alt)", color: "var(--text)",
                              border: "1px solid var(--border)", boxShadow: "none",
                            }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDeleteGroup(group.id)}
                            style={{
                              flex: 1, padding: "7px 12px", fontSize: "0.78rem", marginTop: "0",
                              background: "#fef2f2", color: "#dc2626",
                              border: "1px solid #fecaca", boxShadow: "none",
                            }}
                          >
                            🗑 Delete
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Pending Join Requests */}
                    {pendingRequests.length > 0 && (
                      <div style={{
                        marginTop: "16px", padding: "14px 16px",
                        background: "var(--surface-alt)", borderRadius: "10px",
                        border: "1px solid var(--border)",
                      }}>
                        <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--text)", marginBottom: "10px" }}>
                          📬 Pending Requests ({pendingRequests.length})
                        </div>
                        {pendingRequests.map((req) => (
                          <div key={req.name} style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "8px 0", borderBottom: "1px solid var(--border)",
                          }}>
                            <div>
                              <div style={{ fontSize: "0.875rem", fontWeight: "600" }}>{req.name}</div>
                              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{req.email}</div>
                            </div>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button
                                onClick={() => handleAcceptRequest(group, req)}
                                style={{
                                  padding: "5px 14px", fontSize: "0.78rem", marginTop: "0",
                                  background: "var(--green)", boxShadow: "none", width: "auto",
                                }}
                              >
                                ✓ Accept
                              </button>
                              <button
                                onClick={() => handleRejectRequest(group, req)}
                                style={{
                                  padding: "5px 14px", fontSize: "0.78rem", marginTop: "0",
                                  background: "#fef2f2", color: "#dc2626",
                                  border: "1px solid #fecaca", boxShadow: "none", width: "auto",
                                }}
                              >
                                ✕ Reject
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Dashboard;