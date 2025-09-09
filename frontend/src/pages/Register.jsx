import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await API.post("/register", { email, password });
      alert("Register successful");
      navigate("/login");
    } catch (err) {
      alert("Register failed");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} /><br/>
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} /><br/>
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
