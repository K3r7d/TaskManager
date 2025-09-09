import React from "react";

const TaskCard = ({ task, onDelete }) => (
  <div style={{ border: "1px solid #ccc", padding: "10px", margin: "10px 0" }}>
    <h3>{task.title}</h3>
    <p>{task.description}</p>
    <button onClick={() => onDelete(task.id)}>Delete</button>
  </div>
);

export default TaskCard;
