import React, { useEffect, useState, useRef } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import axiosInstance from "../../utils/axiosConfig";
import "../../components/Admin/AdminShared.css";

import ManageUsers from "../../components/Admin/ManageUsers";
import ManageApartments from "../../components/Admin/ManageApartments";
import ManageMaintenance from "../../components/Admin/ManageMaintenance";
import ManageComplaints from "../../components/Admin/ManageComplaints";
import ManagePolls from "../../components/Admin/Polls";
import ManageFacilities from "../../components/Admin/ManageFacilities";
import ManageClubhouse from "../../components/Admin/ManageClubhouse";

// ── SVG Icons ─────────────────────────────────────────────
const I = ({ d, size = 18, stroke = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    {typeof d === 'string' ? <path d={d} /> : d}
  </svg>
);
const UserIcon = () => <I d={<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>} />;
const GridIcon = () => <I d={<><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></>} />;
const BellIcon = () => <I d={<><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>} />;
const UsersIcon = () => <I d={<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>} />;
const WrenchIcon = () => <I d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />;
const BuildingIcon = () => <I d={<><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M9 22V12h6v10" /><rect x="8" y="6" width="3" height="3" rx="0.5" /><rect x="13" y="6" width="3" height="3" rx="0.5" /></>} />;
const FileTextIcon = () => <I d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></>} />;
const CpuIcon = () => <I d={<><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" /><line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" /><line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" /><line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" /></>} />;
const BarChart2Icon = () => <I d={<><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></>} />;
const HomeIcon = () => <I d={<><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>} />;
const ClubIcon = () => <I d={<><path d="M12 2a5 5 0 0 1 5 5c0 2-1 4-3 5h4a3 3 0 0 1 3 3v1H3v-1a3 3 0 0 1 3-3h4c-2-1-3-3-3-5a5 5 0 0 1 5-5z" /></>} />;
const VoteIcon = () => <I d={<><path d="M3 6h18M3 12h18M3 18h18" /></>} />;
const LogoutIcon = () => <I d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" size={16} />;
const CheckIcon = () => <I d="M20 6 9 17 4 12" size={16} />;
const XIcon = () => <I d="M18 6 6 18M6 6l12 12" size={16} />;

const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => { onClose(toast.id); }, 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);
  return (
    <div className={`toast ${toast.type}`}>
      <div className="toast-icon">{toast.type === 'success' ? <CheckIcon /> : <XIcon />}</div>
      <div className="toast-content">
        <div className="toast-title">{toast.title}</div>
        <div className="toast-message">{toast.message}</div>
      </div>
      <button className="toast-close" onClick={() => onClose(toast.id)}>×</button>
    </div>
  );
};

