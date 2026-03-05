import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosConfig";
import "./AdminShared.css";

export default function ManagePolls() {
    const [polls, setPolls] = useState([]);
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState(["", ""]);
    const [endDate, setEndDate] = useState("");
    const [results, setResults] = useState(null);

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
            <h3 className="section-title">Create Poll</h3>
            <form onSubmit={handleSubmit} className="inline-form">
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

            <hr className="divider" />

            <h3 className="section-title">Community Polls</h3>
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
                        <ul>
                            {results.results.map((result, index) => (
                                <li key={index}>
                                    {result.optionText}: {result.voteCount}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}

