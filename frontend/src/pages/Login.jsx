import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState(""); // only for registration
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await API.post(
        "/auth/login",
        new URLSearchParams({ username, password }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
      localStorage.setItem("token", res.data.access_token);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await API.post("/auth/register", { username, password, email });
      alert("Registration successful! Please login.");
      setIsRegister(false);
    } catch (err) {
      setError("Registration failed. Try a different username/email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      background: "#f5f5f5"
    }}>
      <div style={{
        background: "#fff",
        padding: "40px",
        borderRadius: "8px",
        boxShadow: "0px 4px 20px rgba(0,0,0,0.1)",
        width: "350px",
        textAlign: "center"
      }}>
        <h2 style={{ marginBottom: "20px" }}>{isRegister ? "Register" : "Login"}</h2>
        <form onSubmit={isRegister ? handleRegister : handleLogin}>
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: "100%", padding: "10px", margin: "8px 0", borderRadius: "4px", border: "1px solid #ccc" }}
          />
          {isRegister && (
            <input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: "10px", margin: "8px 0", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          )}
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: "10px", margin: "8px 0", borderRadius: "4px", border: "1px solid #ccc" }}
          />
          {error && <p style={{ color: "red", fontSize: "0.9rem" }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "12px",
              backgroundColor: "#4CAF50",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? (isRegister ? "Registering..." : "Logging in...") : (isRegister ? "Register" : "Login")}
          </button>
        </form>
        <p style={{ marginTop: "15px", fontSize: "0.9rem" }}>
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <span
            style={{ color: "blue", cursor: "pointer" }}
            onClick={() => { setIsRegister(!isRegister); setError(""); }}
          >
            {isRegister ? "Login" : "Register"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
