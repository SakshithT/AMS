import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosConfig";
import "../../components/Admin/AdminShared.css";

// ── SVG Icons ─────────────────────────────────────────────
const I = ({ d, size = 18, stroke = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    {typeof d === 'string' ? <path d={d} /> : d}
  </svg>
);
const UserIconS = () => <I d={<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>} />;
const GridIconS = () => <I d={<><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></>} />;
const PersonWalk = () => <I d={<><circle cx="12" cy="4" r="2" /><path d="m9 11 3-4 3 4" /><path d="m7 21 5-10 5 10" /></>} />;
const BoxIconS = () => <I d={<><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></>} />;
const CarIconS = () => <I d={<><rect x="1" y="3" width="15" height="13" rx="2" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></>} />;
const ShieldIconS = () => <I d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />;
const LogoutIconS = () => <I d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" size={16} />;
const MenuIconS = () => <I d={<><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>} />;

function SecurityDashboard() {
  const [activeView, setActiveView] = useState("profile");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [visitors, setVisitors] = useState([]);
  const [parcels, setParcels] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState({ username: "", email: "", contactNumber: "" });
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const [showParcelModal, setShowParcelModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [visitorData, setVisitorData] = useState({ name: "", phone: "", flatNumber: "", purpose: "VISIT" });
  const [parcelData, setParcelData] = useState({ recipientName: "", flatNumber: "", courier: "", trackingNumber: "" });
  const [vehicleData, setVehicleData] = useState({ ownerName: "", flatNumber: "", vehicleNumber: "", vehicleType: "CAR" });
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const navigate = useNavigate();

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
  };

  useEffect(() => {
    fetchProfile();
    fetchVisitors();
    fetchParcels();
    fetchVehicles();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axiosInstance.get("/security/profile");
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

  const fetchVisitors = async () => {
    try {
      const response = await axiosInstance.get("/security/visitors");
      const data = response.data.data;
      setVisitors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching visitors:", error);
    }
  };

  const fetchParcels = async () => {
    try {
      const response = await axiosInstance.get("/security/parcels");
      const data = response.data.data;
      setParcels(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching parcels:", error);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await axiosInstance.get("/security/vehicles");
      const data = response.data.data;
      setVehicles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      await axiosInstance.put("/security/profile", {
        username: profileFormData.username,
        email: profileFormData.email,
        contactNumber: profileFormData.contactNumber
      });
      setUser({ ...user, ...profileFormData });
      setIsEditingProfile(false);
      showToast("Profile updated successfully!");
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to update profile", "error");
    }
  };

  const handleVisitorCheckIn = async () => {
    if (!visitorData.name.trim()) {
      showToast("Please enter visitor name", "error");
      return;
    }
    try {
      await axiosInstance.post("/security/visitors", visitorData);
      showToast("Visitor checked in successfully!");
      setShowVisitorModal(false);
      setVisitorData({ name: "", phone: "", flatNumber: "", purpose: "VISIT" });
      fetchVisitors();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to check in visitor", "error");
    }
  };

  const handleVisitorCheckOut = async (visitorId) => {
    try {
      await axiosInstance.put(`/security/visitors/${visitorId}/checkout`);
      fetchVisitors();
    } catch (error) {
      showToast("Failed to check out visitor", "error");
    }
  };

  const handleParcelSubmit = async () => {
    if (!parcelData.recipientName.trim()) {
      showToast("Please enter recipient name", "error");
      return;
    }
    try {
      await axiosInstance.post("/security/parcels", parcelData);
      showToast("Parcel registered successfully!");
      setShowParcelModal(false);
      setParcelData({ recipientName: "", flatNumber: "", courier: "", trackingNumber: "" });
      fetchParcels();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to register parcel", "error");
    }
  };

  const handleParcelCollect = async (parcelId) => {
    try {
      await axiosInstance.put(`/security/parcels/${parcelId}/collect`);
      fetchParcels();
    } catch (error) {
      showToast("Failed to mark parcel as collected", "error");
    }
  };

  const handleVehicleEntry = async () => {
    if (!vehicleData.vehicleNumber.trim()) {
      showToast("Please enter vehicle number", "error");
      return;
    }
    try {
      await axiosInstance.post("/security/vehicles", vehicleData);
      showToast("Vehicle entry recorded successfully!");
      setShowVehicleModal(false);
      setVehicleData({ ownerName: "", flatNumber: "", vehicleNumber: "", vehicleType: "CAR" });
      fetchVehicles();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to record vehicle entry", "error");
    }
  };

  const handleVehicleExit = async (vehicleId) => {
    try {
      await axiosInstance.put(`/security/vehicles/${vehicleId}/exit`);
      fetchVehicles();
    } catch (error) {
      showToast("Failed to record vehicle exit", "error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const sidebarItems = [
    { id: "profile", label: "My Profile", icon: <UserIconS /> },
    { id: "overview", label: "Overview", icon: <GridIconS /> },
    { id: "visitors", label: "Visitors", icon: <PersonWalk /> },
    { id: "parcels", label: "Parcels", icon: <BoxIconS /> },
    { id: "vehicles", label: "Vehicles", icon: <CarIconS /> },
  ];

  const getStatusBadge = (status) => {
    const statusMap = {
      CHECKED_IN: { class: "badge-checked-in", label: "Checked In" },
      CHECKED_OUT: { class: "badge-checked-out", label: "Checked Out" },
      PENDING: { class: "badge-pending", label: "Pending" },
      COLLECTED: { class: "badge-collected", label: "Collected" },
      PARKED: { class: "badge-parked", label: "Parked" },
      EXITED: { class: "badge-exited", label: "Exited" }
    };
    const statusInfo = statusMap[status] || { class: "badge-neutral", label: status };
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  if (loading) {
    return (
      <div className="security-dashboard">
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
      <aside className={`security-sidebar ${isSidebarOpen ? '' : 'collapsed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand-icon"><ShieldIconS /></div>
          {isSidebarOpen && (
            <div className="sidebar-brand-text">
              <div className="brand-title">AMS Portal</div>
              <div className="brand-sub">Security Panel</div>
            </div>
          )}
          <button className="menu-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <MenuIconS />
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
                <div className="user-role">Security</div>
              </div>
            )}
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            <LogoutIconS /> {isSidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className={`main-wrapper ${isSidebarOpen ? '' : 'expanded'}`}>
        {/* PROFILE SECTION - Shown immediately on login */}
        {activeView === "profile" && (
          <div className="fade-in-up">
            <div className="page-header">
              <div>
                <h1>My Profile</h1>
                <p className="page-subtitle">Manage your personal information</p>
              </div>
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
                    <span className="badge badge-security">Security</span>
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
                    <label>Role</label>
                    <span>Security Staff</span>
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
              <div>
                <h1>Security Overview</h1>
                <p className="page-subtitle">Summary of security operations</p>
              </div>
            </div>

            <div className="security-stats-grid">
              <div className="security-stat-card">
                <div className="stat-icon">🚶</div>
                <div className="stat-content">
                  <h3>Visitors Today</h3>
                  <p className="stat-number">{visitors.length}</p>
                </div>
              </div>
              <div className="security-stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <h3>Currently In</h3>
                  <p className="stat-number">{visitors.filter(v => v.status === 'CHECKED_IN').length}</p>
                </div>
              </div>
              <div className="security-stat-card">
                <div className="stat-icon">📦</div>
                <div className="stat-content">
                  <h3>Pending Parcels</h3>
                  <p className="stat-number">{parcels.filter(p => p.status === 'PENDING').length}</p>
                </div>
              </div>
              <div className="security-stat-card">
                <div className="stat-icon">🚗</div>
                <div className="stat-content">
                  <h3>Vehicles Parked</h3>
                  <p className="stat-number">{vehicles.filter(v => v.status === 'PARKED').length}</p>
                </div>
              </div>
            </div>

            <div className="dashboard-grid">
              <div className="dashboard-card">
                <h3>Quick Actions</h3>
                <div className="quick-actions">
                  <button className="btn btn-primary" onClick={() => setShowVisitorModal(true)}>
                    Check In Visitor
                  </button>
                  <button className="btn btn-primary" onClick={() => setShowParcelModal(true)}>
                    Register Parcel
                  </button>
                  <button className="btn btn-primary" onClick={() => setShowVehicleModal(true)}>
                    Record Vehicle
                  </button>
                </div>
              </div>
              <div className="dashboard-card">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                  {visitors.slice(-3).reverse().map(v => (
                    <div key={v.id} className="activity-item">
                      <span className="activity-icon">🚶</span>
                      <span className="activity-text">{v.name} - {v.flatNumber}</span>
                    </div>
                  ))}
                  {parcels.slice(-2).reverse().map(p => (
                    <div key={p.id} className="activity-item">
                      <span className="activity-icon">📦</span>
                      <span className="activity-text">Parcel for {p.recipientName}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VISITORS SECTION */}
        {activeView === "visitors" && (
          <div className="fade-in-up">
            <div className="page-header">
              <div>
                <h1>Visitor Management</h1>
                <p className="page-subtitle">Manage visitor check-ins and check-outs</p>
              </div>
              <button className="btn btn-primary" onClick={() => setShowVisitorModal(true)}>
                + Check In Visitor
              </button>
            </div>

            {/* Visitor Stats */}
            <div className="visitor-stats">
              <div className="visitor-stat">
                <span className="stat-number">{visitors.filter(v => v.status === 'CHECKED_IN').length}</span>
                <span className="stat-label">Currently In</span>
              </div>
              <div className="visitor-stat">
                <span className="stat-number">{visitors.length}</span>
                <span className="stat-label">Total Today</span>
              </div>
            </div>

            {/* Check In Modal */}
            {showVisitorModal && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <h3>Check In Visitor</h3>
                  <div className="form-group">
                    <label>Visitor Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter visitor name"
                      value={visitorData.name}
                      onChange={(e) => setVisitorData({ ...visitorData, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="Enter phone number"
                      value={visitorData.phone}
                      onChange={(e) => setVisitorData({ ...visitorData, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Flat Number to Visit</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter flat number"
                      value={visitorData.flatNumber}
                      onChange={(e) => setVisitorData({ ...visitorData, flatNumber: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Purpose</label>
                    <select
                      className="form-select"
                      value={visitorData.purpose}
                      onChange={(e) => setVisitorData({ ...visitorData, purpose: e.target.value })}
                    >
                      <option value="VISIT">Family Visit</option>
                      <option value="DELIVERY">Delivery</option>
                      <option value="MAINTENANCE">Maintenance</option>
                      <option value="OFFICIAL">Official</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={() => setShowVisitorModal(false)}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleVisitorCheckIn}>Check In</button>
                  </div>
                </div>
              </div>
            )}

            {/* Visitors Table */}
            <div className="visitors-table-container">
              <table className="visitor-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Flat Number</th>
                    <th>Purpose</th>
                    <th>Entry Time</th>
                    <th>Exit Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visitors.length > 0 ? (
                    visitors.map((visitor) => (
                      <tr key={visitor.id}>
                        <td>{visitor.name}</td>
                        <td>{visitor.phone}</td>
                        <td>{visitor.flatNumber}</td>
                        <td>{visitor.purpose}</td>
                        <td>{visitor.entryTime ? new Date(visitor.entryTime).toLocaleTimeString() : '-'}</td>
                        <td>{visitor.exitTime ? new Date(visitor.exitTime).toLocaleTimeString() : '-'}</td>
                        <td>{getStatusBadge(visitor.status)}</td>
                        <td>
                          {visitor.status === 'CHECKED_IN' && (
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleVisitorCheckOut(visitor.id)}
                            >
                              Check Out
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center">No visitors recorded today</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PARCELS SECTION */}
        {activeView === "parcels" && (
          <div className="fade-in-up">
            <div className="page-header">
              <div>
                <h1>Parcel Management</h1>
                <p className="page-subtitle">Manage package deliveries</p>
              </div>
              <button className="btn btn-primary" onClick={() => setShowParcelModal(true)}>
                + Register Parcel
              </button>
            </div>

            {/* Parcel Stats */}
            <div className="visitor-stats">
              <div className="visitor-stat">
                <span className="stat-number">{parcels.filter(p => p.status === 'PENDING').length}</span>
                <span className="stat-label">Pending</span>
              </div>
              <div className="visitor-stat">
                <span className="stat-number">{parcels.filter(p => p.status === 'COLLECTED').length}</span>
                <span className="stat-label">Collected</span>
              </div>
              <div className="visitor-stat">
                <span className="stat-number">{parcels.length}</span>
                <span className="stat-label">Total</span>
              </div>
            </div>

            {/* Register Parcel Modal */}
            {showParcelModal && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <h3>Register Parcel</h3>
                  <div className="form-group">
                    <label>Recipient Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter recipient name"
                      value={parcelData.recipientName}
                      onChange={(e) => setParcelData({ ...parcelData, recipientName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Flat Number</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter flat number"
                      value={parcelData.flatNumber}
                      onChange={(e) => setParcelData({ ...parcelData, flatNumber: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Courier Service</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., FedEx, DHL, Amazon"
                      value={parcelData.courier}
                      onChange={(e) => setParcelData({ ...parcelData, courier: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Tracking Number (Optional)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter tracking number"
                      value={parcelData.trackingNumber}
                      onChange={(e) => setParcelData({ ...parcelData, trackingNumber: e.target.value })}
                    />
                  </div>
                  <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={() => setShowParcelModal(false)}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleParcelSubmit}>Register</button>
                  </div>
                </div>
              </div>
            )}

            {/* Parcels Table */}
            <div className="visitors-table-container">
              <table className="visitor-table">
                <thead>
                  <tr>
                    <th>Recipient</th>
                    <th>Flat Number</th>
                    <th>Courier</th>
                    <th>Tracking #</th>
                    <th>Received Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {parcels.length > 0 ? (
                    parcels.map((parcel) => (
                      <tr key={parcel.id}>
                        <td>{parcel.recipientName}</td>
                        <td>{parcel.flatNumber}</td>
                        <td>{parcel.courier}</td>
                        <td>{parcel.trackingNumber || '-'}</td>
                        <td>{parcel.receivedTime ? new Date(parcel.receivedTime).toLocaleString() : '-'}</td>
                        <td>{getStatusBadge(parcel.status)}</td>
                        <td>
                          {parcel.status === 'PENDING' && (
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleParcelCollect(parcel.id)}
                            >
                              Mark Collected
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center">No parcels registered</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VEHICLES SECTION */}
        {activeView === "vehicles" && (
          <div className="fade-in-up">
            <div className="page-header">
              <div>
                <h1>Vehicle Records</h1>
                <p className="page-subtitle">Track vehicle entry and exit</p>
              </div>
              <button className="btn btn-primary" onClick={() => setShowVehicleModal(true)}>
                + Record Entry
              </button>
            </div>

            {/* Vehicle Stats */}
            <div className="visitor-stats">
              <div className="visitor-stat">
                <span className="stat-number">{vehicles.filter(v => v.status === 'PARKED').length}</span>
                <span className="stat-label">Currently Parked</span>
              </div>
              <div className="visitor-stat">
                <span className="stat-number">{vehicles.filter(v => v.status === 'EXITED').length}</span>
                <span className="stat-label">Exited Today</span>
              </div>
              <div className="visitor-stat">
                <span className="stat-number">{vehicles.length}</span>
                <span className="stat-label">Total Records</span>
              </div>
            </div>

            {/* Vehicle Entry Modal */}
            {showVehicleModal && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <h3>Record Vehicle Entry</h3>
                  <div className="form-group">
                    <label>Owner/Driver Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter owner name"
                      value={vehicleData.ownerName}
                      onChange={(e) => setVehicleData({ ...vehicleData, ownerName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Flat Number</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter flat number"
                      value={vehicleData.flatNumber}
                      onChange={(e) => setVehicleData({ ...vehicleData, flatNumber: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Vehicle Number</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., ABC-1234"
                      value={vehicleData.vehicleNumber}
                      onChange={(e) => setVehicleData({ ...vehicleData, vehicleNumber: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Vehicle Type</label>
                    <select
                      className="form-select"
                      value={vehicleData.vehicleType}
                      onChange={(e) => setVehicleData({ ...vehicleData, vehicleType: e.target.value })}
                    >
                      <option value="CAR">Car</option>
                      <option value="BIKE">Bike</option>
                      <option value="SCOOTER">Scooter</option>
                      <option value="TRUCK">Truck</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={() => setShowVehicleModal(false)}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleVehicleEntry}>Record Entry</button>
                  </div>
                </div>
              </div>
            )}

            {/* Vehicles Table */}
            <div className="visitors-table-container">
              <table className="visitor-table">
                <thead>
                  <tr>
                    <th>Vehicle #</th>
                    <th>Type</th>
                    <th>Owner</th>
                    <th>Flat Number</th>
                    <th>Entry Time</th>
                    <th>Exit Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.length > 0 ? (
                    vehicles.map((vehicle) => (
                      <tr key={vehicle.id}>
                        <td>{vehicle.vehicleNumber}</td>
                        <td>{vehicle.vehicleType}</td>
                        <td>{vehicle.ownerName}</td>
                        <td>{vehicle.flatNumber}</td>
                        <td>{vehicle.entryTime ? new Date(vehicle.entryTime).toLocaleTimeString() : '-'}</td>
                        <td>{vehicle.exitTime ? new Date(vehicle.exitTime).toLocaleTimeString() : '-'}</td>
                        <td>{getStatusBadge(vehicle.status)}</td>
                        <td>
                          {vehicle.status === 'PARKED' && (
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleVehicleExit(vehicle.id)}
                            >
                              Record Exit
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center">No vehicle records</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default SecurityDashboard;