// Toast container component
const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onClose={removeToast} />
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState("profile");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [flats, setFlats] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [adminProfile, setAdminProfile] = useState({ username: "", email: "", phone: "", role: "" });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState({ username: "", email: "", phone: "" });
  const [loading, setLoading] = useState(true);

  // Toast notifications state
  const [toasts, setToasts] = useState([]);

  // New state for notices and staff
  const [notices, setNotices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [noticeFormData, setNoticeFormData] = useState({ title: "", description: "", month: "", year: new Date().getFullYear() });
  const [staffFormData, setStaffFormData] = useState({ username: "", email: "", phone: "", designation: "HOUSE KEEPING", role: "SECURITY", password: "" });

  // Loading states for forms
  const [noticeLoading, setNoticeLoading] = useState(false);
  const [staffLoading, setStaffLoading] = useState(false);

  // Form validation errors
  const [noticeErrors, setNoticeErrors] = useState({});
  const [staffErrors, setStaffErrors] = useState({});

  // Password visibility toggle
  const [showPassword, setShowPassword] = useState(false);

  {
    activeView === "managePolls" && (
      <ManagePolls />
    )
  }

  // Modal refs for click outside detection
  const noticeModalRef = useRef(null);
  const staffModalRef = useRef(null);

  // Toast helper functions
  const addToast = (type, title, message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Form validation functions
  const validateNoticeForm = () => {
    const errors = {};
    if (!noticeFormData.title.trim()) {
      errors.title = "Notice title is required";
    }
    if (!noticeFormData.description.trim()) {
      errors.description = "Description is required";
    }
    if (!noticeFormData.month) {
      errors.month = "Month is required";
    }
    setNoticeErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStaffForm = () => {
    const errors = {};
    if (!staffFormData.username.trim()) {
      errors.username = "Username is required";
    }
    if (!staffFormData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(staffFormData.email)) {
      errors.email = "Invalid email format";
    }
    if (!staffFormData.password) {
      errors.password = "Password is required";
    } else if (staffFormData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    setStaffErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNoticeModal && noticeModalRef.current && !noticeModalRef.current.contains(event.target)) {
        setShowNoticeModal(false);
        setNoticeErrors({});
      }
      if (showStaffModal && staffModalRef.current && !staffModalRef.current.contains(event.target)) {
        setShowStaffModal(false);
        setStaffErrors({});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNoticeModal, showStaffModal]);

  useEffect(() => {
    loadFlats();
    loadBlocks();
    loadApartments();
    loadAdminProfile();
    loadNotices();
    loadStaff();
  }, []);

  const loadAdminProfile = async () => {
    try {
      const response = await axiosInstance.get("/admin/profile");
      const profileData = response.data.data;
      setAdminProfile(profileData);
      setProfileFormData({
        username: profileData.username || "",
        email: profileData.email || "",
        phone: profileData.contactNumber || ""
      });
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadFlats = async () => {
    try {
      const response = await axiosInstance.get("/flats");
      let data = response.data;
      if (data && data.data) data = data.data;
      if (data && data.content) data = data.content;
      setFlats(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading flats:", error);
      setFlats([]);
    }
  };

  const loadBlocks = async () => {
    try {
      const response = await axiosInstance.get("/blocks");
      let data = response.data;
      if (data && data.data) data = data.data;
      if (data && data.content) data = data.content;
      setBlocks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading blocks:", error);
      setBlocks([]);
    }
  };

  const loadApartments = async () => {
    try {
      const response = await axiosInstance.get("/apartments");
      let data = response.data;
      if (data && data.data) data = data.data;
      if (data && data.content) data = data.content;
      setApartments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading apartments:", error);
      setApartments([]);
    }
  };

  const loadNotices = async () => {
    try {
      const response = await axiosInstance.get("/admin/notices");
      const noticesData = response.data.data || response.data || [];
      setNotices(Array.isArray(noticesData) ? noticesData : []);
    } catch (error) {
      console.error("Error loading notices:", error);
      setNotices([]);
    }
  };

  const loadStaff = async () => {
    try {
      const response = await axiosInstance.get("/admin/staff");
      const staffData = response.data.data || response.data || [];
      setStaff(Array.isArray(staffData) ? staffData : []);
    } catch (error) {
      console.error("Error loading staff:", error);
      setStaff([]);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      await axiosInstance.put("/admin/update-profile", {
        username: profileFormData.username,
        email: profileFormData.email,
        contactNumber: profileFormData.phone,
        password: profileFormData.password || null
      });

      setAdminProfile({
        ...adminProfile,
        username: profileFormData.username,
        email: profileFormData.email,
        contactNumber: profileFormData.phone
      });

      setIsEditingProfile(false);
      addToast("success", "Success", "Profile updated successfully!");
    } catch (error) {
      addToast(
        "error",
        "Error",
        error.response?.data?.message || "Failed to update profile"
      );
    }
  };

  const handleNoticeSubmit = async () => {
    if (!validateNoticeForm()) {
      return;
    }

    setNoticeLoading(true);
    try {
      await axiosInstance.post("/admin/notices", noticeFormData);
      addToast("success", "Success", "Notice published successfully!");
      setShowNoticeModal(false);
      setNoticeFormData({ title: "", description: "", month: "", year: new Date().getFullYear() });
      setNoticeErrors({});
      loadNotices();
    } catch (error) {
      addToast("error", "Error", error.response?.data?.message || "Failed to publish notice");
    } finally {
      setNoticeLoading(false);
    }
  };

  const handleNoticeDelete = async (id) => {
    try {
      await axiosInstance.delete(`/admin/notices/${id}`);
      addToast("success", "Success", "Notice deleted successfully!");
      loadNotices();
    } catch (error) {
      addToast("error", "Error", "Failed to delete notice");
    }
  };

  const handleStaffSubmit = async () => {
    if (!validateStaffForm()) {
      return;
    }

    setStaffLoading(true);
    try {
      await axiosInstance.post("/admin/staff", {
        username: staffFormData.username,
        email: staffFormData.email,
        contactNumber: staffFormData.phone,
        designation: staffFormData.designation,
        role: staffFormData.role,
        password: staffFormData.password
      });
      addToast("success", "Success", "Staff member added successfully!");
      setShowStaffModal(false);
      setStaffFormData({ username: "", email: "", phone: "", designation: "HOUSE KEEPING", role: "SECURITY", password: "" });
      setStaffErrors({});
      loadStaff();
    } catch (error) {
      addToast("error", "Error", error.response?.data?.message || "Failed to add staff member");
    } finally {
      setStaffLoading(false);
    }
  };

  const handleStaffDelete = async (id) => {
    try {
      await axiosInstance.delete(`/admin/staff/${id}`);
      addToast("success", "Success", "Staff member removed successfully!");
      loadStaff();
    } catch (error) {
      addToast("error", "Error", "Failed to remove staff member");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const closeNoticeModal = () => {
    setShowNoticeModal(false);
    setNoticeErrors({});
    setNoticeFormData({ title: "", description: "", month: "", year: new Date().getFullYear() });
  };

  const closeStaffModal = () => {
    setShowStaffModal(false);
    setStaffErrors({});
    setStaffFormData({ username: "", email: "", phone: "", designation: "HOUSE KEEPING", role: "SECURITY", password: "" });
    setShowPassword(false);
  };

  const sidebarItems = [
    { id: "profile", label: "My Profile", icon: <UserIcon /> },
    { id: "overview", label: "Overview", icon: <GridIcon /> },
    { id: "notices", label: "Notices", icon: <BellIcon /> },
    { id: "staff", label: "Staff Management", icon: <UsersIcon /> },
    { id: "manageUsers", label: "Manage Users", icon: <UserIcon /> },
    { id: "manageMaintenance", label: "Maintenance", icon: <WrenchIcon /> },
    { id: "manageApartments", label: "Apartments", icon: <BuildingIcon /> },
    { id: "manageComplaints", label: "Complaints", icon: <FileTextIcon /> },
    { id: "manageFacilities", label: "Facilities", icon: <CpuIcon /> },
    { id: "manageClubhouse", label: "Clubhouse", icon: <ClubIcon /> },
    { id: "managePolls", label: "Polls", icon: <VoteIcon /> },
  ];

  if (loading) {
    return (
      <div className="dashboard-layout">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${isSidebarOpen ? '' : 'collapsed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand-icon"><BuildingIcon /></div>
          {isSidebarOpen && (
            <div className="sidebar-brand-text">
              <div className="brand-title">AMS Portal</div>
              <div className="brand-sub">Admin Panel</div>
            </div>
          )}
          <button className="menu-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <BarChart2Icon />
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
            <div className="user-avatar">{adminProfile.username?.charAt(0).toUpperCase()}</div>
            {isSidebarOpen && (
              <div className="user-info">
                <div className="user-name">{adminProfile.username}</div>
                <div className="user-role">Administrator</div>
              </div>
            )}
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            <LogoutIcon /> {isSidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className={`main-wrapper ${isSidebarOpen ? '' : 'expanded'}`}>
        {/* PROFILE SECTION */}
        {activeView === "profile" && (
          <div className="fade-in-up">
            <div className="page-header page-header-container">
              <div>
                <h1>My Profile</h1>
                <p className="page-subtitle">Manage your personal information</p>
              </div>
            </div>
            <div className="profile-container">
              <div className="profile-card">
                <div className="profile-header">
                  <div className="profile-avatar-large">
                    {adminProfile.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="profile-basic-info">
                    <h2>{adminProfile.username}</h2>
                    <p className="profile-email">{adminProfile.email}</p>
                    <span className="badge badge-admin">Administrator</span>
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
                      <span>{adminProfile.username}</span>
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
                      <span>{adminProfile.email}</span>
                    )}
                  </div>
                  <div className="detail-row">
                    <label>Phone</label>
                    {isEditingProfile ? (
                      <input
                        type="tel"
                        className="form-input"
                        value={profileFormData.phone}
                        onChange={(e) => setProfileFormData({ ...profileFormData, phone: e.target.value })}
                      />
                    ) : (
                      <span>{adminProfile.contactNumber || "Not set"}</span>
                    )}
                  </div>
                  <div className="detail-row">
                    <label>Role</label>
                    <span>Administrator</span>
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
              <p className="page-subtitle">Complete overview of your apartment management system</p>
            </div>

            <div className="stat-grid">
              <div className="stat-card">
                <div className="stat-icon">🏢</div>
                <div className="stat-content">
                  <h3>Total Apartments</h3>
                  <p className="stat-number">{apartments.length}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🏠</div>
                <div className="stat-content">
                  <h3>Total Blocks</h3>
                  <p className="stat-number">{blocks.length}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🚪</div>
                <div className="stat-content">
                  <h3>Total Flats</h3>
                  <p className="stat-number">{flats.length}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <h3>Available Flats</h3>
                  <p className="stat-number">{flats.filter(f => f.status === 'AVAILABLE').length}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👨‍💼</div>
                <div className="stat-content">
                  <h3>Staff Members</h3>
                  <p className="stat-number">{staff.length}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📢</div>
                <div className="stat-content">
                  <h3>Active Notices</h3>
                  <p className="stat-number">{notices.length}</p>
                </div>
              </div>
            </div>

            <div className="dashboard-grid">
              <div className="dashboard-card">
                <h3>Quick Actions</h3>
                <div className="quick-actions">
                  <button className="btn btn-primary" onClick={() => setActiveView("manageUsers")}>
                    Manage Users
                  </button>
                  <button className="btn btn-primary" onClick={() => setActiveView("manageApartments")}>
                    Manage Apartments
                  </button>
                  <button className="btn btn-primary" onClick={() => setActiveView("notices")}>
                    Publish Notice
                  </button>
                  <button className="btn btn-primary" onClick={() => setActiveView("staff")}>
                    Manage Staff
                  </button>
                  <button className="btn btn-primary" onClick={() => setActiveView("manageMaintenance")}>
                    Manage Maintenance
                  </button>
                  <button className="btn btn-primary" onClick={() => setActiveView("manageComplaints")}>
                    Manage Complaints
                  </button>
                  <button className="btn btn-primary" onClick={() => setActiveView("manageFacilities")}>
                    Manage Facilities
                  </button>
                  <button className="btn btn-primary" onClick={() => setActiveView("manageClubhouse")}>
                    Manage Clubhouse
                  </button>
                  <button className="btn btn-primary" onClick={() => setActiveView("managePolls")}>
                    Manage Polls
                  </button>
                </div>
              </div>
              <div className="dashboard-card">
                <h3>System Status</h3>
                <div className="info-list">
                  <div className="info-item">
                    <span className="info-label">Active Staff:</span>
                    <span className="info-value">{staff.length} Members</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Occupancy Rate:</span>
                    <span className="info-value">{flats.length > 0 ? Math.round(((flats.length - flats.filter(f => f.status === 'AVAILABLE').length) / flats.length) * 100) : 0}%</span>
                  </div>
                </div>

                {/* Occupancy Pie Chart */}
                {flats.length > 0 && (
                  <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                    <PieChart width={300} height={300}>
                      <Pie
                        data={[
                          { name: 'Occupied', value: flats.length - flats.filter(f => f.status === 'AVAILABLE').length },
                          { name: 'Available', value: flats.filter(f => f.status === 'AVAILABLE').length }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell key="cell-0" fill="#4ade80" /> {/* Occupied - Green */}
                        <Cell key="cell-1" fill="#f87171" /> {/* Available - Red */}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* NOTICES SECTION */}
        {activeView === "notices" && (
          <div className="fade-in-up">
            <div className="page-header">
              <div>
                <h1>Notices & Monthly Expenses</h1>
                <p className="page-subtitle">Manage apartment monthly expenses and notices</p>
              </div>
              <button className="btn btn-primary" onClick={() => setShowNoticeModal(!showNoticeModal)}>
                {showNoticeModal ? '✕ Close Form' : '+ Publish Notice'}
              </button>
            </div>

            {/* Notice Inline Form */}
            {showNoticeModal && (
              <div className="inline-form-card inline-form-notice fade-in-up">
                <div className="inline-form-accent inline-form-accent-notice"></div>
                <div className="inline-form-header">
                  <div className="inline-form-icon inline-form-icon-notice">
                    <span>📢</span>
                  </div>
                  <div>
                    <h3>Publish Notice</h3>
                    <p>Create a new monthly notice for residents</p>
                  </div>
                </div>
                <div className="inline-form-body">
                  <div className="inline-form-grid">
                    <div className={`inline-form-group ${noticeErrors.title ? 'has-error' : ''}`}>
                      <label>Notice Title <span className="required-star">*</span></label>
                      <input
                        type="text"
                        className={`inline-form-input ${noticeErrors.title ? 'error' : ''}`}
                        placeholder="e.g., Monthly Maintenance - January 2024"
                        value={noticeFormData.title}
                        onChange={(e) => {
                          setNoticeFormData({ ...noticeFormData, title: e.target.value });
                          if (noticeErrors.title) setNoticeErrors({ ...noticeErrors, title: '' });
                        }}
                      />
                      {noticeErrors.title && <span className="inline-form-error">{noticeErrors.title}</span>}
                    </div>
                    <div className={`inline-form-group ${noticeErrors.description ? 'has-error' : ''}`}>
                      <label>Description <span className="required-star">*</span></label>
                      <textarea
                        className={`inline-form-input ${noticeErrors.description ? 'error' : ''}`}
                        rows="3"
                        placeholder="Enter notice details, amounts, and any important information..."
                        value={noticeFormData.description}
                        onChange={(e) => {
                          setNoticeFormData({ ...noticeFormData, description: e.target.value });
                          if (noticeErrors.description) setNoticeErrors({ ...noticeErrors, description: '' });
                        }}
                      />
                      {noticeErrors.description && <span className="inline-form-error">{noticeErrors.description}</span>}
                    </div>
                  </div>
                  <div className="inline-form-row">
                    <div className={`inline-form-group ${noticeErrors.month ? 'has-error' : ''}`}>
                      <label>Month <span className="required-star">*</span></label>
                      <select
                        className={`inline-form-select ${noticeErrors.month ? 'error' : ''}`}
                        value={noticeFormData.month}
                        onChange={(e) => {
                          setNoticeFormData({ ...noticeFormData, month: e.target.value });
                          if (noticeErrors.month) setNoticeErrors({ ...noticeErrors, month: '' });
                        }}
                      >
                        <option value="">Select Month</option>
                        <option value="January">January</option>
                        <option value="February">February</option>
                        <option value="March">March</option>
                        <option value="April">April</option>
                        <option value="May">May</option>
                        <option value="June">June</option>
                        <option value="July">July</option>
                        <option value="August">August</option>
                        <option value="September">September</option>
                        <option value="October">October</option>
                        <option value="November">November</option>
                        <option value="December">December</option>
                      </select>
                      {noticeErrors.month && <span className="inline-form-error">{noticeErrors.month}</span>}
                    </div>
                    <div className="inline-form-group">
                      <label>Year</label>
                      <select
                        className="inline-form-select"
                        value={noticeFormData.year}
                        onChange={(e) => setNoticeFormData({ ...noticeFormData, year: parseInt(e.target.value) })}
                      >
                        <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                        <option value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1}</option>
                      </select>
                    </div>
                  </div>
                  <div className="inline-form-actions">
                    <button className="inline-btn inline-btn-cancel" onClick={closeNoticeModal} disabled={noticeLoading}>
                      Cancel
                    </button>
                    <button className={`inline-btn inline-btn-submit btn-gradient-orange ${noticeLoading ? 'btn-loading' : ''}`} onClick={handleNoticeSubmit} disabled={noticeLoading}>
                      {noticeLoading ? 'Publishing...' : '📢 Publish Notice'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notices List */}
            <div className="notices-list">
              {notices.length === 0 ? (
                <div className="empty-state">
                  <p>No notices published yet.</p>
                </div>
              ) : (
                notices.map((notice) => (
                  <div key={notice.id} className="notice-item">
                    <div className="notice-header">
                      <h4>{notice.title}</h4>
                      <div className="notice-actions">
                        <button className="btn btn-danger btn-sm" onClick={() => handleNoticeDelete(notice.id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                    <p>{notice.description}</p>
                    <div className="notice-meta">
                      <span>{notice.month} {notice.year}</span>
                      <span>•</span>
                      <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* STAFF MANAGEMENT SECTION */}
        {activeView === "staff" && (
          <div className="fade-in-up">
            <div className="page-header">
              <div>
                <h1>Staff Management</h1>
                <p className="page-subtitle">Manage security guards and staff members</p>
              </div>
              <button className="btn btn-gradient-blue" onClick={() => setShowStaffModal(!showStaffModal)}>
                {showStaffModal ? '✕ Close Form' : '+ Add Staff Member'}
              </button>
            </div>

            {/* Staff Inline Form */}
            {showStaffModal && (
              <div className="inline-form-card inline-form-staff fade-in-up">
                <div className="inline-form-accent inline-form-accent-staff"></div>
                <div className="inline-form-header">
                  <div className="inline-form-icon inline-form-icon-staff">
                    <span>👨‍💼</span>
                  </div>
                  <div>
                    <h3>Add Staff Member</h3>
                    <p>Register a new team member</p>
                  </div>
                </div>
                <div className="inline-form-body">
                  <div className="inline-form-row">
                    <div className={`inline-form-group ${staffErrors.username ? 'has-error' : ''}`}>
                      <label>Username <span className="required-star">*</span></label>
                      <input
                        type="text"
                        className={`inline-form-input ${staffErrors.username ? 'error' : ''}`}
                        placeholder="Enter username"
                        value={staffFormData.username}
                        onChange={(e) => {
                          setStaffFormData({ ...staffFormData, username: e.target.value });
                          if (staffErrors.username) setStaffErrors({ ...staffErrors, username: '' });
                        }}
                      />
                      {staffErrors.username && <span className="inline-form-error">{staffErrors.username}</span>}
                    </div>
                    <div className={`inline-form-group ${staffErrors.email ? 'has-error' : ''}`}>
                      <label>Email <span className="required-star">*</span></label>
                      <input
                        type="email"
                        className={`inline-form-input ${staffErrors.email ? 'error' : ''}`}
                        placeholder="name@example.com"
                        value={staffFormData.email}
                        onChange={(e) => {
                          setStaffFormData({ ...staffFormData, email: e.target.value });
                          if (staffErrors.email) setStaffErrors({ ...staffErrors, email: '' });
                        }}
                      />
                      {staffErrors.email && <span className="inline-form-error">{staffErrors.email}</span>}
                    </div>
                  </div>
                  <div className="inline-form-row">
                    <div className="inline-form-group">
                      <label>Phone</label>
                      <input
                        type="tel"
                        className="inline-form-input"
                        placeholder="+91 XXXXX XXXXX"
                        value={staffFormData.phone}
                        onChange={(e) => setStaffFormData({ ...staffFormData, phone: e.target.value })}
                      />
                    </div>
                    <div className="inline-form-group">
                      <label>Designation</label>
                      <select
                        className="inline-form-select"
                        value={staffFormData.designation}
                        onChange={(e) => setStaffFormData({ ...staffFormData, designation: e.target.value })}
                      >
                        <option value="HOUSE KEEPING">🛡️ House Keeper</option>
                        <option value="MAINTENANCE">🔧 Maintenance</option>
                        <option value="CLEANING">🧹 Cleaning</option>
                        <option value="MANAGER">💼 Manager</option>
                        <option value="ELECTRICIAN">🛡️ Electrician</option>
                      </select>
                    </div>
                  </div>
                  <div className="inline-form-row">
                    <div className={`inline-form-group ${staffErrors.password ? 'has-error' : ''}`}>
                      <label>Password <span className="required-star">*</span></label>
                      <div className="inline-password-wrapper">
                        <input
                          type={showPassword ? "text" : "password"}
                          className={`inline-form-input ${staffErrors.password ? 'error' : ''}`}
                          placeholder="Minimum 6 characters"
                          value={staffFormData.password}
                          onChange={(e) => {
                            setStaffFormData({ ...staffFormData, password: e.target.value });
                            if (staffErrors.password) setStaffErrors({ ...staffErrors, password: '' });
                          }}
                        />
                        <button
                          type="button"
                          className="inline-password-toggle"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? '🙈' : '👁️'}
                        </button>
                      </div>
                      {staffErrors.password && <span className="inline-form-error">{staffErrors.password}</span>}
                    </div>
                    <div className="inline-form-group" style={{ alignSelf: 'flex-end' }}>
                      {/* spacer for alignment */}
                    </div>
                  </div>

                  <div className="inline-form-actions">
                    <button className="inline-btn inline-btn-cancel" onClick={closeStaffModal} disabled={staffLoading}>
                      Cancel
                    </button>
                    <button className={`inline-btn inline-btn-submit btn-gradient-blue ${staffLoading ? 'btn-loading' : ''}`} onClick={handleStaffSubmit} disabled={staffLoading}>
                      {staffLoading ? 'Adding...' : '➕ Add Staff Member'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Staff List */}
            <div className="staff-grid">
              {staff.length === 0 ? (
                <div className="empty-state">
                  <p>No staff members added yet.</p>
                </div>
              ) : (
                staff.map((member) => (
                  <div key={member.id} className="staff-card">
                    <div className="staff-avatar">
                      {member.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="staff-info">
                      <h4>{member.username}</h4>
                      <p className="staff-email">{member.email}</p>
                      <p className="staff-designation">{member.designation || "No designation"}</p>
                      <p className="staff-phone">{member.contactNumber || "No phone"}</p>
                      <span className={`badge badge-${member.role?.toLowerCase()}`}>
                        {member.role}
                      </span>
                    </div>
                    <div className="staff-actions">
                      <button className="btn btn-danger btn-sm" onClick={() => handleStaffDelete(member.id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* COMPONENT ROUTING */}
        {activeView === "manageUsers" && <ManageUsers />}
        {activeView === "manageMaintenance" && (
          <ManageMaintenance
            flats={flats}
            apartments={apartments}
            blocks={blocks}
          />
        )}
        {activeView === "manageApartments" && (
          <ManageApartments
            apartments={apartments}
            blocks={blocks}
            flats={flats}
            loadApartments={loadApartments}
            loadBlocks={loadBlocks}
            loadFlats={loadFlats}
          />
        )}
        {activeView === "manageComplaints" && <ManageComplaints />}

        {activeView === "manageFacilities" && <ManageFacilities />}

        {activeView === "manageClubhouse" && <ManageClubhouse />}

        {activeView === "managePolls" && (
          <ManagePolls />
        )}
      </main>
    </div>
  );
}
