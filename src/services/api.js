const API_BASE = "http://localhost:8080";

// Register API
export const registerUser = async (user) => {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(user)
  });

  return response.json();
};

// Login API
export const loginUser = async (user) => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(user)
  });

  return response.json();
};

// Get Study Groups
export const getGroups = async () => {
  const response = await fetch(`${API_BASE}/groups`);
  return response.json();
};

// Create Study Group
export const createGroup = async (group) => {
  const response = await fetch(`${API_BASE}/groups/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(group)
  });

  return response.json();
};

// Join Group
export const joinGroup = async (data) => {
  const response = await fetch(`${API_BASE}/groups/join`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return response.json();
};

// Send Message
export const sendMessage = async (data) => {
  const response = await fetch(`${API_BASE}/messages/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return response.json();
};

// Get Messages of a Group
export const getMessages = async (groupId) => {
  const response = await fetch(`${API_BASE}/messages/group/${groupId}`);
  return response.json();
};