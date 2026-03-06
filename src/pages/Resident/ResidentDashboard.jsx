import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosConfig";
import "../../components/Admin/AdminShared.css";
import ResidentPolls from "../../components/Resident/Polls";
import Facilities from "../../components/Resident/Facilities";
import ClubhouseBookings from "../../components/Resident/ClubhouseBookings";

// ── SVG Icons ─────────────────────────────────────────────
const I = ({ d, size = 18, stroke = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    {typeof d === 'string' ? <path d={d} /> : d}
  </svg>
);
const UserIconSVG = () => <I d={<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>} />;
const GridIconSVG = () => <I d={<><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></>} />;
const HomeIconSVG = () => <I d={<><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>} />;
const BellIconSVG = () => <I d={<><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>} />;
const VoteIconSVG = () => <I d={<><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><polyline points="9 21 9 9" /></>} />;
const PoolIconSVG = () => <I d={<><path d="M2 12h20M2 17h20M7 12V7a5 5 0 0 1 10 0v5" /></>} />;
const ClubIconSVG = () => <I d={<><path d="M8 3a4 4 0 0 1 8 0" /><path d="M4 14h16" /><path d="M12 3v11" /><path d="M4 21h16a1 1 0 0 0 0-7H4a1 1 0 0 0 0 7z" /></>} />;
const BriefIconSVG = () => <I d={<><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></>} />;
const WrenchIconSVG = () => <I d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />;
const FileIconSVG = () => <I d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></>} />;
const LogoutIconSVG = () => <I d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" size={16} />;
const MenuIconSVG = () => <I d={<><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>} />;

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
    { id: "profile", label: "My Profile", icon: <UserIconSVG /> },
    { id: "overview", label: "Overview", icon: <GridIconSVG /> },
    { id: "myFlat", label: "My Flat", icon: <HomeIconSVG /> },
    { id: "notices", label: "Notices", icon: <BellIconSVG /> },
    { id: "polls", label: "Polls", icon: <VoteIconSVG /> },
    { id: "facilities", label: "Facilities", icon: <PoolIconSVG /> },
    { id: "clubhouse", label: "Clubhouse", icon: <ClubIconSVG /> },
    { id: "staff", label: "Contact Staff", icon: <BriefIconSVG /> },
    { id: "maintenance", label: "Maintenance", icon: <WrenchIconSVG /> },
    { id: "complaints", label: "Complaints", icon: <FileIconSVG /> },
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
    <div className="dashboard-layout">
      {/* TOAST NOTIFICATION */}
      {toast.show && (
        <div className={`toast-notification ${toast.type === "error" ? "toast-error" : "toast-success"}`}>
          {toast.message}
        </div>
      )}
      {/* SIDEBAR */}
      <aside className={`resident-sidebar ${isSidebarOpen ? '' : 'collapsed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand-icon"><HomeIconSVG /></div>
          {isSidebarOpen && (
            <div className="sidebar-brand-text">
              <div className="brand-title">AMS Portal</div>
              <div className="brand-sub">Resident Panel</div>
            </div>
          )}
          <button className="menu-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <MenuIconSVG />
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
          <div className="sidebar-user-card">
            <div className="user-avatar">{user?.username?.charAt(0).toUpperCase()}</div>
            {isSidebarOpen && (
              <div className="user-info">
                <div className="user-name">{user?.username}</div>
                <div className="user-role">Resident</div>
              </div>
            )}
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            <LogoutIconSVG /> {isSidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className={`main-wrapper ${isSidebarOpen ? '' : 'expanded'}`}>
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

        {activeView === "clubhouse" && <ClubhouseBookings />}

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
