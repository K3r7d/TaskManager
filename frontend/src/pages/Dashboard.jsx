import React, { useState, useEffect } from "react";
import API from "../api";
import Navbar from "../components/Navbar";
import TaskCard from "../components/TaskCard";

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const fetchTasks = async () => {
    try {
      const res = await API.get("/tasks", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async () => {
    if (!title || !description) {
      setError("Title and description are required.");
      return;
    }
    setError("");
    try {
      const res = await API.post(
        "/tasks",
        { title, description },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setTasks([...tasks, res.data]);
      setTitle("");
      setDescription("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await API.delete(`/tasks/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTasks(tasks.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ padding: "40px", maxWidth: "900px", margin: "0 auto" }}>
        <h2 style={{ marginBottom: "20px", color: "#333" }}>Dashboard</h2>

        {/* Add Task Form */}
        <div style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0px 4px 20px rgba(0,0,0,0.05)",
          marginBottom: "30px",
          display: "flex",
          flexDirection: "column",
          gap: "10px"
        }}>
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              width: "100%",
            }}
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              width: "100%",
              resize: "vertical",
            }}
          />
          {error && <p style={{ color: "red", fontSize: "0.9rem" }}>{error}</p>}
          <button
            onClick={handleAddTask}
            style={{
              padding: "10px",
              borderRadius: "4px",
              border: "none",
              backgroundColor: "#4CAF50",
              color: "#fff",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            Add Task
          </button>
        </div>

        {/* Task List */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "20px"
        }}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onDelete={handleDeleteTask} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
