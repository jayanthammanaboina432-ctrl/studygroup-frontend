import { useState } from "react";
import { loginUser } from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import loginIllustration from "../assets/login.svg"; // Import the SVG file

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please enter email and password"); return; }
    setLoading(true);
    try {
      const result = await loginUser({ email, password });
      localStorage.setItem("loggedInUser", JSON.stringify({
        name: result.name || email.split("@")[0],
        email,
        joinedGroups: [],
      }));
      // Dispatch custom event to update navbar
      window.dispatchEvent(new Event("userLoggedIn"));
      navigate("/dashboard");
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>

      {/* ── Left: Illustration ── */}
      <div style={s.illustrationSide}>
        <div style={s.blob} />
        <div style={s.illustrationContent}>
          {/* Use the imported SVG file */}
          <img 
            src={loginIllustration} 
            alt="Study Group Finder Illustration" 
            style={s.svg} 
          />
          <h2 style={s.illustrationTitle}>Study Group Finder</h2>
          <p style={s.illustrationSub}>Connect · Learn · Grow Together</p>
        </div>
      </div>

      {/* ── Right: Login Card ── */}
      <div style={s.formSide}>
        <div style={s.card}>

          {/* Brand */}
          <div style={s.brandRow}>
            <div style={s.brandIconWrap}>
              <span style={{ fontSize: "1.8rem" }}>📚</span>
            </div>
            <div>
              <div style={s.brandName}>Study Group</div>
              <div style={s.brandTagline}>FINDER</div>
            </div>
          </div>

          <h2 style={s.cardTitle}>LOGIN</h2>

          <form onSubmit={handleSubmit} style={s.form}>

            {/* Email */}
            <div style={s.fieldGroup}>
              <label style={s.label}>
                Email / Username: <span style={{ color: "#c0392b" }}>*</span>
              </label>
              <div style={s.inputWrap}>
                <span style={s.inputIcon}>👤</span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={s.input}
                  onFocus={(e) => { e.target.style.borderColor = "#2563eb"; e.target.style.background = "#fff"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.12)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.background = "#f1f5f9"; e.target.style.boxShadow = "none"; }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={s.fieldGroup}>
              <label style={s.label}>
                Password <span style={{ color: "#c0392b" }}>*</span>
              </label>
              <div style={s.inputWrap}>
                <span style={s.inputIcon}>🔑</span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ ...s.input, paddingRight: "16px" }}
                  onFocus={(e) => { e.target.style.borderColor = "#2563eb"; e.target.style.background = "#fff"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.12)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.background = "#f1f5f9"; e.target.style.boxShadow = "none"; }}
                />
              </div>
            </div>

            {/* Show password + Forgot */}
            <div style={s.checkRow}>
              <label style={s.checkLabel}>
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  style={{ marginRight: "8px", accentColor: "#2563eb", width: "16px", height: "16px", cursor: "pointer" }}
                />
                <strong>Show Password</strong>
              </label>
              <span style={s.forgotLink}>Forgot Password?</span>
            </div>

            {/* Error */}
            {error && (
              <div style={s.errorBox}>⚠️ {error}</div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{ ...s.submitBtn, opacity: loading ? 0.8 : 1 }}
              onMouseOver={(e) => !loading && (e.currentTarget.style.background = "#1d4ed8")}
              onMouseOut={(e) => (e.currentTarget.style.background = "#2563eb")}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p style={s.bottomText}>
            Don't have an account?{" "}
            <Link to="/register" style={s.linkAccent}>Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8fafc",
    fontFamily: "'DM Sans', sans-serif",
    padding: "20px",
    gap: "20px",
  },
  illustrationSide: {
    flex: "1 1 340px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    minHeight: "400px",
  },
  blob: {
    position: "absolute",
    width: "480px",
    height: "480px",
    borderRadius: "50%",
    background: "radial-gradient(circle, #dbeafe 0%, transparent 70%)",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: 0,
  },
  illustrationContent: {
    position: "relative",
    zIndex: 1,
    textAlign: "center",
  },
  svg: {
    width: "min(340px, 90vw)",
    height: "auto",
    filter: "drop-shadow(0 8px 24px rgba(37,99,235,0.10))",
  },
  illustrationTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "1.5rem",
    color: "#1e3a5f",
    marginTop: "12px",
    marginBottom: "4px",
  },
  illustrationSub: {
    color: "#64748b",
    fontSize: "0.85rem",
    letterSpacing: "0.05em",
  },
  formSide: {
    flex: "0 0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: "min(420px, calc(100vw - 40px))",
    background: "#ffffff",
    borderRadius: "16px",
    padding: "44px 40px",
    boxShadow: "0 8px 48px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.05)",
    border: "1px solid #e2e8f0",
    animation: "slideUp 0.4s cubic-bezier(0.16,1,0.3,1)",
  },
  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "24px",
    justifyContent: "center",
  },
  brandIconWrap: {
    width: "52px",
    height: "52px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #c0392b, #96281b)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(192,57,43,0.3)",
  },
  brandName: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "#c0392b",
    lineHeight: 1.1,
  },
  brandTagline: {
    fontSize: "0.65rem",
    fontWeight: "700",
    color: "#1e3a5f",
    letterSpacing: "0.2em",
    marginTop: "3px",
  },
  cardTitle: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "1rem",
    fontWeight: "800",
    color: "#1e293b",
    textAlign: "center",
    letterSpacing: "0.12em",
    marginBottom: "28px",
    paddingBottom: "18px",
    borderBottom: "1px solid #f1f5f9",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },
  label: {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#334155",
  },
  inputWrap: {
    position: "relative",
  },
  inputIcon: {
    position: "absolute",
    left: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "1rem",
    pointerEvents: "none",
    zIndex: 1,
  },
  input: {
    width: "100%",
    padding: "13px 16px 13px 44px",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.938rem",
    color: "#1e293b",
    background: "#f1f5f9",
    border: "1.5px solid #e2e8f0",
    borderRadius: "10px",
    outline: "none",
    transition: "all 0.2s",
    boxSizing: "border-box",
  },
  checkRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "-4px",
  },
  checkLabel: {
    display: "flex",
    alignItems: "center",
    fontSize: "0.875rem",
    color: "#334155",
    cursor: "pointer",
  },
  forgotLink: {
    fontSize: "0.875rem",
    color: "#2563eb",
    cursor: "pointer",
    fontWeight: "500",
    textDecoration: "underline",
  },
  errorBox: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    color: "#dc2626",
    padding: "10px 14px",
    fontSize: "0.85rem",
  },
  submitBtn: {
    width: "100%",
    padding: "14px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: "700",
    fontSize: "1rem",
    cursor: "pointer",
    letterSpacing: "0.04em",
    boxShadow: "0 4px 16px rgba(37,99,235,0.28)",
    transition: "background 0.2s",
    marginTop: "4px",
  },
  bottomText: {
    textAlign: "center",
    fontSize: "0.875rem",
    color: "#64748b",
    marginTop: "24px",
  },
  linkAccent: {
    color: "#2563eb",
    fontWeight: "600",
    textDecoration: "none",
    borderBottom: "1px solid rgba(37,99,235,0.3)",
    paddingBottom: "1px",
  },
};

export default Login;