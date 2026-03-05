import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosConfig";
import "./AdminShared.css";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";

const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

export default function ManagePolls() {
    const [polls, setPolls] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState(["", ""]);
    const [endDate, setEndDate] = useState("");
    const [results, setResults] = useState(null);
    const [chartType, setChartType] = useState("bar"); // "bar" or "pie"

    useEffect(() => {
        loadPolls();
    }, []);

    const loadPolls = async () => {
        try {
            const response = await axiosInstance.get("/admin/polls");
            setPolls(response.data.data);
        } catch (error) {
            console.error("Failed to load polls", error);
        }
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const addOption = () => {
        setOptions([...options, ""]);
    };

    const removeOption = (index) => {
        const newOptions = options.filter((_, i) => i !== index);
        setOptions(newOptions);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post("/admin/polls", { question, options, endDate });
            alert("Poll created successfully");
            loadPolls();
            setQuestion("");
            setOptions(["", ""]);
            setEndDate("");
        } catch (error) {
            alert(error.response?.data?.message || "Failed to create poll");
        }
    };

    const getResults = async (pollId) => {
        try {
            const response = await axiosInstance.get(`/polls/${pollId}/results`);
            setResults(response.data.data);
        } catch (error) {
            console.error("Failed to get results", error);
        }
    };

    return (
        <div className="admin-card fade-in-up">
            <div className="section-header">
                <h3 className="section-title">Community Polls</h3>
                <button 
                    className="btn btn-primary" 
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? "✕ Close Form" : "+ Create Poll"}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="inline-form fade-in-up">
                    <input
                        className="form-input"
                        placeholder="Poll Question"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        required
                    />
                    <input
                        type="date"
                        className="form-input"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                    />
                    {options.map((option, index) => (
                        <div key={index}>
                            <input
                                className="form-input"
                                placeholder={`Option ${index + 1}`}
                                value={option}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                required
                            />
                            {options.length > 2 && (
                                <button type="button" onClick={() => removeOption(index)}>
                                    Remove
                                </button>
                            )}
                        </div>
                    ))}
                    <button type="button" onClick={addOption}>
                        Add Option
                    </button>
                    <button type="submit" className="btn btn-primary">
                        Create Poll
                    </button>
                </form>
            )}

            <hr className="divider" />

            <h3 className="section-title">Active Polls</h3>
            <ul className="data-list">
                {polls.map((poll) => (
                    <li key={poll.id} className="data-list-item">
                        <div>
                            <strong>{poll.question}</strong>
                            <span
                                className={`badge ${
                                    poll.status === "ACTIVE" ? "badge-active" : "badge-neutral"
                                }`}
                            >
                                {poll.status}
                            </span>
                        </div>
                        <div className="action-buttons">
                            <button className="btn btn-secondary" onClick={() => getResults(poll.id)}>
                                View Results
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            {results && (
                <div className="results-modal">
                    <div className="results-content">
                        <span className="close-button" onClick={() => setResults(null)}>&times;</span>
                        <h4>{results.question}</h4>
                        
                        <div style={{ display: "flex", gap: "10px", marginBottom: "20px", justifyContent: "center" }}>
                            <button 
                                className={`btn ${chartType === "bar" ? "btn-primary" : "btn-secondary"}`}
                                onClick={() => setChartType("bar")}
                            >
                                Bar Chart
                            </button>
                            <button 
                                className={`btn ${chartType === "pie" ? "btn-primary" : "btn-secondary"}`}
                                onClick={() => setChartType("pie")}
                            >
                                Pie Chart
                            </button>
                        </div>

                        <div style={{ width: "100%", height: "300px" }}>
                            {chartType === "bar" ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={results.results.map((r, i) => ({
                                            name: r.optionText,
                                            votes: r.voteCount,
                                            fill: COLORS[i % COLORS.length]
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
                                            {results.results.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={results.results.map((r, i) => ({
                                                name: r.optionText,
                                                value: r.voteCount,
                                                fill: COLORS[i % COLORS.length]
                                            }))}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                            animationDuration={1500}
                                            animationEasing="ease-out"
                                        >
                                            {results.results.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        <div style={{ marginTop: "20px" }}>
                            <h5>Vote Details:</h5>
                            <ul style={{ listStyle: "none", padding: 0 }}>
                                {results.results.map((result, index) => (
                                    <li key={index} style={{ padding: "8px 0", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between" }}>
                                        <span>
                                            <span style={{ 
                                                display: "inline-block", 
                                                width: "12px", 
                                                height: "12px", 
                                                backgroundColor: COLORS[index % COLORS.length],
                                                borderRadius: "2px",
                                                marginRight: "8px"
                                            }}></span>
                                            {result.optionText}
                                        </span>
                                        <strong>{result.voteCount} votes</strong>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

