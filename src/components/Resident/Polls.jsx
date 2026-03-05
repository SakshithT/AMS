import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosConfig";
import "./ResidentPolls.css";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function ResidentPolls() {
    const [polls, setPolls] = useState([]);
    const [votedPolls, setVotedPolls] = useState({});

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
            // Fetch results after voting
            const resultResponse = await axiosInstance.get(`/polls/${pollId}/results`);
            setVotedPolls(prev => ({
                ...prev,
                [pollId]: resultResponse.data.data
            }));
        } catch (error) {
            alert(error.response?.data?.message || "Failed to vote");
        }
    };

    const colors = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

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
                            <div style={{ width: "100%" }}>
                                <strong>{poll.question}</strong>
                                {!votedPolls[poll.id] ? (
                                    <>
                                        <div style={{ marginTop: "12px", display: "flex", gap: "15px", alignItems: "center", flexWrap: "wrap" }}>
                                            {poll.options.map((option) => (
                                                <button
                                                    key={option.id}
                                                    className="btn btn-primary"
                                                    onClick={() => handleVote(poll.id, option)}
                                                >
                                                    {option.text}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="poll-results-container">
                                        <h4 style={{ marginTop: "15px", marginBottom: "10px" }}>Results</h4>
                                        <div style={{ width: "100%", height: "250px" }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart
                                                    data={votedPolls[poll.id].results.map((r, i) => ({
                                                        name: r.optionText,
                                                        votes: r.voteCount,
                                                        fill: colors[i % colors.length]
                                                    }))}
                                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                                    <YAxis allowDecimals={false} />
                                                    <Tooltip 
                                                        contentStyle={{ 
                                                            backgroundColor: "#fff", 
                                                            border: "1px solid #ddd",
                                                            borderRadius: "8px"
                                                        }}
                                                    />
                                                    <Bar 
                                                        dataKey="votes" 
                                                        radius={[8, 8, 0, 0]}
                                                        animationDuration={1500}
                                                        animationEasing="ease-out"
                                                    >
                                                        {votedPolls[poll.id].results.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div style={{ marginTop: "10px", textAlign: "center" }}>
                                            <span className="badge badge-active">You voted!</span>
                                        </div>
                                    </div>
                                )}
                                <span
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
