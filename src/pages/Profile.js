import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

function Profile() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("profile"); // profile | password | danger
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Edit profile state
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAvatar, setEditAvatar] = useState(null);
  const [saveMsg, setSaveMsg] = useState("");

  // Change password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // Delete account state
  const [deleteConfirm, setDeleteConfirm] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("loggedInUser");
    if (!saved) { navigate("/login"); return; }
    const parsed = JSON.parse(saved);
    setUser(parsed);
    setEditName(parsed.name || "");
    setEditBio(parsed.bio || "");
    setEditAvatar(parsed.avatar || null);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/login");
  };

  // Save profile
  const handleSaveProfile = () => {
    if (!editName.trim()) { setSaveMsg("❌ Name cannot be empty"); return; }
    const updated = { ...user, name: editName.trim(), bio: editBio.trim(), avatar: editAvatar };
    localStorage.setItem("loggedInUser", JSON.stringify(updated));
    setUser(updated);
    setSaveMsg("✅ Profile updated successfully!");
    setTimeout(() => setSaveMsg(""), 3000);
  };

  // Avatar upload
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditAvatar(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Change password
  const handleChangePassword = () => {
    setPasswordMsg("");
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordMsg("❌ Please fill all fields"); return;
    }
    const saved = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
    if (saved.password && saved.password !== currentPassword) {
      setPasswordMsg("❌ Current password is incorrect"); return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg("❌ New password must be at least 6 characters"); return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordMsg("❌ New passwords do not match"); return;
    }
    const updated = { ...user, password: newPassword };
    localStorage.setItem("loggedInUser", JSON.stringify(updated));
    setUser(updated);
    setCurrentPassword(""); setNewPassword(""); setConfirmNewPassword("");
    setPasswordMsg("✅ Password changed successfully!");
    setTimeout(() => setPasswordMsg(""), 3000);
  };

  // Delete account
  const handleDeleteAccount = () => {
    if (deleteConfirm !== user.name) {
      alert("Please type your name exactly to confirm deletion"); return;
    }
    localStorage.removeItem("loggedInUser");
    navigate("/register");
  };

  if (!user) return null;

  const joinedGroups = user.joinedGroups || [];
  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const tabStyle = (tab) => ({
    padding: "10px 22px",
    border: "none",
    borderRadius: "8px",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: "600",
    fontSize: "0.875rem",
    cursor: "pointer",
    transition: "all 0.2s",
    background: activeTab === tab ? "var(--accent)" : "transparent",
    color: activeTab === tab ? "#fff" : "var(--text-muted)",
    width: "auto",
    marginTop: "0",
    boxShadow: activeTab === tab ? "0 2px 8px rgba(192,57,43,0.25)" : "none",
  });

  const inputStyle = {
    width: "100%",
    padding: "11px 16px",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.938rem",
    color: "var(--text)",
    background: "var(--surface-alt)",
    border: "1.5px solid var(--border)",
    borderRadius: "8px",
    outline: "none",
    marginBottom: "14px",
  };

  const labelStyle = {
    fontSize: "0.8rem",
    fontWeight: "600",
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    display: "block",
    marginBottom: "6px",
  };

  return (
    <div style={{
      width: "min(680px, calc(100vw - 32px))",
      display: "flex",
      flexDirection: "column",
      gap: "20px",
      animation: "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
    }}>

      {/* ── Profile Header Card ── */}
      <div style={{
        background: "var(--surface)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-lg)",
        border: "1px solid var(--border)",
        overflow: "hidden",
      }}>
        {/* Banner */}
        <div style={{
          height: "80px",
          background: "linear-gradient(135deg, var(--accent), var(--gold))",
        }} />

        <div style={{ padding: "0 28px 24px" }}>
          {/* Avatar */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: "72px", height: "72px",
                borderRadius: "50%",
                background: editAvatar ? "transparent" : "var(--text)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.4rem",
                fontFamily: "'Playfair Display', serif",
                fontWeight: "700",
                marginTop: "-36px",
                border: "4px solid var(--surface)",
                boxShadow: "var(--shadow-md)",
                cursor: "pointer",
                overflow: "hidden",
                position: "relative",
              }}
              title="Click to change photo"
            >
              {editAvatar
                ? <img src={editAvatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : initials
              }
              {/* Hover overlay */}
              <div style={{
                position: "absolute", inset: 0,
                background: "rgba(0,0,0,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                opacity: 0,
                transition: "opacity 0.2s",
                fontSize: "0.7rem",
                fontFamily: "'DM Sans', sans-serif",
              }}
                onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                onMouseOut={(e) => e.currentTarget.style.opacity = 0}
              >
                Edit
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />

            <button onClick={handleLogout} style={{
              padding: "8px 18px",
              background: "transparent",
              border: "1.5px solid var(--border)",
              borderRadius: "8px",
              color: "var(--text-muted)",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: "600",
              fontSize: "0.8rem",
              cursor: "pointer",
              width: "auto",
              marginTop: "0",
            }}>
              Logout
            </button>
          </div>

          <div style={{ marginTop: "12px" }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", margin: "0 0 3px" }}>
              {user.name}
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: "0 0 6px" }}>
              {user.email}
            </p>
            {user.bio && (
              <p style={{ color: "var(--text)", fontSize: "0.875rem", margin: 0, fontStyle: "italic" }}>
                "{user.bio}"
              </p>
            )}
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: "12px", marginTop: "18px" }}>
            {[
              { value: joinedGroups.length, label: "Groups Joined", color: "var(--accent)" },
              { value: joinedGroups.length > 0 ? "Active" : "New", label: "Status", color: "var(--green)" },
            ].map((stat) => (
              <div key={stat.label} style={{
                flex: 1, background: "var(--surface-alt)",
                border: "1px solid var(--border)", borderRadius: "var(--radius)",
                padding: "14px", textAlign: "center",
              }}>
                <div style={{ fontSize: "1.6rem", fontFamily: "'Playfair Display', serif", fontWeight: "700", color: stat.color }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "3px" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{
        background: "var(--surface)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-lg)",
        border: "1px solid var(--border)",
        overflow: "hidden",
      }}>
        {/* Tab Bar */}
        <div style={{
          display: "flex", gap: "6px", padding: "14px 20px",
          borderBottom: "1px solid var(--border)",
          background: "var(--surface-alt)",
        }}>
          <button style={tabStyle("profile")} onClick={() => setActiveTab("profile")}>✏️ Edit Profile</button>
          <button style={tabStyle("password")} onClick={() => setActiveTab("password")}>🔒 Password</button>
          <button style={tabStyle("groups")} onClick={() => setActiveTab("groups")}>📚 My Groups</button>
          <button style={{...tabStyle("danger"), color: activeTab === "danger" ? "#fff" : "#e74c3c", background: activeTab === "danger" ? "#e74c3c" : "transparent"}} onClick={() => setActiveTab("danger")}>🗑 Delete</button>
        </div>

        <div style={{ padding: "28px" }}>

          {/* ── Edit Profile Tab ── */}
          {activeTab === "profile" && (
            <div>
              <label style={labelStyle}>Full Name</label>
              <input
                style={inputStyle}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Your full name"
              />

              <label style={labelStyle}>Bio</label>
              <textarea
                style={{ ...inputStyle, height: "90px", resize: "vertical" }}
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Tell others about yourself..."
              />

              <label style={labelStyle}>Profile Picture</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: "2px dashed var(--border)",
                  borderRadius: "8px",
                  padding: "20px",
                  textAlign: "center",
                  cursor: "pointer",
                  marginBottom: "18px",
                  color: "var(--text-muted)",
                  fontSize: "0.875rem",
                  transition: "border-color 0.2s",
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = "var(--accent)"}
                onMouseOut={(e) => e.currentTarget.style.borderColor = "var(--border)"}
              >
                {editAvatar ? "✅ Photo selected — click to change" : "📷 Click to upload a photo"}
              </div>

              {saveMsg && (
                <div style={{
                  padding: "10px 16px", borderRadius: "8px", marginBottom: "14px",
                  background: saveMsg.includes("✅") ? "var(--green-soft)" : "var(--accent-soft)",
                  color: saveMsg.includes("✅") ? "var(--green)" : "var(--accent)",
                  fontSize: "0.875rem", fontWeight: "500",
                }}>
                  {saveMsg}
                </div>
              )}

              <button onClick={handleSaveProfile} style={{ width: "100%", padding: "12px" }}>
                Save Changes
              </button>
            </div>
          )}

          {/* ── Change Password Tab ── */}
          {activeTab === "password" && (
            <div>
              <label style={labelStyle}>Current Password</label>
              <div style={{ position: "relative", marginBottom: "14px" }}>
                <input
                  style={{ ...inputStyle, marginBottom: 0, paddingRight: "48px" }}
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
                <span
                  onClick={() => setShowCurrent(!showCurrent)}
                  style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", fontSize: "1rem" }}
                >
                  {showCurrent ? "🙈" : "👁️"}
                </span>
              </div>

              <label style={labelStyle}>New Password</label>
              <div style={{ position: "relative", marginBottom: "14px" }}>
                <input
                  style={{ ...inputStyle, marginBottom: 0, paddingRight: "48px" }}
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
                <span
                  onClick={() => setShowNew(!showNew)}
                  style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", fontSize: "1rem" }}
                >
                  {showNew ? "🙈" : "👁️"}
                </span>
              </div>

              <label style={labelStyle}>Confirm New Password</label>
              <input
                style={inputStyle}
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Confirm new password"
              />

              {/* Password strength */}
              {newPassword && (
                <div style={{ marginBottom: "14px" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px" }}>
                    Password strength
                  </div>
                  <div style={{ height: "4px", background: "var(--border)", borderRadius: "99px", overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: "99px",
                      width: newPassword.length < 6 ? "25%" : newPassword.length < 10 ? "60%" : "100%",
                      background: newPassword.length < 6 ? "var(--accent)" : newPassword.length < 10 ? "var(--gold)" : "var(--green)",
                      transition: "all 0.3s",
                    }} />
                  </div>
                </div>
              )}

              {passwordMsg && (
                <div style={{
                  padding: "10px 16px", borderRadius: "8px", marginBottom: "14px",
                  background: passwordMsg.includes("✅") ? "var(--green-soft)" : "var(--accent-soft)",
                  color: passwordMsg.includes("✅") ? "var(--green)" : "var(--accent)",
                  fontSize: "0.875rem", fontWeight: "500",
                }}>
                  {passwordMsg}
                </div>
              )}

              <button onClick={handleChangePassword} style={{ width: "100%", padding: "12px" }}>
                Update Password
              </button>
            </div>
          )}

          {/* ── My Groups Tab ── */}
          {activeTab === "groups" && (
            <div>
              {joinedGroups.length === 0 ? (
                <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "30px 0", fontSize: "0.875rem" }}>
                  You haven't joined any groups yet.{" "}
                  <span onClick={() => navigate("/dashboard")} style={{ color: "var(--accent)", cursor: "pointer", fontWeight: "600" }}>
                    Browse Groups →
                  </span>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {joinedGroups.map((group) => (
                    <div
                      key={group.id}
                      onClick={() => navigate(`/group/${group.id}`)}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "14px 18px",
                        background: "var(--surface-alt)", border: "1px solid var(--border)",
                        borderRadius: "var(--radius)", cursor: "pointer", transition: "all 0.2s",
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.transform = "translateX(4px)"; }}
                      onMouseOut={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateX(0)"; }}
                    >
                      <div>
                        <div style={{ fontWeight: "600", fontSize: "0.938rem" }}>{group.groupName}</div>
                        <div style={{ fontSize: "0.78rem", color: "var(--gold)", marginTop: "2px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          {group.subject}
                        </div>
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "var(--accent)", fontWeight: "600" }}>
                        Open Chat →
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Delete Account Tab ── */}
          {activeTab === "danger" && (
            <div>
              <div style={{
                background: "#fef2f2", border: "1px solid #fecaca",
                borderRadius: "var(--radius)", padding: "16px", marginBottom: "24px",
              }}>
                <div style={{ fontWeight: "700", color: "#dc2626", marginBottom: "6px", fontSize: "0.938rem" }}>
                  ⚠️ Danger Zone
                </div>
                <p style={{ color: "#7f1d1d", fontSize: "0.875rem", margin: 0, lineHeight: "1.6" }}>
                  This action is <strong>permanent</strong> and cannot be undone. All your data,
                  joined groups and messages will be deleted forever.
                </p>
              </div>

              <label style={labelStyle}>Type your name to confirm: <strong>{user.name}</strong></label>
              <input
                style={{ ...inputStyle, borderColor: deleteConfirm && deleteConfirm !== user.name ? "#dc2626" : "var(--border)" }}
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder={`Type "${user.name}" to confirm`}
              />

              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== user.name}
                style={{
                  width: "100%", padding: "12px",
                  background: deleteConfirm === user.name ? "#dc2626" : "var(--border)",
                  color: deleteConfirm === user.name ? "#fff" : "var(--text-muted)",
                  border: "none", borderRadius: "8px",
                  fontFamily: "'DM Sans', sans-serif", fontWeight: "600",
                  fontSize: "0.938rem", cursor: deleteConfirm === user.name ? "pointer" : "not-allowed",
                  transition: "all 0.2s",
                }}
              >
                Delete My Account Permanently
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Profile;