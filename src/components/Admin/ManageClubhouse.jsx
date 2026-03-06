import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosConfig";
import "./AdminShared.css";

export default function ManageClubhouse() {
    const [bookings, setBookings] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        occasionType: "",
        occasionDate: "",
        capacity: "",
        roomsForGuests: "",
        specialRequests: ""
    });

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            const res = await axiosInstance.get("/admin/clubhouse");
            const data = res.data.data;
            setBookings(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error loading bookings:", error);
            setBookings([]);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.occasionType.trim()) newErrors.occasionType = "Occasion type is required";
        if (!formData.occasionDate) newErrors.occasionDate = "Date is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const resetForm = () => {
        setFormData({
            name: "",
            occasionType: "",
            occasionDate: "",
            capacity: "",
            roomsForGuests: "",
            specialRequests: ""
        });
        setErrors({});
    };

    const handleAdminBookingSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            await axiosInstance.post("/admin/clubhouse", formData);
            setSuccessMessage("Clubhouse booked successfully!");
            resetForm();
            setShowForm(false);
            loadBookings();
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (error) {
            alert(error.response?.data?.message || "Operation failed");
        } finally {
            setSubmitting(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await axiosInstance.put(`/admin/clubhouse/${id}/status?status=${status}`);
            loadBookings();
        } catch (error) {
            alert("Failed to update status");
        }
    };

    const deleteBooking = async (id) => {
        if (window.confirm("Are you sure you want to delete this booking?")) {
            try {
                await axiosInstance.delete(`/admin/clubhouse/${id}`);
                loadBookings();
            } catch (error) {
                alert("Failed to delete booking");
            }
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'APPROVED': return <span className="badge badge-active">Approved</span>;
            case 'REJECTED': return <span className="badge badge-inactive">Rejected</span>;
            case 'CANCELLED': return <span className="badge badge-inactive" style={{ backgroundColor: '#6c757d' }}>Cancelled</span>;
            default: return <span className="badge" style={{ backgroundColor: '#ffc107', color: '#000' }}>Pending</span>;
        }
    };

    return (
        <div className="fade-in-up">
            <div className="page-header page-header-container">
                <div>
                    <h1 className="page-title">Manage Clubhouse</h1>
                    <p className="page-subtitle">View and manage resident bookings or add your own</p>
                </div>
                <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
                    {showForm ? '✕ Close Form' : '+ Book Clubhouse'}
                </button>
            </div>

            {successMessage && <div className="success-message">{successMessage}</div>}

            {showForm && (
                <div className="inline-form-card fade-in-up mb-24">
                    <div className="inline-form-accent accent-purple"></div>
                    <div className="inline-form-header">
                        <div className="inline-form-icon" style={{ background: '#e0b3ff', color: '#6a0dad' }}>
                            <span>🏛️</span>
                        </div>
                        <div>
                            <h3>Admin Booking</h3>
                            <p>Book the clubhouse (e.g. for a community event)</p>
                        </div>
                    </div>
                    <div className="inline-form-body">
                        <form onSubmit={handleAdminBookingSubmit}>
                            <div className="inline-form-row">
                                <div className={`inline-form-group ${errors.name ? 'has-error' : ''}`}>
                                    <label>Booking Name <span className="required-star">*</span></label>
                                    <input
                                        type="text"
                                        className={`inline-form-input ${errors.name ? 'error' : ''}`}
                                        placeholder="Enter name/event organizer"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                    {errors.name && <span className="inline-form-error">{errors.name}</span>}
                                </div>
                                <div className={`inline-form-group ${errors.occasionType ? 'has-error' : ''}`}>
                                    <label>Occasion Type <span className="required-star">*</span></label>
                                    <input
                                        type="text"
                                        className={`inline-form-input ${errors.occasionType ? 'error' : ''}`}
                                        placeholder="e.g. Community Gathering"
                                        value={formData.occasionType}
                                        onChange={(e) => setFormData({ ...formData, occasionType: e.target.value })}
                                    />
                                    {errors.occasionType && <span className="inline-form-error">{errors.occasionType}</span>}
                                </div>
                            </div>

                            <div className="inline-form-row">
                                <div className={`inline-form-group ${errors.occasionDate ? 'has-error' : ''}`}>
                                    <label>Occasion Date <span className="required-star">*</span></label>
                                    <input
                                        type="date"
                                        className={`inline-form-input ${errors.occasionDate ? 'error' : ''}`}
                                        value={formData.occasionDate}
                                        onChange={(e) => setFormData({ ...formData, occasionDate: e.target.value })}
                                    />
                                    {errors.occasionDate && <span className="inline-form-error">{errors.occasionDate}</span>}
                                </div>
                                <div className="inline-form-group">
                                    <label>Capacity</label>
                                    <input
                                        type="number"
                                        className="inline-form-input"
                                        placeholder="Expected attendees"
                                        value={formData.capacity}
                                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="inline-form-row">
                                <div className="inline-form-group">
                                    <label>Rooms For Guests</label>
                                    <input
                                        type="number"
                                        className="inline-form-input"
                                        placeholder="Number of rooms"
                                        value={formData.roomsForGuests}
                                        onChange={(e) => setFormData({ ...formData, roomsForGuests: e.target.value })}
                                    />
                                </div>
                                <div className="inline-form-group">
                                    <label>Special Requests</label>
                                    <input
                                        type="text"
                                        className="inline-form-input"
                                        placeholder="Any special notes"
                                        value={formData.specialRequests}
                                        onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="inline-form-actions">
                                <button type="button" className="inline-btn inline-btn-cancel" onClick={() => setShowForm(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="inline-btn inline-btn-submit btn-gradient-purple" disabled={submitting}>
                                    {submitting ? 'Booking...' : '➕ Make Booking'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="admin-card mt-0">
                <h3 className="card-title">All Bookings</h3>
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Booking Ref</th>
                                <th>Name / Flat</th>
                                <th>Occasion</th>
                                <th>Date</th>
                                <th>Capacity</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center">No bookings found</td>
                                </tr>
                            ) : (
                                bookings.map((booking) => (
                                    <tr key={booking.id}>
                                        <td>#{booking.id}</td>
                                        <td>
                                            <div><strong>{booking.name}</strong></div>
                                            {booking.flatNumber && <div className="text-muted text-sm">Flat: {booking.flatNumber}</div>}
                                        </td>
                                        <td>
                                            <div>{booking.occasionType}</div>
                                            {booking.specialRequests && <div className="text-muted text-sm">Notes: {booking.specialRequests}</div>}
                                        </td>
                                        <td>{booking.occasionDate}</td>
                                        <td>{booking.capacity || 'N/A'} {booking.roomsForGuests ? `(+${booking.roomsForGuests} rooms)` : ''}</td>
                                        <td>{getStatusBadge(booking.status)}</td>
                                        <td>
                                            <div className="action-group">
                                                {booking.status === 'PENDING' && (
                                                    <>
                                                        <button className="btn btn-success btn-sm" onClick={() => updateStatus(booking.id, 'APPROVED')}>Approve</button>
                                                        <button className="btn btn-danger btn-sm" onClick={() => updateStatus(booking.id, 'REJECTED')}>Reject</button>
                                                    </>
                                                )}
                                                <button className="btn btn-secondary btn-sm" onClick={() => deleteBooking(booking.id)}>Delete</button>
                                            </div>
                                        </td>
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
