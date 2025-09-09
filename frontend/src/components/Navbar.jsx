import React from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav style={{ padding: "10px", background: "#333", color: "#fff" }}>
      <span style={{ marginRight: "20px" }}>Task Manager</span>
      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
};

export default Navbar;
