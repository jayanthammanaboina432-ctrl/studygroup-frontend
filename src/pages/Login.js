import { useState } from "react";
import { loginUser } from "../services/api";
import { useNavigate } from "react-router-dom";

function Login() {

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    const user = { email, password };

    try {
      const result = await loginUser(user);
      console.log(result);

      // Save user info to localStorage
      localStorage.setItem("loggedInUser", JSON.stringify({
        name: result.name || email.split("@")[0],
        email: email,
        joinedGroups: []
      }));

      navigate("/profile");  // ← go to profile after login

    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed");
    }
  };

  return (
    <div className="container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;