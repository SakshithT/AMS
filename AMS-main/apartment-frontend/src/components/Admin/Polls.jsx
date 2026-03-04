import React, { useState } from "react";
import axiosInstance from "../../utils/axiosConfig";
import "./AdminShared.css";

export default function ManagePolls({ polls, loadPolls }) {
  const [editingId, setEditingId] = useState(null);

  const [pollData, setPollData] = useState({
    question: "",
    status: "OPEN"
  });

  const resetForm = () => {
    setEditingId(null);
    setPollData({
      question: "",
      status: "OPEN"
    });
  };

  // CREATE / UPDATE POLL
  const handleSubmitPoll = async () => {
    try {
      if (!pollData.question) {
        return alert("Question is required");
      }

      const pollPayload = {
        question: pollData.question,
        status: pollData.status,
        yesVotes: 0,
        noVotes: 0
      };

      if (editingId) {
        await axiosInstance.put(`/polls/${editingId}`, pollPayload);
        alert("Poll updated successfully");
      } else {
        await axiosInstance.post("/polls/create", pollPayload);
        alert("Poll created successfully");
      }

      loadPolls();
      resetForm();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to save poll");
    }
  };

  // EDIT
  const handleEditPoll = (poll) => {
    setPollData({
      question: poll.question,
      status: poll.status
    });
    setEditingId(poll.id);
  };

  // DELETE
  const handleDeletePoll = async (id) => {
    if (!window.confirm("Delete this poll?")) return;
    try {
      await axiosInstance.delete(`/polls/${id}`);
      loadPolls();
    } catch (error) {
      alert("Failed to delete poll");
    }
  };

  // CLOSE / OPEN POLL
  const toggleStatus = async (poll) => {
    try {
      const newStatus = poll.status === "OPEN" ? "CLOSED" : "OPEN";
      await axiosInstance.put(`/polls/${poll.id}`, {
        ...poll,
        status: newStatus
      });
      loadPolls();
    } catch (error) {
      alert("Failed to update poll status");
    }
  };

  // VOTE
  const handleVote = async (pollId, voteType) => {
    try {
      const poll = polls.find(p => p.id === pollId);
      if (poll.status === "CLOSED") {
        alert("This poll is closed");
        return;
      }
      
      await axiosInstance.put(`/polls/${pollId}/vote`, { voteType });
      loadPolls();
    } catch (error) {
      alert("Failed to vote");
    }
  };

  return (
    <div className="admin-card fade-in-up">
      <h3 className="section-title">
        {editingId ? "Edit Poll" : "Create Poll"}
      </h3>

      <div className="inline-form">
        <input
          className="form-input"
          placeholder="Poll Question (e.g., Should we organize a community event?)"
          value={pollData.question}
          onChange={(e) =>
            setPollData({ ...pollData, question: e.target.value })
          }
        />

        <select
          className="form-select"
          value={pollData.status}
          onChange={(e) =>
            setPollData({ ...pollData, status: e.target.value })
          }
        >
          <option value="OPEN">Open</option>
          <option value="CLOSED">Closed</option>
        </select>

        <button className="btn btn-primary" onClick={handleSubmitPoll}>
          {editingId ? "Update Poll" : "Create Poll"}
        </button>

        {editingId && (
          <button className="btn btn-secondary" onClick={resetForm}>
            Cancel
          </button>
        )}
      </div>

      <hr className="divider" />

      <h3 className="section-title">Community Polls</h3>

      <ul className="data-list">
        {polls.length === 0 ? (
          <li className="data-list-item">
            <p>No polls created yet.</p>
          </li>
        ) : (
          polls.map((poll) => (
            <li key={poll.id} className="data-list-item">
              <div>
                <strong>{poll.question}</strong>
                <br />

                <div style={{ marginTop: "12px", display: "flex", gap: "15px", alignItems: "center" }}>
                  <span 
                    className="badge badge-success" 
                    style={{ padding: "8px 16px", cursor: poll.status === "OPEN" ? "pointer" : "not-allowed" }}
                    onClick={() => poll.status === "OPEN" && handleVote(poll.id, "YES")}
                  >
                    ✓ Yes: {poll.yesVotes || 0}
                  </span>
                  <span 
                    className="badge badge-danger"
                    style={{ padding: "8px 16px", cursor: poll.status === "OPEN" ? "pointer" : "not-allowed" }}
                    onClick={() => poll.status === "OPEN" && handleVote(poll.id, "NO")}
                  >
                    ✕ No: {poll.noVotes || 0}
                  </span>
                </div>

                <span
                  className={`badge ${
                    poll.status === "OPEN"
                      ? "badge-active"
                      : "badge-neutral"
                  } ml-10`}
                  style={{ marginTop: "10px", display: "inline-block" }}
                >
                  {poll.status}
                </span>
              </div>

              <div className="action-buttons">
                <button
                  className="btn btn-warning"
                  onClick={() => handleEditPoll(poll)}
                >
                  Edit
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={() => toggleStatus(poll)}
                >
                  {poll.status === "OPEN" ? "Close" : "Open"}
                </button>

                <button
                  className="btn btn-danger"
                  onClick={() => handleDeletePoll(poll.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

