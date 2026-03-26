import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import './App.css';
import { useState, useEffect } from "react";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateGroup from "./pages/CreateGroup";
import Chat from "./pages/Chat";
import GroupDetail from "./pages/GroupDetail";
import Profile from "./pages/Profile";

function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("loggedInUser");
    if (saved) setUser(JSON.parse(saved));

    // Listen for login event
    const handleLogin = () => {
      const saved = localStorage.getItem("loggedInUser");
      if (saved) setUser(JSON.parse(saved));
    };

    // Listen for storage changes (other tabs)
    const handleStorage = () => {
      const saved = localStorage.getItem("loggedInUser");
      if (saved) setUser(JSON.parse(saved));
      else setUser(null);
    };

    window.addEventListener("userLoggedIn", handleLogin);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("userLoggedIn", handleLogin);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <nav style={{ textAlign: "center", marginBottom: "20px" }}>
      {!user ? (
        <>
          <Link to="/register">Register</Link> |{" "}
          <Link to="/login">Login</Link>
        </>
      ) : (
        <>
          <span style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            👋 Hi, <strong>{user.name}</strong>
          </span> |{" "}
          <Link to="/dashboard">Groups</Link> |{" "}
          <Link to="/create-group">Create Group</Link> |{" "}
          <Link to="/profile">Profile</Link> |{" "}
          <Link to="/chat">Chat</Link> |{" "}
          <button
            onClick={handleLogout}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-primary)",
              cursor: "pointer",
              textDecoration: "underline",
              padding: 0,
              font: "inherit"
            }}
          >
            Logout
          </button>
        </>
      )}
    </nav>
  );
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div>
        <h1 style={{ textAlign: "center" }}>Study Group Finder</h1>
        <Navbar />
        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-group" element={<CreateGroup />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/group/:groupId" element={<GroupDetail />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;