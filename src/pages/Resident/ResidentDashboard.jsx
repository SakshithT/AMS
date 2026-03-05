import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosConfig";
import "./ResidentDashboard.css";
import "../../components/Admin/AdminShared.css";
import ResidentPolls from "../../components/Resident/Polls";
import Facilities from "../../components/Resident/Facilities";

function ResidentDashboard() {
  const [activeView, setActiveView] = useState("profile");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [flat, setFlat] = useState(null);
  const [maintenanceList, setMaintenanceList] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [notices, setNotices] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState({ username: "", email: "", contactNumber: "" });
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintData, setComplaintData] = useState({ title: "", description: "", category: "GENERAL", priority: "MEDIUM" });
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const navigate = useNavigate();

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
  };

  useEffect(() => {
    fetchProfile();
    fetchMyFlat();
    fetchMaintenance();
    fetchComplaints();
    fetchNotices();
    fetchStaff();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axiosInstance.get("/user/profile");
      const profileData = response.data.data;
      setUser(profileData);
      setProfileFormData({
        username: profileData.username || "",
        email: profileData.email || "",
        contactNumber: profileData.contactNumber || ""
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyFlat = async () => {
    try {
      const response = await axiosInstance.get("/user/flat");
      setFlat(response.data.data);
    } catch (error) {
      console.error("Error fetching flat:", error);
    }
  };

  const fetchMaintenance = async () => {
    try {
      const response = await axiosInstance.get("/user/maintenance");
      const data = response.data.data;
      setMaintenanceList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching maintenance:", error);
    }
  };

  const fetchComplaints = async () => {
    try {
      const response = await axiosInstance.get("/user/complaints");
      const data = response.data.data;
      setComplaints(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching complaints:", error);
    }
  };

  const fetchNotices = async () => {
    try {
      const response = await axiosInstance.get("/user/notices");
      const data = response.data.data;
      setNotices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching notices:", error);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await axiosInstance.get("/user/staff");
      const data = response.data.data;
      setStaffList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching staff:", error);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      await axiosInstance.put("/user/profile", profileFormData);
      setUser({ ...user, ...profileFormData });
      setIsEditingProfile(false);
      showToast("Profile updated successfully!");
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to update profile", "error");
    }
  };

  const handleComplaintSubmit = async () => {
    if (!complaintData.title.trim()) {
      showToast("Please enter a complaint title", "error");
      return;
    }
    try {
      await axiosInstance.post("/user/complaints", complaintData);
      showToast("Complaint submitted successfully!");
      setShowComplaintModal(false);
      setComplaintData({ title: "", description: "", category: "GENERAL", priority: "MEDIUM" });
      fetchComplaints();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to submit complaint", "error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const sidebarItems = [
    { id: "profile", label: "My Profile", icon: "👤" },
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "myFlat", label: "My Flat", icon: "🏠" },
    { id: "notices", label: "Notices", icon: "📢" },
    { id: "polls", label: "Polls", icon: " M" },
    { id: "facilities", label: "Facilities", icon: "🏊" },
    { id: "staff", label: "Contact Staff", icon: "👨‍💼" },
    { id: "maintenance", label: "Maintenance", icon: "🔧" },
    { id: "complaints", label: "Complaints", icon: "📝" }
  ];

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { class: "badge-pending", label: "Pending" },
      RESOLVED: { class: "badge-resolved", label: "Resolved" },
      IN_PROGRESS: { class: "badge-progress", label: "In Progress" },
      PAID: { class: "badge-paid", label: "Paid" },
      OVERDUE: { class: "badge-overdue", label: "Overdue" }
    };
    const statusInfo = statusMap[status] || { class: "badge-neutral", label: status };
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  if (loading) {
    return (
      <div className="resident-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`resident-dashboard ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* TOAST NOTIFICATION */}
      {toast.show && (
        <div className={`toast-notification ${toast.type === "error" ? "toast-error" : "toast-success"}`}>
          {toast.message}
        </div>
      )}
      {/* SIDEBAR */}
      <aside className={`resident-sidebar ${isSidebarOpen ? '' : 'collapsed'}`}>
        <div className="sidebar-header">
          <div className="resident-logo">🏠</div>
          {isSidebarOpen && <div className="resident-title">Resident Panel</div>}
          <button className="menu-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? '☰' : '☰'}
          </button>
        </div>
        <nav className="sidebar-nav">
          {sidebarItems.map(item => (
            <div
              key={item.id}
              className={`nav-item ${activeView === item.id ? "active" : ""}`}
              onClick={() => setActiveView(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="resident-user-info">
            <div className="user-avatar">{user?.username?.charAt(0).toUpperCase()}</div>
            <div className="user-details">
              <span className="user-name">{user?.username}</span>
              <span className="user-role">Resident</span>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className={`main-content ${isSidebarOpen ? '' : 'expanded'}`}>
        {activeView === "polls" && (
          <div className="fade-in-up">
            <div className="page-header">
              <h1>Polls</h1>
              <p className="page-subtitle">Vote on community polls</p>
            </div>
            <ResidentPolls />
          </div>
        )}

        {activeView === "facilities" && <Facilities />}

        {/* PROFILE SECTION - Shown immediately on login */}
        {activeView === "profile" && (
          <div className="fade-in-up">
            <div className="page-header">
              <h1>My Profile</h1>
              <p className="page-subtitle">Manage your personal information</p>
            </div>

            <div className="profile-container">
              <div className="profile-card">
                <div className="profile-header">
                  <div className="profile-avatar-large">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="profile-basic-info">
                    <h2>{user?.username}</h2>
                    <p className="profile-email">{user?.email}</p>
                    <span className="badge badge-resident">Resident</span>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                  >
                    {isEditingProfile ? "Cancel" : "Edit Profile"}
                  </button>
                </div>

                <div className="profile-details">
                  <div className="detail-row">
                    <label>Username</label>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        className="form-input"
                        value={profileFormData.username}
                        onChange={(e) => setProfileFormData({ ...profileFormData, username: e.target.value })}
                      />
                    ) : (
                      <span>{user?.username}</span>
                    )}
                  </div>
                  <div className="detail-row">
                    <label>Email</label>
                    {isEditingProfile ? (
                      <input
                        type="email"
                        className="form-input"
                        value={profileFormData.email}
                        onChange={(e) => setProfileFormData({ ...profileFormData, email: e.target.value })}
                      />
                    ) : (
                      <span>{user?.email}</span>
                    )}
                  </div>
                  <div className="detail-row">
                    <label>Phone</label>
                    {isEditingProfile ? (
                      <input
                        type="tel"
                        className="form-input"
                        value={profileFormData.contactNumber}
                        onChange={(e) => setProfileFormData({ ...profileFormData, contactNumber: e.target.value })}
                      />
                    ) : (
                      <span>{user?.contactNumber || "Not set"}</span>
                    )}
                  </div>
                  <div className="detail-row">
                    <label>Status</label>
                    <span className="badge badge-active">{user?.status || "Active"}</span>
                  </div>

                  {isEditingProfile && (
                    <div className="profile-actions">
                      <button className="btn btn-success" onClick={handleProfileUpdate}>
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* OVERVIEW SECTION */}
        {activeView === "overview" && (
          <div className="fade-in-up">
            <div className="page-header">
              <h1>Overview</h1>
              <p className="page-subtitle">Summary of your apartment details</p>
            </div>

            {/* Flat Info Summary */}
            <div className="overview-section">
              <h3>🏠 Your Flat Details</h3>
              <div className="info-cards-grid">
                <div className="info-card">
                  <div className="info-card-icon">🚪</div>
                  <div className="info-card-content">
                    <h3>Flat Number</h3>
                    <p>{flat?.flatNumber || "Not assigned"}</p>
                  </div>
                </div>
                <div className="info-card">
                  <div className="info-card-icon">🏢</div>
                  <div className="info-card-content">
                    <h3>Block</h3>
                    <p>{flat?.blockName || "Not assigned"}</p>
                  </div>
                </div>
                <div className="info-card">
                  <div className="info-card-icon">🏗️</div>
                  <div className="info-card-content">
                    <h3>Floor</h3>
                    <p>{flat?.floorNumber || "N/A"}</p>
                  </div>
                </div>
                <div className="info-card">
                  <div className="info-card-icon">✅</div>
                  <div className="info-card-content">
                    <h3>Status</h3>
                    <p>{flat?.status || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Maintenance Summary */}
            <div className="overview-section">
              <h3>🔧 Maintenance Status</h3>
              {maintenanceList.length > 0 ? (() => {
                const latestMaintenance = maintenanceList[maintenanceList.length - 1];
                return (
                  <div className="maintenance-card">
                    <div className="maintenance-header">
                      <h3>Latest Record</h3>
                      {getStatusBadge(latestMaintenance.paymentStatus)}
                    </div>
                    <div className="maintenance-details">
                      <div className="detail-item">
                        <label>Amount</label>
                        <span className="amount">₹{latestMaintenance.amount}</span>
                      </div>
                      <div className="detail-item">
                        <label>Due Date</label>
                        <span>{latestMaintenance.dueDate}</span>
                      </div>
                      <div className="detail-item">
                        <label>Period</label>
                        <span>{latestMaintenance.month}/{latestMaintenance.year}</span>
                      </div>
                    </div>
                  </div>
                );
              })() : (
                <div className="empty-state-small">
                  <p>No maintenance records found.</p>
                </div>
              )}
            </div>

            {/* Complaints Summary */}
            <div className="overview-section">
              <h3>📝 Recent Complaints</h3>
              <div className="complaints-summary">
                {complaints.length === 0 ? (
                  <div className="empty-state-small">
                    <p>No complaints submitted yet.</p>
                  </div>
                ) : (
                  complaints.slice(0, 3).map((complaint) => (
                    <div key={complaint.id} className="complaint-item-small">
                      <div className="complaint-item-header">
                        <h4>{complaint.title}</h4>
                        {getStatusBadge(complaint.status)}
                      </div>
                      <p>{complaint.description?.substring(0, 100)}...</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Notices Summary */}
            <div className="overview-section">
              <h3>📢 Recent Notices</h3>
              <div className="notices-summary">
                {notices.length === 0 ? (
                  <div className="empty-state-small">
                    <p>No notices available.</p>
                  </div>
                ) : (
                  notices.slice(0, 3).map((notice) => (
                    <div key={notice.id} className="notice-item-small">
                      <h4>{notice.title}</h4>
                      <p>{notice.description?.substring(0, 100)}...</p>
                      <span className="notice-date">{notice.month} {notice.year}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* MY FLAT SECTION */}
        {activeView === "myFlat" && (
          <div className="fade-in-up">
            <div className="page-header">
              <h1>My Flat</h1>
              <p className="page-subtitle">View your flat details</p>
            </div>

            <div className="info-cards-grid">
              <div className="info-card">
                <div className="info-card-icon">🚪</div>
                <div className="info-card-content">
                  <h3>Flat Number</h3>
                  <p>{flat?.flatNumber || "Not assigned"}</p>
                </div>
              </div>
              <div className="info-card">
                <div className="info-card-icon">🏢</div>
                <div className="info-card-content">
                  <h3>Block</h3>
                  <p>{flat?.blockName || "Not assigned"}</p>
                </div>
              </div>
              <div className="info-card">
                <div className="info-card-icon">🏗️</div>
                <div className="info-card-content">
                  <h3>Floor</h3>
                  <p>{flat?.floorNumber || "N/A"}</p>
                </div>
              </div>
              <div className="info-card">
                <div className="info-card-icon">✅</div>
                <div className="info-card-content">
                  <h3>Status</h3>
                  <p>{flat?.status || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* NOTICES SECTION */}
        {activeView === "notices" && (
          <div className="fade-in-up">
            <div className="page-header">
              <h1>Notices & Monthly Expenses</h1>
              <p className="page-subtitle">View apartment notices and monthly expenses</p>
            </div>

            <div className="notices-list">
              {notices.length === 0 ? (
                <div className="empty-state">
                  <p>No notices available.</p>
                </div>
              ) : (
                notices.map((notice) => (
                  <div key={notice.id} className="notice-item">
                    <div className="notice-header">
                      <h4>{notice.title}</h4>
                      <span className="notice-date">{notice.month} {notice.year}</span>
                    </div>
                    <p>{notice.description}</p>
                    <div className="notice-meta">
                      <span>Published: {new Date(notice.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* STAFF SECTION */}
        {activeView === "staff" && (
          <div className="fade-in-up">
            <div className="page-header">
              <h1>Staff Details</h1>
              <p className="page-subtitle">Contact details for security and cleaning staff</p>
            </div>

            <div className="info-cards-grid">
              {staffList.filter(s => s.role === 'SECURITY' || s.designation === 'HOUSE KEEPING' || s.designation === 'CLEANING').length === 0 ? (
                <div className="empty-state">
                  <p>No staff contacts available at the moment.</p>
                </div>
              ) : (
                staffList
                  .filter(s => s.role === 'SECURITY' || s.designation === 'HOUSE KEEPING' || s.designation === 'CLEANING' || s.designation === 'MAINTENANCE' || s.designation === 'ELECTRICIAN' || s.designation === 'MANAGER')
                  .map((staffMember) => (
                    <div key={staffMember.id} className="info-card">
                      <div className="info-card-icon">
                        {staffMember.designation === 'HOUSE KEEPING' || staffMember.designation === 'CLEANING' ? '🧹' :
                          staffMember.designation === 'MAINTENANCE' || staffMember.designation === 'ELECTRICIAN' ? '🔧' : '🛡️'}
                      </div>
                      <div className="info-card-content">
                        <h3>{staffMember.username}</h3>
                        <p>{staffMember.designation || "Staff"}</p>
                        <div style={{ marginTop: '10px', fontSize: '14px' }}>
                          <div><strong>Phone:</strong> {staffMember.contactNumber || "N/A"}</div>
                          <div><strong>Email:</strong> {staffMember.email || "N/A"}</div>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* MAINTENANCE SECTION */}
        {activeView === "maintenance" && (
          <div className="fade-in-up">
            <div className="page-header">
              <h1>Maintenance</h1>
              <p className="page-subtitle">View your maintenance records</p>
            </div>

            {maintenanceList.length > 0 ? (
              <div className="maintenance-table-container">
                <table className="visitor-table">
                  <thead>
                    <tr>
                      <th>Period</th>
                      <th>Amount</th>
                      <th>Due Date</th>
                      <th>Paid Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenanceList.map((record) => (
                      <tr key={record.id}>
                        <td>{record.month}/{record.year}</td>
                        <td>&#x20B9;{record.amount}</td>
                        <td>{record.dueDate || "-"}</td>
                        <td>{record.paidDate || "-"}</td>
                        <td>
                          <span className={`badge ${record.paymentStatus === "PAID" ? "badge-success" : "badge-warning"}`}>
                            {record.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <p>No maintenance records found.</p>
              </div>
            )}
          </div>
        )}


        {/* COMPLAINTS SECTION */}
        {activeView === "complaints" && (
          <div className="fade-in-up">
            <div className="page-header page-header-container">
              <div>
                <h1>Complaints</h1>
                <p className="page-subtitle">Manage your complaints</p>
              </div>
              <button className="btn btn-primary" onClick={() => setShowComplaintModal(!showComplaintModal)}>
                {showComplaintModal ? '✕ Close Form' : '+ Raise Complaint'}
              </button>
            </div>

            {/* Complaint Inline Form */}
            {showComplaintModal && (
              <div className="inline-form-card inline-form-complaint fade-in-up mb-24">
                <div className="inline-form-accent accent-red"></div>
                <div className="inline-form-header">
                  <div className="inline-form-icon icon-red">
                    <span>📝</span>
                  </div>
                  <div>
                    <h3>Raise a Complaint</h3>
                    <p>Submit a new issue or request to administration</p>
                  </div>
                </div>
                <div className="inline-form-body">
                  <div className="inline-form-row">
                    <div className="inline-form-group wide-group">
                      <label>Title <span className="required-star">*</span></label>
                      <input
                        type="text"
                        className="inline-form-input"
                        placeholder="Enter complaint title"
                        value={complaintData.title}
                        onChange={(e) => setComplaintData({ ...complaintData, title: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="inline-form-row">
                    <div className="inline-form-group wide-group">
                      <label>Description <span className="required-star">*</span></label>
                      <textarea
                        className="inline-form-input"
                        rows="3"
                        placeholder="Describe your complaint in detail..."
                        value={complaintData.description}
                        onChange={(e) => setComplaintData({ ...complaintData, description: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="inline-form-row">
                    <div className="inline-form-group">
                      <label>Category <span className="required-star">*</span></label>
                      <select
                        className="inline-form-select"
                        value={complaintData.category}
                        onChange={(e) => setComplaintData({ ...complaintData, category: e.target.value })}
                      >
                        <option value="GENERAL">General</option>
                        <option value="MAINTENANCE">Maintenance</option>
                        <option value="NOISE">Noise</option>
                        <option value="SECURITY">Security</option>
                        <option value="CLEANLINESS">Cleanliness</option>
                      </select>
                    </div>
                    <div className="inline-form-group">
                      <label>Priority <span className="required-star">*</span></label>
                      <select
                        className="inline-form-select"
                        value={complaintData.priority}
                        onChange={(e) => setComplaintData({ ...complaintData, priority: e.target.value })}
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                      </select>
                    </div>
                  </div>
                  <div className="inline-form-actions">
                    <button className="inline-btn inline-btn-cancel" onClick={() => setShowComplaintModal(false)}>
                      Cancel
                    </button>
                    <button className="inline-btn inline-btn-submit btn-gradient-blue" onClick={handleComplaintSubmit}>
                      📝 Submit Complaint
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Complaints List */}
            <div className="complaints-list">
              {complaints.length === 0 ? (
                <div className="empty-state">
                  <p>No complaints submitted yet.</p>
                </div>
              ) : (
                complaints.map((complaint) => (
                  <div key={complaint.id} className="complaint-item">
                    <div className="complaint-item-header">
                      <h4>{complaint.title}</h4>
                      {getStatusBadge(complaint.status)}
                    </div>
                    <p>{complaint.description}</p>
                    <div className="complaint-meta">
                      <span>{complaint.category}</span>
                      <span>•</span>
                      <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ResidentDashboard;
