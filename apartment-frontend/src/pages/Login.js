import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosConfig";
import "./Login.css";

// Ghost states: 'idle' | 'typing' | 'error' | 'success'
function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [ghostState, setGhostState] = useState("idle");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [failCount, setFailCount] = useState(0);
  const navigate = useNavigate();

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (ghostState !== "error" && ghostState !== "success") {
      setGhostState(e.target.value.length > 0 ? "typing" : "idle");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await axiosInstance.post("/auth/login", {
        username,
        password,
      });

      const token = response.data.data;
      localStorage.setItem("token", token);
      setFailCount(0);
      setGhostState("success");
      setMessage("Login Successful! 🎉");

      setTimeout(() => {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const role = payload.role;
        if (role === "ROLE_ADMIN") navigate("/Admin/AdminDashboard");
        else if (role === "ROLE_SECURITY") navigate("/Security/SecurityDashboard");
        else navigate("/Resident/ResidentDashboard");
      }, 1500);
    } catch (error) {
      setFailCount(prev => prev + 1);
      setGhostState("error");
      setMessage(error.response?.data?.message || "Wrong Password! Try again.");
      setTimeout(() => {
        setGhostState("idle");
        setMessage("");
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const getVideoSource = () => {
    if (ghostState === "success") return "/correct.mp4";
    if (ghostState === "error") {
      return failCount === 1 ? "/wrong.mp4" : "/againwrong.mp4";
    }
    return "/1026.mp4";
  };

  const getGhostSpeech = () => {
    if (ghostState === "error") return "Wrong Password!";
    if (ghostState === "success") return "Welcome! 🎃";
    if (ghostState === "typing") return "Hmm...";
    return "Sign in!";
  };

  return (
    <div className="spooky-wrapper">
      {/* Background floating particles */}
      <div className="bg-particles">
        {[...Array(8)].map((_, i) => (
          <div key={i} className={`particle particle-${i + 1}`}>👻</div>
        ))}
      </div>

      <div className="spooky-container">
        {/* Ghost Section */}
        <div className="image-panel">
          <video
            key={getVideoSource()} /* Force video reload when source changes */
            autoPlay
            loop={ghostState === "idle" || ghostState === "typing"}
            muted
            playsInline
          >
            <source src={getVideoSource()} type="video/mp4" />
          </video>
        </div>

        {/* Login Panel */}
        <div className="login-panel">
          <h2>Sign In</h2>
          <p>Apartment Management System</p>

          <form onSubmit={handleLogin} className="spooky-form">
            <div className="field-group">
              <label>Username</label>
              <input
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`spooky-input ${ghostState === "error" ? "input-error" : ""} ${ghostState === "success" ? "input-success" : ""}`}
                required
              />
            </div>

            <div className="field-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••"
                value={password}
                onChange={handlePasswordChange}
                className={`spooky-input ${ghostState === "error" ? "input-error" : ""} ${ghostState === "success" ? "input-success" : ""}`}
                required
              />
            </div>

            <button
              type="submit"
              className={`spooky-btn ${ghostState === "success" ? "btn-success" : ""} ${ghostState === "error" ? "btn-error" : ""}`}
              disabled={loading}
            >
              {loading ? "Checking..." : "Sign In"}
            </button>
          </form>

          {/* Status Message */}
          {message && (
            <div className={`status-message ${ghostState === "error" ? "msg-error" : "msg-success"}`}>
              {message}
            </div>
          )}

          <div className="spooky-links">
            <span onClick={() => navigate("/forgot-password")}>Forgot Password?</span>
            <span onClick={() => navigate("/signup")}>New Resident?</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;