import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosConfig";
import "./AdminShared.css";

export default function ManageClubhouse() {
    const [bookings, setBookings] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState("");

    const [flats, setFlats] = useState([]);
    const [maxCapacity, setMaxCapacity] = useState("");
    const [settingCapacity, setSettingCapacity] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        occasionType: "",
        occasionDate: "",
        slot: "DAY",
        capacity: "",
        roomsForGuests: "",
        specialRequests: "",
        flatId: ""
    });

    useEffect(() => {
        loadBookings();
        loadFlats();
        loadMaxCapacity();
    }, []);

    const loadFlats = async () => {
        try {
            const res = await axiosInstance.get("/flats");
            let data = res.data;
            if (data && data.data) data = data.data;
            if (data && data.content) data = data.content;
            setFlats(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error loading flats:", error);
        }
    };

    const loadMaxCapacity = async () => {
        try {
            const res = await axiosInstance.get("/admin/clubhouse/capacity");
            if (res.data.data) {
                setMaxCapacity(res.data.data);
            }
        } catch (error) {
            console.error("Error loading capacity:", error);
        }
    };

    const handleSetCapacity = async () => {
        if (!maxCapacity) return;
        setSettingCapacity(true);
        try {
            await axiosInstance.put("/admin/clubhouse/capacity", { capacity: parseInt(maxCapacity) });
            alert("Max capacity updated successfully!");
        } catch (error) {
            alert(error.response?.data?.message || "Failed to update capacity");
        } finally {
            setSettingCapacity(false);
        }
    };

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
        if (!formData.slot) newErrors.slot = "Please select a slot";
        if (!editingId && !formData.flatId) newErrors.flatId = "Flat selection is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const resetForm = () => {
        setFormData({
            name: "",
            occasionType: "",
            occasionDate: "",
            slot: "DAY",
            capacity: "",
            roomsForGuests: "",
            specialRequests: "",
            flatId: ""
        });
        setErrors({});
        setEditingId(null);
    };

    const handleEdit = (booking) => {
        setFormData({
            name: booking.name || "",
            occasionType: booking.occasionType || "",
            occasionDate: booking.occasionDate || "",
            slot: booking.slot || "DAY",
            capacity: booking.capacity || "",
            roomsForGuests: booking.roomsForGuests || "",
            specialRequests: booking.specialRequests || "",
            flatId: booking.flatId || ""
        });
        setEditingId(booking.id);
        setShowForm(true);
        setErrors({});
    };

    const handleAdminBookingSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            if (editingId) {
                await axiosInstance.put(`/admin/clubhouse/${editingId}`, formData);
                setSuccessMessage("Booking updated successfully!");
            } else {
                await axiosInstance.post("/admin/clubhouse", formData);
                setSuccessMessage("Clubhouse booked successfully!");
            }
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
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', background: '#f8f9fa', padding: '5px 10px', borderRadius: '5px', border: '1px solid #dee2e6' }}>
                        <label style={{ marginRight: '10px', fontSize: '14px', fontWeight: '500' }}>Max Capacity:</label>
                        <input
                            type="number"
                            style={{ width: '80px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px', marginRight: '10px' }}
                            value={maxCapacity}
                            onChange={(e) => setMaxCapacity(e.target.value)}
                            placeholder="Limit"
                        />
                        <button className="btn btn-sm btn-primary" onClick={handleSetCapacity} disabled={settingCapacity}>
                            {settingCapacity ? 'Saving...' : 'Set'}
                        </button>
                    </div>
                    <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
                        {showForm ? '✕ Close Form' : '+ Book Clubhouse'}
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="stats-row" style={{ marginBottom: '20px' }}>
                <div className="mini-stat">
                    <span className="mini-stat-number">{bookings.length}</span>
                    <span className="mini-stat-label">Total Bookings</span>
                </div>
                <div className="mini-stat">
                    <span className="mini-stat-number">{bookings.filter(b => b.status === 'PENDING').length}</span>
                    <span className="mini-stat-label">Pending</span>
                </div>
                <div className="mini-stat">
                    <span className="mini-stat-number">{bookings.filter(b => b.status === 'APPROVED').length}</span>
                    <span className="mini-stat-label">Approved</span>
                </div>
                <div className="mini-stat">
                    <span className="mini-stat-number">{bookings.filter(b => b.status === 'REJECTED').length}</span>
                    <span className="mini-stat-label">Rejected</span>
                </div>
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
                            <h3>{editingId ? '✏️ Edit Booking' : 'Admin Booking'}</h3>
                            <p>{editingId ? 'Update the details for this booking' : 'Book the clubhouse (e.g. for a community event)'}</p>
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
                                <div className={`inline-form-group ${errors.flatId ? 'has-error' : ''}`}>
                                    <label>Select Flat <span className="required-star">*</span></label>
                                    <select
                                        className={`inline-form-input ${errors.flatId ? 'error' : ''}`}
                                        value={formData.flatId}
                                        onChange={(e) => setFormData({ ...formData, flatId: e.target.value })}
                                    >
                                        <option value="">-- Select Flat --</option>
                                        {flats.map(flat => (
                                            <option key={flat.id} value={flat.id}>
                                                {flat.flatNumber} {flat.block?.blockName ? `(${flat.block.blockName})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.flatId && <span className="inline-form-error">{errors.flatId}</span>}
                                </div>
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
                                <div className={`inline-form-group ${errors.slot ? 'has-error' : ''}`}>
                                    <label>Time Slot <span className="required-star">*</span></label>
                                    <select
                                        className={`inline-form-select ${errors.slot ? 'error' : ''}`}
                                        value={formData.slot}
                                        onChange={(e) => setFormData({ ...formData, slot: e.target.value })}
                                    >
                                        <option value="DAY">🌤️ Day (Morning – Afternoon)</option>
                                        <option value="NIGHT">🌙 Night (Evening – Late Night)</option>
                                    </select>
                                    {errors.slot && <span className="inline-form-error">{errors.slot}</span>}
                                </div>
                            </div>

                            <div className="inline-form-row">
                                <div className="inline-form-group">
                                    <label>Expected Capacity</label>
                                    <input
                                        type="number"
                                        className="inline-form-input"
                                        placeholder="Number of attendees"
                                        value={formData.capacity}
                                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                    />
                                </div>
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
                            </div>

                            <div className="inline-form-row">
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
                                <div className="inline-form-group"></div>
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
                                <th>Slot</th>
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
                                        <td>
                                            {booking.slot === 'DAY'
                                                ? <span className="badge" style={{ background: '#fef9c3', color: '#854d0e' }}>🌤️ Day</span>
                                                : <span className="badge" style={{ background: '#ede9fe', color: '#5b21b6' }}>🌙 Night</span>}
                                        </td>
                                        <td>{booking.capacity || 'N/A'} {booking.roomsForGuests ? `(+${booking.roomsForGuests} rooms)` : ''}</td>
                                        <td>{getStatusBadge(booking.status)}</td>
                                        <td>
                                            <div className="action-group">
                                                <button className="btn btn-warning btn-sm" onClick={() => handleEdit(booking)}>✏️ Edit</button>
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
