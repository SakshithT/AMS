import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosConfig";
import "./AdminShared.css";

export default function ManageMaintenance({ flats, apartments, blocks }) {
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [formData, setFormData] = useState({
    flatId: "",
    amount: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  useEffect(() => {
    loadMaintenanceRequests();
  }, []);

  const loadMaintenanceRequests = async () => {
    try {
      const response = await axiosInstance.get("/admin/maintenance");

      // Handle ApiResponse -> PageResponse -> content structure
      let data = response.data;
      if (data?.data) data = data.data;
      if (data?.content) data = data.content;

      setMaintenanceRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading maintenance:", error);
      setMaintenanceRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.flatId) newErrors.flatId = "Please select a flat";
    if (!formData.amount || formData.amount <= 0) newErrors.amount = "Please enter a valid amount";
    if (!formData.month) newErrors.month = "Month is required";
    if (!formData.year) newErrors.year = "Year is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      flatId: "",
      amount: "",
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setSuccessMessage("");
    try {
      // Ensure flatId is sent as a number
      const payload = { ...formData, flatId: Number(formData.flatId) };
      await axiosInstance.post("/admin/maintenance", payload);
      setSuccessMessage("Maintenance request created successfully!");
      resetForm();
      setShowForm(false);
      loadMaintenanceRequests();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create maintenance request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      if (status === "PAID") {
        await axiosInstance.put(`/admin/maintenance/${id}/mark-paid`);
      }
      loadMaintenanceRequests();
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const handleDelete = (id) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async (id) => {
    try {
      await axiosInstance.delete(`/admin/maintenance/${id}`);
      loadMaintenanceRequests();
      setDeleteConfirmId(null);
    } catch (error) {
      alert("Failed to delete maintenance request");
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmId(null);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { class: "badge-pending", label: "Pending" },
      PAID: { class: "badge-paid", label: "Paid" },
      OVERDUE: { class: "badge-overdue", label: "Overdue" },
      CANCELLED: { class: "badge-cancelled", label: "Cancelled" }
    };
    const statusInfo = statusMap[status] || { class: "badge-neutral", label: status };
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  if (loading) {
    return <div className="admin-card">Loading maintenance requests...</div>;
  }

  return (
    <div className="fade-in-up">
      <div className="page-header page-header-container">
        <div>
          <h1 className="page-title">Manage Maintenance</h1>
          <p className="page-subtitle">Create and track maintenance requests</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => { setShowForm(!showForm); if (!showForm) resetForm(); }}
        >
          {showForm ? '✕ Close Form' : '+ Create Maintenance Request'}
        </button>
      </div>

      {/* Inline Form */}
      {showForm && (
        <div className="inline-form-card inline-form-maintenance fade-in-up mb-24">
          <div className="inline-form-accent accent-green"></div>
          <div className="inline-form-header">
            <div className="inline-form-icon icon-green">
              <span>🔧</span>
            </div>
            <div>
              <h3>Create Maintenance Request</h3>
              <p>Add a new maintenance billing for a flat</p>
            </div>
          </div>
          <div className="inline-form-body">
            <form onSubmit={handleSubmit}>
              <div className="inline-form-row">
                <div className={`inline-form-group ${errors.flatId ? 'has-error' : ''}`}>
                  <label>Select Flat <span className="required-star">*</span></label>
                  <select
                    className={`inline-form-select ${errors.flatId ? 'error' : ''}`}
                    value={formData.flatId}
                    onChange={(e) => setFormData({ ...formData, flatId: e.target.value })}
                  >
                    <option value="">Select Flat</option>
                    {flats.map(flat => (
                      <option key={flat.id} value={flat.id}>
                        Flat {flat.flatNumber}
                      </option>
                    ))}
                  </select>
                  {errors.flatId && <span className="inline-form-error">{errors.flatId}</span>}
                </div>
                <div className={`inline-form-group ${errors.amount ? 'has-error' : ''}`}>
                  <label>Amount <span className="required-star">*</span></label>
                  <input
                    type="number"
                    className={`inline-form-input ${errors.amount ? 'error' : ''}`}
                    placeholder="Enter amount"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                  {errors.amount && <span className="inline-form-error">{errors.amount}</span>}
                </div>
              </div>

              <div className="inline-form-row">
                <div className={`inline-form-group ${errors.month ? 'has-error' : ''}`}>
                  <label>Month <span className="required-star">*</span></label>
                  <select
                    className={`inline-form-select ${errors.month ? 'error' : ''}`}
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                  >
                    {[...Array(12).keys()].map(i => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(0, i).toLocaleString('default', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                  {errors.month && <span className="inline-form-error">{errors.month}</span>}
                </div>
                <div className={`inline-form-group ${errors.year ? 'has-error' : ''}`}>
                  <label>Year <span className="required-star">*</span></label>
                  <input
                    type="number"
                    className={`inline-form-input ${errors.year ? 'error' : ''}`}
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  />
                  {errors.year && <span className="inline-form-error">{errors.year}</span>}
                </div>
              </div>

              <div className="inline-form-actions">
                <button type="button" className="inline-btn inline-btn-cancel" onClick={() => { resetForm(); setShowForm(false); }}>
                  Cancel
                </button>
                <button type="submit" className="inline-btn inline-btn-submit btn-gradient-green" disabled={submitting}>
                  {submitting ? 'Creating...' : '➕ Create Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}


      {/* Maintenance Table */}
      <div className="admin-card mt-0">
        <h3 className="section-title">Maintenance Requests</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Flat Number</th>
              <th>Amount</th>
              <th>Month/Year</th>
              <th>Due Date</th>
              <th>Paid Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {maintenanceRequests.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">No maintenance requests found</td>
              </tr>
            ) : (
              maintenanceRequests.map((maintenance) => (
                <tr key={maintenance.id}>
                  <td>Flat {maintenance.flatNumber || maintenance.flatId}</td>
                  <td>${maintenance.amount}</td>
                  <td>{maintenance.month}/{maintenance.year}</td>
                  <td>{maintenance.dueDate}</td>
                  <td>{maintenance.paidDate || "-"}</td>
                  <td>{getStatusBadge(maintenance.paymentStatus)}</td>
                  <td>
                    <div className="action-buttons">
                      {maintenance.paymentStatus === "PENDING" && (
                        <button
                          className="btn btn-success"
                          onClick={() => handleStatusUpdate(maintenance.id, "PAID")}
                        >
                          Mark Paid
                        </button>
                      )}
                      {maintenance.paymentStatus === "PAID" && (
                        <button
                          className="btn btn-secondary"
                          disabled
                        >
                          Already Paid
                        </button>
                      )}
                      {deleteConfirmId === maintenance.id ? (
                        <div className="action-buttons">
                          <button className="btn btn-danger" onClick={() => confirmDelete(maintenance.id)}>
                            Confirm Delete
                          </button>
                          <button className="btn btn-secondary" onClick={cancelDelete}>
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button className="btn btn-danger" onClick={() => handleDelete(maintenance.id)}>
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
