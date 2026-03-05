import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosConfig";
import "./ResidentPolls.css"; // We will create this file

export default function ResidentPolls() {
    const [polls, setPolls] = useState([]);

    useEffect(() => {
        loadPolls();
    }, []);

    const loadPolls = async () => {
        try {
            const response = await axiosInstance.get("/resident/polls");
            setPolls(response.data.data);
        } catch (error) {
            console.error("Failed to load polls", error);
        }
    };

    const handleVote = async (pollId, option) => {
        try {
            await axiosInstance.post(`/resident/polls/${pollId}/vote/${option.id}`);
            alert("Vote submitted successfully");
            loadPolls(); // Reload to show updated results or disable voting
        } catch (error) {
            alert(error.response?.data?.message || "Failed to vote");
        }
    };

    return (
        <div className="resident-polls-card fade-in-up">
            <h3 className="section-title">Active Polls</h3>
            <ul className="data-list">
                {polls.length === 0 ? (
                    <li className="data-list-item">
                        <p>No active polls at the moment.</p>
                    </li>
                ) : (
                    polls.map((poll) => (
                        <li key={poll.id} className="data-list-item">
                            <div>
                                <strong>{poll.question}</strong>
                                <div style={{ marginTop: "12px", display: "flex", gap: "15px", alignItems: "center" }}>
                                    {poll.options.map((option) => (
                                        <button
                                            key={option.id}
                                            className="btn btn-primary"
                                            onClick={() => handleVote(poll.id, option)}
                                        >
                                            {option.text}
                                        </button>
                                    ))}
                                </div>                                <span
                                    className={`badge ${poll.status === "ACTIVE" ? "badge-active" : "badge-neutral"}`}
                                    style={{ marginTop: "10px", display: "inline-block" }}
                                >
                                    {poll.status}
                                </span>
                            </div>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}
