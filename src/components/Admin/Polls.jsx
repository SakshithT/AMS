import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosConfig";
import "./AdminShared.css";

export default function ManagePolls() {
    const [polls, setPolls] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState("");

    const [formData, setFormData] = useState({
        question: "",
        endDate: "",
        options: ["", ""]
    });

    useEffect(() => {
        loadPolls();
    }, []);

    const loadPolls = async () => {
        try {
            const res = await axiosInstance.get("/admin/polls");
            const data = res.data.data;
            setPolls(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error loading polls:", error);
            setPolls([]);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.question.trim()) newErrors.question = "Question is required";
        if (!formData.endDate) newErrors.endDate = "End date is required";

        const validOptions = formData.options.filter(opt => opt.trim() !== "");
        if (validOptions.length < 2) {
            newErrors.options = "At least 2 valid options are required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const resetForm = () => {
        setFormData({
            question: "",
            endDate: "",
            options: ["", ""]
        });
        setErrors({});
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...formData.options];
        newOptions[index] = value;
        setFormData({ ...formData, options: newOptions });
    };

    const addOption = () => {
        setFormData({ ...formData, options: [...formData.options, ""] });
    };

    const removeOption = (index) => {
        const newOptions = formData.options.filter((_, i) => i !== index);
        setFormData({ ...formData, options: newOptions });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                options: formData.options.filter(opt => opt.trim() !== "")
            };

            await axiosInstance.post("/admin/polls", payload);
            setSuccessMessage("Poll created successfully!");
            resetForm();
            setShowForm(false);
            loadPolls();
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (error) {
            alert(error.response?.data?.message || "Operation failed");
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status, endDate) => {
        const isExpired = new Date(endDate) < new Date();
        if (status === 'ACTIVE' && !isExpired) return <span className="badge badge-active">Active</span>;
        return <span className="badge badge-inactive">Closed</span>;
    };

    return (
        <div className="fade-in-up">
            <div className="page-header page-header-container">
                <div>
                    <h1 className="page-title">Manage Polls</h1>
                    <p className="page-subtitle">Create and view community polls</p>
                </div>
                {/* Changed to btn-primary to match the clubhouse page header */}
                <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
                    {showForm ? '✕ Close Form' : '+ Create Poll'}
                </button>
            </div>

            {successMessage && <div className="success-message">{successMessage}</div>}

            {showForm && (
                <div className="inline-form-card fade-in-up mb-24">
                    <div className="inline-form-accent accent-blue"></div>
                    <div className="inline-form-header">
                        {/* Adjusted the inline styles to perfectly mimic the clubhouse icon wrapper styling */}
                        <div className="inline-form-icon" style={{ background: '#cce5ff', color: '#0056b3' }}>
                            <span>📊</span>
                        </div>
                        <div>
                            <h3>Create New Poll</h3>
                            <p>Ask the community a question</p>
                        </div>
                    </div>
                    <div className="inline-form-body">
                        <form onSubmit={handleSubmit}>
                            {/* Row 1: Split 50/50 exactly like the clubhouse form */}
                            <div className="inline-form-row">
                                <div className={`inline-form-group ${errors.question ? 'has-error' : ''}`}>
                                    <label>Poll Question <span className="required-star">*</span></label>
                                    <input
                                        type="text"
                                        className={`inline-form-input ${errors.question ? 'error' : ''}`}
                                        placeholder="e.g. What should we name the new garden?"
                                        value={formData.question}
                                        onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                    />
                                    {errors.question && <span className="inline-form-error">{errors.question}</span>}
                                </div>
                                <div className={`inline-form-group ${errors.endDate ? 'has-error' : ''}`}>
                                    <label>End Date <span className="required-star">*</span></label>
                                    <input
                                        type="date"
                                        className={`inline-form-input ${errors.endDate ? 'error' : ''}`}
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    />
                                    {errors.endDate && <span className="inline-form-error">{errors.endDate}</span>}
                                </div>
                            </div>

                            {/* Dynamically map options into paired 50/50 chunks */}
                            {Array.from({ length: Math.ceil(formData.options.length / 2) }).map((_, rowIndex) => (
                                <div className="inline-form-row" key={rowIndex}>
                                    {/* Left Option */}
                                    <div className="inline-form-group">
                                        <label>Option {rowIndex * 2 + 1} {rowIndex === 0 && <span className="required-star">*</span>}</label>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <input
                                                type="text"
                                                className="inline-form-input"
                                                placeholder={`Enter option ${rowIndex * 2 + 1}`}
                                                value={formData.options[rowIndex * 2]}
                                                onChange={(e) => handleOptionChange(rowIndex * 2, e.target.value)}
                                            />
                                            {formData.options.length > 2 && (
                                                <button
                                                    type="button"
                                                    className="btn btn-danger"
                                                    onClick={() => removeOption(rowIndex * 2)}
                                                    title="Remove Option"
                                                    style={{ height: '42px', width: '42px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Option */}
                                    <div className="inline-form-group">
                                        {rowIndex * 2 + 1 < formData.options.length && (
                                            <>
                                                <label>Option {rowIndex * 2 + 2} {rowIndex === 0 && <span className="required-star">*</span>}</label>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <input
                                                        type="text"
                                                        className="inline-form-input"
                                                        placeholder={`Enter option ${rowIndex * 2 + 2}`}
                                                        value={formData.options[rowIndex * 2 + 1]}
                                                        onChange={(e) => handleOptionChange(rowIndex * 2 + 1, e.target.value)}
                                                    />
                                                    {formData.options.length > 2 && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-danger"
                                                            onClick={() => removeOption(rowIndex * 2 + 1)}
                                                            title="Remove Option"
                                                            style={{ height: '42px', width: '42px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                                                        >
                                                            ✕
                                                        </button>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}

                            <div className="inline-form-row">
                                <div className="inline-form-group">
                                    {errors.options && <span className="inline-form-error" style={{ display: 'block', marginBottom: '10px' }}>{errors.options}</span>}
                                    <button
                                        type="button"
                                        className="btn btn-secondary btn-sm"
                                        onClick={addOption}
                                        style={{ width: 'fit-content' }}
                                    >
                                        + Add Another Option
                                    </button>
                                </div>
                                <div className="inline-form-group"></div>
                            </div>

                            {/* Aligned submit button UI with "➕ Make Booking" from clubhouse */}
                            <div className="inline-form-actions">
                                <button type="button" className="inline-btn inline-btn-cancel" onClick={() => setShowForm(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="inline-btn inline-btn-submit btn-gradient-blue" disabled={submitting}>
                                    {submitting ? 'Creating...' : '➕ Create Poll'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="admin-card mt-0">
                <h3 className="card-title">All Polls</h3>
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Question</th>
                                <th>End Date</th>
                                <th>Status</th>
                                <th>Created By</th>
                            </tr>
                        </thead>
                        <tbody>
                            {polls.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center">No polls found</td>
                                </tr>
                            ) : (
                                polls.map((poll) => (
                                    <tr key={poll.id}>
                                        <td>#{poll.id}</td>
                                        <td>
                                            <div style={{ fontWeight: '500' }}>{poll.question}</div>
                                            <div className="text-muted text-sm">{poll.options?.length || 0} options</div>
                                        </td>
                                        <td>{new Date(poll.endDate).toLocaleDateString()}</td>
                                        <td>{getStatusBadge(poll.status, poll.endDate)}</td>
                                        <td>{poll.createdBy?.username || poll.createdBy || 'Admin'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}