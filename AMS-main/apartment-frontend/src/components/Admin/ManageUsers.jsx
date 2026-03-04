import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosConfig";
import "./AdminShared.css";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [deactivatingId, setDeactivatingId] = useState(null);
  const [reactivateUserId, setReactivateUserId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [flatIdToAllocate, setFlatIdToAllocate] = useState("");
  const [deactivateConfirmId, setDeactivateConfirmId] = useState(null);
  const [flatIdError, setFlatIdError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "ROLE_SECURITY",
    fullName: "",
    phoneNumber: ""
  });
  const [availableFlats, setAvailableFlats] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); // "all", "residents", "requests"

  useEffect(() => {
    loadUsers();
    loadFlats();
  }, []);

  const loadFlats = async () => {
    try {
      const res = await axiosInstance.get("/flats");

      let data = res.data;
      if (data?.data) data = data.data;
      if (data?.content) data = data.content;

      const parsedFlats = Array.isArray(data) ? data : [];

      const available = parsedFlats.filter(f => f.status === "AVAILABLE");
      setAvailableFlats(available);
    } catch (error) {
      console.error("Error loading flats:", error);
      setAvailableFlats([]);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await axiosInstance.get("/admin/users");
      const data = res.data.data;
      setUsers(Array.isArray(data) ? data : []);
    } catch { setUsers([]); }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!userData.username.trim()) newErrors.username = "Username is required";
    if (!userData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!userData.password) {
      newErrors.password = "Password is required";
    } else if (userData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!isEditing && userData.password !== userData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!userData.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setUserData({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "ROLE_SECURITY",
      fullName: "",
      phoneNumber: ""
    });
    setErrors({});
    setIsEditing(false);
    setEditUserId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setSuccessMessage("");
    try {
      const payload = { ...userData, contactNumber: userData.phoneNumber };
      delete payload.confirmPassword;
      delete payload.phoneNumber;

      if (isEditing) {
        await axiosInstance.put(`/admin/users/${editUserId}`, payload);
        setSuccessMessage("User updated successfully!");
      } else {
        await axiosInstance.post("/admin/users", payload);
        setSuccessMessage("User created successfully!");
      }
      resetForm();
      loadUsers();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      alert(error.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = (userId) => {
    setDeactivateConfirmId(userId);
  };

  const confirmDeactivate = async (userId) => {
    try {
      setDeactivatingId(userId);
      await axiosInstance.put(`/admin/users/${userId}/deactivate`);
      await loadUsers();
      setDeactivateConfirmId(null);
    } finally { setDeactivatingId(null); }
  };

  const cancelDeactivate = () => {
    setDeactivateConfirmId(null);
  };

  const reactivateNonResident = async (user) => {
    try {
      // Calls: PUT /admin/users/{id}/reactivate
      // Requires backend endpoint — see instructions above
      await axiosInstance.put(`/admin/users/${user.id}/reactivate`);
      setReactivateUserId(null);
      await loadUsers();
      setActiveTab("all");
    } catch (error) {
      console.error("Reactivate error:", error);
      alert(error.response?.data?.message || "Failed to reactivate user.");
    }
  };

  const submitReactivate = async (user) => {
    if (!flatIdToAllocate) {
      setFlatIdError("Please select a Flat.");
      return;
    }
    setFlatIdError("");
    try {
      if (user.status === "PENDING") {
        await axiosInstance.put(`/admin/users/${user.id}/approve`, null, { params: { flatId: flatIdToAllocate } });
      } else {
        await axiosInstance.put(`/admin/users/${user.id}/allocate/${flatIdToAllocate}`);
      }
      setReactivateUserId(null);
      setFlatIdToAllocate("");
      await loadUsers();
      setActiveTab("all");
    } catch (error) {
      console.error("Error activating resident:", error);
      setFlatIdError(error.response?.data?.message || "Failed to approve/allocate. Check backend console.");
    }
  };

  const handleReject = async (userId) => {
    try {
      setRejectingId(userId);
      await axiosInstance.put(`/admin/users/${userId}/reject`);
    } catch (error) {
      alert("Failed to reject user.");
    } finally {
      setRejectingId(null);
      loadUsers();
    }
  };

  const handleEdit = (user) => {
    setUserData({
      username: user.username || "",
      email: user.email || "",
      password: "",
      confirmPassword: "",
      role: user.role || (user.roles && user.roles[0]?.name) || "ROLE_SECURITY",
      fullName: user.fullName || "",
      phoneNumber: user.contactNumber || ""
    });
    setIsEditing(true);
    setEditUserId(user.id);
    setShowForm(true);
    setSuccessMessage("");
  };

  const getRole = (u) => u.role || (u.roles && u.roles[0]?.name);

  const allActiveUsers = users.filter(u => u.status !== "DEACTIVATED" && u.status !== "PENDING");
  const residentUsers = users.filter(u => getRole(u) === "ROLE_RESIDENT" && u.status !== "DEACTIVATED" && u.status !== "PENDING");
  const pendingUsers = users.filter(u => u.status === "DEACTIVATED" || u.status === "PENDING");

  const displayedUsers = activeTab === "all" ? allActiveUsers : (activeTab === "residents" ? residentUsers : pendingUsers);

  return (
    <div className="fade-in-up">
      <div className="page-header page-header-container">
        <div>
          <h1 className="page-title">Manage Users</h1>
          <p className="page-subtitle">Create and manage admin & security users</p>
        </div>
        <button className="btn btn-primary" onClick={() => { if (!showForm) { resetForm(); } setShowForm(!showForm); }}>
          {showForm ? '✕ Close Form' : (isEditing ? '✏️ Editing User' : '+ Create User')}
        </button>
      </div>

      {showForm && (
        <div className="inline-form-card inline-form-users fade-in-up mb-24">
          <div className="inline-form-accent accent-blue"></div>
          <div className="inline-form-header">
            <div className="inline-form-icon icon-blue">
              <span>👥</span>
            </div>
            <div>
              <h3>{isEditing ? 'Edit User' : 'Create Admin / Security'}</h3>
              <p>{isEditing ? 'Update existing user details' : 'Register a new admin or security user'}</p>
            </div>
          </div>
          <div className="inline-form-body">
            <form onSubmit={handleSubmit}>
              <div className="inline-form-row">
                <div className={`inline-form-group ${errors.username ? 'has-error' : ''}`}>
                  <label>Username <span className="required-star">*</span></label>
                  <input
                    type="text"
                    className={`inline-form-input ${errors.username ? 'error' : ''}`}
                    placeholder="Enter username"
                    value={userData.username}
                    onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                  />
                  {errors.username && <span className="inline-form-error">{errors.username}</span>}
                </div>
                <div className="inline-form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    className="inline-form-input"
                    placeholder="Enter full name"
                    value={userData.fullName}
                    onChange={(e) => setUserData({ ...userData, fullName: e.target.value })}
                  />
                </div>
              </div>

              <div className="inline-form-row">
                <div className={`inline-form-group ${errors.email ? 'has-error' : ''}`}>
                  <label>Email <span className="required-star">*</span></label>
                  <input
                    type="email"
                    className={`inline-form-input ${errors.email ? 'error' : ''}`}
                    placeholder="name@example.com"
                    value={userData.email}
                    onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  />
                  {errors.email && <span className="inline-form-error">{errors.email}</span>}
                </div>
                <div className={`inline-form-group ${errors.phoneNumber ? 'has-error' : ''}`}>
                  <label>Phone <span className="required-star">*</span></label>
                  <input
                    type="tel"
                    className={`inline-form-input ${errors.phoneNumber ? 'error' : ''}`}
                    placeholder="+91 XXXXX XXXXX"
                    value={userData.phoneNumber}
                    onChange={(e) => setUserData({ ...userData, phoneNumber: e.target.value })}
                  />
                  {errors.phoneNumber && <span className="inline-form-error">{errors.phoneNumber}</span>}
                </div>
              </div>

              <div className="inline-form-row">
                <div className="inline-form-group">
                  <label>Role <span className="required-star">*</span></label>
                  <select
                    className="inline-form-select"
                    value={userData.role}
                    onChange={(e) => setUserData({ ...userData, role: e.target.value })}
                  >
                    <option value="ROLE_ADMIN">🔑 Admin</option>
                    <option value="ROLE_SECURITY">🛡️ Security</option>
                    <option value="ROLE_RESIDENT">🏠 Resident</option>
                  </select>
                </div>
                <div className={`inline-form-group ${errors.password ? 'has-error' : ''}`}>
                  <label>Password {!isEditing && <span className="required-star">*</span>}</label>
                  <input
                    type="password"
                    className={`inline-form-input ${errors.password ? 'error' : ''}`}
                    placeholder={isEditing ? "Leave blank to keep current" : "Minimum 6 characters"}
                    value={userData.password}
                    onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                  />
                  {errors.password && <span className="inline-form-error">{errors.password}</span>}
                </div>
              </div>

              {!isEditing && (
                <div className="inline-form-row">
                  <div className={`inline-form-group ${errors.confirmPassword ? 'has-error' : ''}`}>
                    <label>Confirm Password <span className="required-star">*</span></label>
                    <input
                      type="password"
                      className={`inline-form-input ${errors.confirmPassword ? 'error' : ''}`}
                      placeholder="Re-enter password"
                      value={userData.confirmPassword}
                      onChange={(e) => setUserData({ ...userData, confirmPassword: e.target.value })}
                    />
                    {errors.confirmPassword && <span className="inline-form-error">{errors.confirmPassword}</span>}
                  </div>
                  <div className="inline-form-group"></div>
                </div>
              )}

              <div className="inline-form-actions">
                <button type="button" className="inline-btn inline-btn-cancel" onClick={() => { resetForm(); setShowForm(false); }}>
                  Cancel
                </button>
                <button type="submit" className="inline-btn inline-btn-submit btn-gradient-blue" disabled={submitting}>
                  {submitting ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? '✏️ Update User' : '➕ Create User')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      <div className="admin-card mt-0">
        <div className="action-group tab-container">
          <button className={`btn ${activeTab === "all" ? "btn-primary" : "btn-secondary"}`} onClick={() => setActiveTab("all")}>
            All Users ({allActiveUsers.length})
          </button>
          <button className={`btn ${activeTab === "residents" ? "btn-primary" : "btn-secondary"}`} onClick={() => setActiveTab("residents")}>
            Residents ({residentUsers.length})
          </button>
          <button className={`btn ${activeTab === "requests" ? "btn-primary" : "btn-secondary"}`} onClick={() => setActiveTab("requests")}>
            Approve Requests ({pendingUsers.length})
          </button>
        </div>

        <ul className="data-list">
          {displayedUsers.length === 0 ? (
            <p className="item-meta">No users found in this category.</p>
          ) : (
            displayedUsers.map((user) => {
              const isDeactivated = user.status === "DEACTIVATED" || user.status === "PENDING";

              return (
                <li key={user.id} className="data-list-item">
                  <div>
                    <strong>{user.username}</strong> - {user.email}
                    <span className="item-meta"> ({getRole(user) || "User"})</span>
                    <span className={`badge ${isDeactivated ? "badge-inactive" : "badge-active"}`}>
                      {user.status || "ACTIVE"}
                    </span>
                    {activeTab === "residents" && (
                      <div style={{ marginTop: '8px', fontSize: '0.9rem', color: '#555', paddingLeft: '10px', borderLeft: '3px solid #eee' }}>
                        <div><strong>Name:</strong> {user.username || "N/A"}</div>
                        <div><strong>Contact:</strong> {user.contactNumber || "N/A"}</div>
                        <div><strong>Flat:</strong> {user.flatNumber ? `Flat ${user.flatNumber} (Block ${user.blockName || '-'})` : "Not Assigned"}</div>
                      </div>
                    )}
                  </div>

                  <div className="action-group">
                    {!isDeactivated ? (
                      <>
                        {deactivateConfirmId === user.id ? (
                          <div className="action-group">
                            <button className="btn btn-danger" onClick={() => confirmDeactivate(user.id)} disabled={deactivatingId === user.id}>
                              {deactivatingId === user.id ? "Deactivating..." : "Confirm Deactivate"}
                            </button>
                            <button className="btn btn-secondary" onClick={cancelDeactivate}>Cancel</button>
                          </div>
                        ) : (
                          <button className="btn btn-danger" onClick={() => handleDeactivate(user.id)}>Deactivate</button>
                        )}
                      </>
                    ) : (
                      <>
                        {reactivateUserId === user.id ? (
                          <div className="action-group">
                            {(user.role || (user.roles && user.roles[0]?.name)) === "ROLE_RESIDENT" && (
                              <div className="flex-col">
                                <select
                                  className="inline-form-select w-150"
                                  value={flatIdToAllocate}
                                  onChange={(e) => setFlatIdToAllocate(e.target.value)}
                                >
                                  <option value="">Select Flat...</option>
                                  {availableFlats.map(flat => (
                                    <option key={flat.id} value={flat.id}>
                                      Flat {flat.flatNumber}
                                    </option>
                                  ))}
                                </select>
                                {flatIdError && <span className="inline-form-error mt-4">{flatIdError}</span>}
                              </div>
                            )}
                            <button className="btn btn-primary" onClick={() => submitReactivate(user)}>
                              {(user.role || (user.roles && user.roles[0]?.name)) === "ROLE_RESIDENT"
                                ? (user.status === "PENDING" ? "Approve & Allocate" : "Reactivate & Allocate")
                                : (user.status === "PENDING" ? "Approve" : "Reactivate")
                              }
                            </button>
                            <button className="btn btn-secondary" onClick={() => { setReactivateUserId(null); setFlatIdToAllocate(""); setFlatIdError(""); }}>Cancel</button>
                          </div>
                        ) : (
                          <>
                            {(() => {
                              const userRole = user.role || (user.roles && user.roles[0]?.name);
                              const isResident = userRole === "ROLE_RESIDENT";

                              if (user.status === "PENDING") {
                                // PENDING users: Approve (with flat if resident) + Reject
                                return (
                                  <div className="action-group">
                                    <button className="btn btn-success" onClick={() => setReactivateUserId(user.id)}>
                                      {isResident ? "Approve" : "Approve"}
                                    </button>
                                    <button
                                      className="btn btn-danger"
                                      onClick={() => handleReject(user.id)}
                                      disabled={rejectingId === user.id}
                                    >
                                      {rejectingId === user.id ? "Rejecting..." : "Reject"}
                                    </button>
                                  </div>
                                );
                              } else {
                                // DEACTIVATED users
                                if (isResident) {
                                  // Resident needs flat selection
                                  return (
                                    <button className="btn btn-primary" onClick={() => setReactivateUserId(user.id)}>Reactivate</button>
                                  );
                                } else {
                                  // Admin/Security: direct reactivate, no flat needed
                                  return (
                                    <button className="btn btn-success" onClick={() => reactivateNonResident(user)}>Reactivate</button>
                                  );
                                }
                              }
                            })()}
                          </>
                        )}
                      </>
                    )}
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}
