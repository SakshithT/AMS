import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosConfig";
import "./AdminShared.css";

export default function ManageComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    loadComplaints();
    loadStaff();
  }, []);

  const loadComplaints = async () => {
    try {
      const response = await axiosInstance.get("/admin/complaints");
      const data = response.data.data;
      setComplaints(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStaff = async () => {
    try {
      const response = await axiosInstance.get("/admin/staff");
      const data = response.data.data;
      setStaffList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading staff:", error);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await axiosInstance.put(`/admin/complaints/${id}/status?status=${status}`);
      loadComplaints();
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const handleAssignStaff = async () => {
    if (!selectedStaffId) {
      alert("Please select a staff member");
      return;
    }
    try {
      await axiosInstance.put(`/admin/complaints/${selectedComplaint.id}/assign-staff?staffId=${selectedStaffId}`);
      setSelectedStaffId("");
      setSelectedComplaint(null);
      loadComplaints();
    } catch (error) {
      console.error("Failed to assign staff", error);
      alert("Failed to assign staff. Please try again.");
    }
  };

  const openStaffAssignment = (complaint) => {
    setSelectedComplaint(complaint);
    setSelectedStaffId(complaint.staffId ? String(complaint.staffId) : "");
  };

  // eslint-disable-next-line no-unused-vars
  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/admin/complaints/${id}`);
      setDeleteConfirmId(null);
      loadComplaints();
    } catch (error) {
      console.error("Failed to delete complaint", error);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { class: "badge-pending", label: "Pending" },
      IN_PROGRESS: { class: "badge-in-progress", label: "In Progress" },
      RESOLVED: { class: "badge-resolved", label: "Resolved" },
      REJECTED: { class: "badge-rejected", label: "Rejected" }
    };
    const statusInfo = statusMap[status] || { class: "badge-neutral", label: status };
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  const getPriorityBadge = (priority) => {
    const priorityMap = {
      LOW: { class: "badge-low", label: "Low" },
      MEDIUM: { class: "badge-medium", label: "Medium" },
      HIGH: { class: "badge-high", label: "High" },
      URGENT: { class: "badge-urgent", label: "Urgent" }
    };
    const priorityInfo = priorityMap[priority] || { class: "badge-neutral", label: priority };
    return <span className={`badge ${priorityInfo.class}`}>{priorityInfo.label}</span>;
  };

  const filteredComplaints = filterStatus === "ALL"
    ? complaints
    : complaints.filter(c => c.status === filterStatus);

  if (loading) {
    return <div className="admin-card">Loading complaints...</div>;
  }

  return (
    <div className="admin-card fade-in-up">
      {/* Staff Assignment Modal Code Removed */}

      <div className="section-header">
        <h3 className="section-title">Manage Complaints</h3>
        <div className="filter-group">
          <label>Filter by Status:</label>
          <select
            className="form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ width: "auto" }}
          >
            <option value="ALL">All</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {selectedComplaint && (
        <div className="inline-form-card fade-in-up mb-24">
          <div className="inline-form-accent accent-blue"></div>
          <div className="inline-form-header">
            <div className="inline-form-icon icon-blue">
              <span>📋</span>
            </div>
            <div>
              <h3>Complaint #{selectedComplaint.id} Details</h3>
              <p>View complete description and status</p>
            </div>
          </div>
          <div className="inline-form-body">
            <div className="inline-form-row">
              <div className="inline-form-group wide-group">
                <label>Title</label>
                <div className="form-input read-only-input" style={{ backgroundColor: '#f8f9fa' }}>{selectedComplaint.title}</div>
              </div>
            </div>

            <div className="inline-form-row">
              <div className="inline-form-group wide-group">
                <label>Description</label>
                <div className="form-input read-only-input" style={{ whiteSpace: 'pre-wrap', minHeight: '80px', backgroundColor: '#f8f9fa' }}>
                  {selectedComplaint.description}
                </div>
              </div>
            </div>

            <div className="inline-form-row">
              <div className="inline-form-group">
                <label>Flat Number</label>
                <div className="form-input read-only-input" style={{ backgroundColor: '#f8f9fa' }}>
                  Flat {selectedComplaint.flatNumber || selectedComplaint.flatId}
                </div>
              </div>
              <div className="inline-form-group">
                <label>Category</label>
                <div className="form-input read-only-input" style={{ backgroundColor: '#f8f9fa' }}>
                  {selectedComplaint.category || "General"}
                </div>
              </div>
            </div>

            <div className="inline-form-row">
              <div className="inline-form-group">
                <label>Priority</label>
                <div style={{ marginTop: '10px' }}>
                  {getPriorityBadge(selectedComplaint.priority)}
                </div>
              </div>
              <div className="inline-form-group">
                <label>Status</label>
                <div style={{ marginTop: '10px' }}>
                  {getStatusBadge(selectedComplaint.status)}
                </div>
              </div>
            </div>

            <div className="inline-form-row">
              <div className="inline-form-group">
                <label>Assigned Staff</label>
                <div className="form-input read-only-input" style={{ backgroundColor: '#f8f9fa' }}>
                  {selectedComplaint.staffName
                    ? `${selectedComplaint.staffName} (${selectedComplaint.staffDesignation || 'Staff'})`
                    : "Not Assigned"}
                </div>
              </div>
            </div>

            <div className="inline-form-row">
              <div className="inline-form-group" style={{
                width: selectedComplaint.resolvedAt ? '48%' : '100%'
              }}>
                <label>Submitted On</label>
                <div className="form-input read-only-input" style={{ backgroundColor: '#f8f9fa' }}>
                  {new Date(selectedComplaint.createdAt).toLocaleString()}
                </div>
              </div>
              {selectedComplaint.resolvedAt && (
                <div className="inline-form-group" style={{ width: '48%' }}>
                  <label>Resolved On</label>
                  <div className="form-input read-only-input" style={{ backgroundColor: '#f8f9fa' }}>
                    {new Date(selectedComplaint.resolvedAt).toLocaleString()}
                  </div>
                </div>
              )}
            </div>

            <div className="inline-form-actions">
              <button className="inline-btn inline-btn-cancel" onClick={() => setSelectedComplaint(null)}>
                Close
              </button>

              {(selectedComplaint.status === "PENDING" || selectedComplaint.status === "IN_PROGRESS") && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <select
                    className="inline-form-select"
                    style={{ width: 'auto', minWidth: '160px', padding: '10px' }}
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                  >
                    <option value="">-- Select Staff --</option>
                    {staffList.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.username} - {staff.designation || 'Staff'}
                      </option>
                    ))}
                  </select>
                  <button
                    className="inline-btn inline-btn-submit btn-gradient-orange"
                    onClick={handleAssignStaff}
                  >
                    ▶ {selectedComplaint.staffId ? "Save Reassignment" : "Assign & Start"}
                  </button>
                </div>
              )}
              {selectedComplaint.status === "IN_PROGRESS" && (
                <button
                  className="inline-btn inline-btn-submit btn-gradient-green"
                  onClick={() => {
                    handleStatusUpdate(selectedComplaint.id, "RESOLVED");
                    setSelectedComplaint(null);
                  }}
                >
                  ✅ Mark as Resolved
                </button>
              )}
              {selectedComplaint.status !== "RESOLVED" && selectedComplaint.status !== "REJECTED" && (
                <button
                  className="inline-btn inline-btn-submit btn-gradient-red"
                  onClick={() => {
                    handleStatusUpdate(selectedComplaint.id, "REJECTED");
                    setSelectedComplaint(null);
                  }}
                >
                  ❌ Reject
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Complaints Stats */}
      <div className="stats-row">
        <div className="mini-stat">
          <span className="mini-stat-number">{complaints.filter(c => c.status === "PENDING").length}</span>
          <span className="mini-stat-label">Pending</span>
        </div>
        <div className="mini-stat">
          <span className="mini-stat-number">{complaints.filter(c => c.status === "IN_PROGRESS").length}</span>
          <span className="mini-stat-label">In Progress</span>
        </div>
        <div className="mini-stat">
          <span className="mini-stat-number">{complaints.filter(c => c.status === "RESOLVED").length}</span>
          <span className="mini-stat-label">Resolved</span>
        </div>
        <div className="mini-stat">
          <span className="mini-stat-number">{complaints.filter(c => c.priority === "URGENT" && c.status !== "RESOLVED").length}</span>
          <span className="mini-stat-label">Urgent</span>
        </div>
      </div>

      {/* Complaints Table */}
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Flat</th>
            <th>Category</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Assigned To</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredComplaints.length === 0 ? (
            <tr>
              <td colSpan="9" className="text-center">No complaints found</td>
            </tr>
          ) : (
            filteredComplaints.map((complaint) => (
              <tr key={complaint.id}>
                <td>#{complaint.id}</td>
                <td>
                  <div className="complaint-title">
                    <strong>{complaint.title}</strong>
                    {complaint.description && (
                      <p className="complaint-preview">{complaint.description.substring(0, 50)}...</p>
                    )}
                  </div>
                </td>
                <td>Flat {complaint.flatNumber || complaint.flatId}</td>
                <td>{complaint.category || "General"}</td>
                <td>{getPriorityBadge(complaint.priority)}</td>
                <td>{getStatusBadge(complaint.status)}</td>
                <td>{complaint.staffName || "—"}</td>
                <td>{new Date(complaint.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-primary"
                      onClick={() => openStaffAssignment(complaint)}
                    >
                      View
                    </button>
                    {(complaint.status === "PENDING" || complaint.status === "IN_PROGRESS") && (
                      <button
                        className="btn btn-warning"
                        onClick={() => openStaffAssignment(complaint)}
                      >
                        {complaint.staffId ? "Reassign" : "Assign"}
                      </button>
                    )}
                    {complaint.status === "IN_PROGRESS" && (
                      <button
                        className="btn btn-success"
                        onClick={() => handleStatusUpdate(complaint.id, "RESOLVED")}
                      >
                        Resolve
                      </button>
                    )}
                    {complaint.status !== "RESOLVED" && complaint.status !== "REJECTED" && (
                      <button
                        className="btn btn-danger"
                        onClick={() => handleStatusUpdate(complaint.id, "REJECTED")}
                      >
                        Reject
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
  );
}
