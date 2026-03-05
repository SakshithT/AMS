import React, { useState, useEffect } from "react";
import "../../components/Admin/AdminShared.css";
import axiosInstance from "../../utils/axiosConfig";

const STATUS_OPTIONS = [
  { id: "AVAILABLE", name: "Available", class: "badge-active" },
  { id: "UNDER_MAINTENANCE", name: "Under Maintenance", class: "badge-in-progress" },
  { id: "CLOSED", name: "Closed", class: "badge-inactive" }
];

export default function ManageFacilities() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFacility, setEditingFacility] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "AVAILABLE",
    openingTime: "06:00",
    closingTime: "22:00",
    charges: "",
    capacity: ""
  });

  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/admin/facilities");
      setFacilities(res.data.data || []);
    } catch (err) {
      setErrorMessage("Failed to fetch facilities.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Facility name is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (formData.charges === "" || isNaN(formData.charges)) {
      newErrors.charges = "Valid charges are required";
    }
    if (!formData.capacity || isNaN(formData.capacity)) {
      newErrors.capacity = "Valid capacity is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      status: "AVAILABLE",
      openingTime: "06:00",
      closingTime: "22:00",
      charges: "",
      capacity: ""
    });
    setErrors({});
    setEditingFacility(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    const payload = {
      name: formData.name,
      description: formData.description,
      status: formData.status,
      openingTime: formData.openingTime,
      closingTime: formData.closingTime,
      charges: parseFloat(formData.charges),
      capacity: parseInt(formData.capacity)
    };

    try {
      if (editingFacility) {
        await axiosInstance.put(`/admin/facilities/${editingFacility.id}`, payload);
        setSuccessMessage("Facility updated successfully!");
      } else {
        await axiosInstance.post("/admin/facilities", payload);
        setSuccessMessage("Facility created successfully!");
      }
      await fetchFacilities();
      resetForm();
      setShowForm(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to save facility";
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (facility) => {
    setEditingFacility(facility);
    setFormData({
      name: facility.name || "",
      description: facility.description || "",
      status: facility.status || "AVAILABLE",
      openingTime: facility.openingTime || "06:00",
      closingTime: facility.closingTime || "22:00",
      charges: facility.charges !== undefined ? facility.charges : "",
      capacity: facility.capacity || ""
    });
    setShowForm(true);
    setErrors({});
    setErrorMessage("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this facility?")) return;
    try {
      await axiosInstance.delete(`/admin/facilities/${id}`);
      setSuccessMessage("Facility deleted successfully!");
      await fetchFacilities();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to delete facility";
      setErrorMessage(msg);
    }
  };

  const getStatusBadge = (status) => {
    const statusInfo = STATUS_OPTIONS.find(s => s.id === status) || STATUS_OPTIONS[0];
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.name}</span>;
  };

  const getGradient = (index) => {
    const gradients = [
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
    ];
    return gradients[index % gradients.length];
  };

  const closeForm = () => {
    setShowForm(false);
    resetForm();
    setErrorMessage("");
  };

  if (loading) {
    return <div className="admin-card">Loading facilities...</div>;
  }

  return (
    <div className="fade-in-up">
      <div className="page-header page-header-container">
        <div>
          <h1 className="page-title">Manage Facilities</h1>
          <p className="page-subtitle">Manage apartment amenities and facilities</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => { setShowForm(!showForm); if (!showForm) resetForm(); }}
        >
          {showForm ? '✕ Close Form' : '+ Add Facility'}
        </button>
      </div>

      {/* Inline Form */}
      {showForm && (
        <div className="inline-form-card inline-form-maintenance fade-in-up mb-24">
          <div className="inline-form-accent accent-blue"></div>
          <div className="inline-form-header">
            <div className="inline-form-icon icon-blue">
              <span>🏊</span>
            </div>
            <div>
              <h3>{editingFacility ? "Edit Facility" : "Add New Facility"}</h3>
              <p>{editingFacility ? "Update facility details" : "Create a new facility"}</p>
            </div>
          </div>
          <div className="inline-form-body">
            <form onSubmit={handleSubmit}>
              <div className="inline-form-row">
                <div className={`inline-form-group ${errors.name ? 'has-error' : ''}`}>
                  <label>Facility Name <span className="required-star">*</span></label>
                  <input
                    type="text"
                    className={`inline-form-input ${errors.name ? 'error' : ''}`}
                    placeholder="e.g., Swimming Pool"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  {errors.name && <span className="inline-form-error">{errors.name}</span>}
                </div>
                <div className="inline-form-group">
                  <label>Status <span className="required-star">*</span></label>
                  <select
                    className="inline-form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    {STATUS_OPTIONS.map(status => (
                      <option key={status.id} value={status.id}>{status.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="inline-form-row">
                <div className={`inline-form-group ${errors.description ? 'has-error' : ''}`}>
                  <label>Description <span className="required-star">*</span></label>
                  <textarea
                    className={`inline-form-input ${errors.description ? 'error' : ''}`}
                    rows="2"
                    placeholder="Describe the facility..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                  {errors.description && <span className="inline-form-error">{errors.description}</span>}
                </div>
              </div>

              <div className="inline-form-row">
                <div className={`inline-form-group ${errors.charges ? 'has-error' : ''}`}>
                  <label>Charges (₹) <span className="required-star">*</span></label>
                  <input
                    type="number"
                    className={`inline-form-input ${errors.charges ? 'error' : ''}`}
                    placeholder="0.00"
                    value={formData.charges}
                    onChange={(e) => setFormData({ ...formData, charges: e.target.value })}
                  />
                  {errors.charges && <span className="inline-form-error">{errors.charges}</span>}
                </div>
                <div className={`inline-form-group ${errors.capacity ? 'has-error' : ''}`}>
                  <label>Capacity <span className="required-star">*</span></label>
                  <input
                    type="number"
                    className={`inline-form-input ${errors.capacity ? 'error' : ''}`}
                    placeholder="Maximum capacity"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  />
                  {errors.capacity && <span className="inline-form-error">{errors.capacity}</span>}
                </div>
              </div>

              <div className="inline-form-row">
                <div className="inline-form-group">
                  <label>Opening Time</label>
                  <input
                    type="time"
                    className="inline-form-input"
                    value={formData.openingTime}
                    onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                  />
                </div>
                <div className="inline-form-group">
                  <label>Closing Time</label>
                  <input
                    type="time"
                    className="inline-form-input"
                    value={formData.closingTime}
                    onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                  />
                </div>
              </div>

              {errorMessage && (
                <div style={{ color: 'red', fontSize: '14px', marginBottom: '10px' }}>{errorMessage}</div>
              )}

              <div className="inline-form-actions">
                <button type="button" className="inline-btn inline-btn-cancel" onClick={closeForm}>
                  Cancel
                </button>
                <button type="submit" className="inline-btn inline-btn-submit btn-gradient-blue" disabled={submitting}>
                  {submitting ? 'Saving...' : editingFacility ? '✓ Update Facility' : '➕ Add Facility'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      {errorMessage && !showForm && (
        <div style={{ color: 'red', padding: '10px', marginBottom: '10px' }}>{errorMessage}</div>
      )}

      {/* Facilities Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {facilities.length === 0 ? (
          <div className="admin-card" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
            No facilities found. Click "Add Facility" to create one.
          </div>
        ) : (
          facilities.map((facility, index) => (
            <div key={facility.id} className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Card Header with Gradient */}
              <div style={{ 
                background: getGradient(index), 
                padding: '20px', 
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>{facility.name}</h3>
                  <p style={{ margin: '5px 0 0 0', opacity: 0.9, fontSize: '14px' }}>{facility.description}</p>
                </div>
                {getStatusBadge(facility.status)}
              </div>
              
              {/* Card Body */}
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                    <span style={{ color: '#666' }}>🕐 Timing</span>
                    <strong>{facility.openingTime} - {facility.closingTime}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                    <span style={{ color: '#666' }}>💰 Charges</span>
                    <strong>₹{facility.charges}/- {facility.charges === 0 ? '(Free)' : ''}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                    <span style={{ color: '#666' }}>👥 Capacity</span>
                    <strong>{facility.capacity} persons</strong>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleEdit(facility)}
                    style={{ flex: 1 }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(facility.id)}
                    style={{ flex: 1 }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
