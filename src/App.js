import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import './App.css';

import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateGroup from "./pages/CreateGroup";
import Chat from "./pages/Chat";
import GroupDetail from "./pages/GroupDetail";
import Profile from "./pages/Profile";

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div>
        <h1 style={{textAlign:"center"}}>Study Group Finder</h1>

        <nav style={{textAlign:"center", marginBottom:"20px"}}>
          <Link to="/register">Register</Link> |{" "}
          <Link to="/login">Login</Link> |{" "}
          <Link to="/dashboard">Groups</Link> |{" "}
          <Link to="/create-group">Create Group</Link> |{" "}
          <Link to="/profile">Profile</Link> |{" "}
          <Link to="/chat">Chat</Link>
        </nav>

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