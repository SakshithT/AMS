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
  const [searchQuery, setSearchQuery] = useState("");

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

  const matchSearch = (u) => {
    const q = searchQuery.toLowerCase();
    const matchName = (u.username && u.username.toLowerCase().includes(q)) ||
      (u.fullName && u.fullName.toLowerCase().includes(q));

    if (activeTab === "residents") {
      return matchName || (u.flatNumber && u.flatNumber.toString().includes(q));
    }
    return matchName;
  };

  const displayedUsers = (activeTab === "all" ? allActiveUsers : (activeTab === "residents" ? residentUsers : pendingUsers))
    .filter(u => matchSearch(u));

  return (
    <div className="fade-in-up">
      <div className="page-header page-header-container">
        <div>
          <h1 className="page-title">Manage Users</h1>
          <p className="page-subtitle">Create and manage admin & security users</p>
        </div>
        <button className="btn btn-gradient-blue" onClick={() => { if (!showForm) { resetForm(); } setShowForm(!showForm); }}>
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
                <button type="button" cl


                  assName="inline-btn inline-btn-cancel" onClick={() => { resetForm(); setShowForm(false); }}>
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
        <div className="action-group tab-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
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

          <div style={{ display: 'flex', gap: '10px', flex: '1', minWidth: '300px', justifyContent: 'flex-end' }}>
            <input
              type="text"
              placeholder={activeTab === "residents" ? "Search by name, username or flat..." : "Search by name or username..."}
              className="inline-form-input"
              style={{ maxWidth: '300px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Users Grid - Card Format (Full Details) */}
        <div className="users-grid-compact">
          {displayedUsers.length === 0 ? (
            <p className="empty-text">No users found in this category.</p>
          ) : (
            displayedUsers.map((user) => {
              const isDeactivated = user.status === "DEACTIVATED" || user.status === "PENDING";
              const userRole = getRole(user);

              // Determine avatar color based on role
              const getAvatarGradient = () => {
                if (userRole === "ROLE_ADMIN") return "linear-gradient(135deg, #9b59b6, #8e44ad)";
                if (userRole === "ROLE_SECURITY") return "linear-gradient(135deg, #3498db, #2980b9)";
                return "linear-gradient(135deg, #27ae60, #229954)";
              };

              return (
                <div key={user.id} className="user-card-compact">
                  <div className="user-card-compact-header">
                    <div className="user-card-compact-avatar" style={{ background: getAvatarGradient() }}>
                      {user.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-card-compact-info">
                      <h4>{user.username}</h4>
                      <p>{user.email}</p>
                    </div>
                    <span className={`badge ${isDeactivated ? "badge-inactive" : "badge-active"}`}>
                      {user.status || "ACTIVE"}
                    </span>
                  </div>

                  <div className="user-card-compact-details">
                    <div><strong>Role:</strong> <span>{userRole === "ROLE_ADMIN" ? "Admin" : userRole === "ROLE_SECURITY" ? "Security" : "Resident"}</span></div>
                    <div><strong>Phone:</strong> <span>{user.contactNumber || "N/A"}</span></div>
                    {userRole === "ROLE_RESIDENT" && (
                      <>
                        <div><strong>Flat:</strong> <span>{user.flatNumber ? `Flat ${user.flatNumber}` : "Not Assigned"}</span></div>
                        <div><strong>Block:</strong> <span>{user.blockName || "N/A"}</span></div>
                      </>
                    )}
                  </div>

                  <div className="user-card-compact-actions">
                    {!isDeactivated ? (
                      <>
                        {deactivateConfirmId === user.id ? (
                          <div className="action-group">
                            <button className="btn btn-danger btn-sm" onClick={() => confirmDeactivate(user.id)} disabled={deactivatingId === user.id}>
                              {deactivatingId === user.id ? "..." : "Confirm"}
                            </button>
                            <button className="btn btn-secondary btn-sm" onClick={cancelDeactivate}>Cancel</button>
                          </div>
                        ) : (
                          <button className="btn btn-danger btn-sm" onClick={() => handleDeactivate(user.id)}>Deactivate</button>
                        )}
                      </>
                    ) : (
                      <>
                        {reactivateUserId === user.id ? (
                          <div className="reactivate-compact">
                            {userRole === "ROLE_RESIDENT" && (
                              <select
                                className="inline-form-select"
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
                            )}
                            {flatIdError && <span className="inline-form-error">{flatIdError}</span>}
                            <div className="action-group">
                              <button className="btn btn-primary btn-sm" onClick={() => submitReactivate(user)}>
                                {userRole === "ROLE_RESIDENT" ? (user.status === "PENDING" ? "Approve" : "Reactivate") : (user.status === "PENDING" ? "Approve" : "Reactivate")}
                              </button>
                              <button className="btn btn-secondary btn-sm" onClick={() => { setReactivateUserId(null); setFlatIdToAllocate(""); setFlatIdError(""); }}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {user.status === "PENDING" ? (
                              <div className="action-group">
                                <button className="btn btn-success btn-sm" onClick={() => setReactivateUserId(user.id)}>Approve</button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleReject(user.id)} disabled={rejectingId === user.id}>
                                  {rejectingId === user.id ? "..." : "Reject"}
                                </button>
                              </div>
                            ) : (
                              userRole === "ROLE_RESIDENT" ? (
                                <button className="btn btn-primary btn-sm" onClick={() => setReactivateUserId(user.id)}>Reactivate</button>
                              ) : (
                                <button className="btn btn-success btn-sm" onClick={() => reactivateNonResident(user)}>Reactivate</button>
                              )
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
