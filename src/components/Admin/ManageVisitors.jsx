import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosConfig";
import "./AdminShared.css";

export default function ManageVisitors() {
    const [visitors, setVisitors] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [activeTab, setActiveTab] = useState("visitors"); // "visitors" or "vehicles"
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [visRes, vehRes] = await Promise.all([
                axiosInstance.get("/admin/visitors"),
                axiosInstance.get("/admin/vehicles")
            ]);
            setVisitors(visRes.data.data || []);
            setVehicles(vehRes.data.data || []);
        } catch (error) {
            console.error("Error loading visitor/vehicle data:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredVisitors = visitors.filter(v =>
        v.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.flatNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.purpose?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredVehicles = vehicles.filter(v =>
        v.vehicleNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.ownerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.flatNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="fade-in-up">
            <div className="page-header page-header-container">
                <div>
                    <h1 className="page-title">Monitor Visitors & Vehicles</h1>
                    <p className="page-subtitle">View visitor history and vehicle tracking</p>
                </div>
            </div>

            <div className="admin-card mt-0">
                <div className="action-group tab-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            className={`btn ${activeTab === "visitors" ? "btn-primary" : "btn-secondary"}`}
                            onClick={() => setActiveTab("visitors")}
                        >
                            Visitors ({visitors.length})
                        </button>
                        <button
                            className={`btn ${activeTab === "vehicles" ? "btn-primary" : "btn-secondary"}`}
                            onClick={() => setActiveTab("vehicles")}
                        >
                            Vehicles ({vehicles.length})
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flex: '1', minWidth: '300px', justifyContent: 'flex-end' }}>
                        <input
                            type="text"
                            placeholder="Search by name, flat, or details..."
                            className="inline-form-input"
                            style={{ maxWidth: '300px' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="loading-container" style={{ padding: '30px' }}>
                        <div className="loading-spinner"></div>
                        <p>Loading data...</p>
                    </div>
                ) : (
                    <div style={{ marginTop: '20px' }}>
                        {activeTab === "visitors" ? (
                            <div className="admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Phone</th>
                                            <th>Flat</th>
                                            <th>Purpose</th>
                                            <th>Entry Time</th>
                                            <th>Exit Time</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredVisitors.length > 0 ? (
                                            filteredVisitors.map(v => (
                                                <tr key={v.id}>
                                                    <td><strong>{v.name}</strong></td>
                                                    <td>{v.phone || "N/A"}</td>
                                                    <td>{v.flatNumber || "N/A"}</td>
                                                    <td>{v.purpose || "N/A"}</td>
                                                    <td>{formatDate(v.entryTime)}</td>
                                                    <td>{formatDate(v.exitTime)}</td>
                                                    <td>
                                                        <span className={`badge ${v.status === 'CHECKED_IN' ? 'badge-active' : 'badge-inactive'}`}>
                                                            {v.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="text-center">No visitors found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Vehicle No.</th>
                                            <th>Type</th>
                                            <th>Owner Name</th>
                                            <th>Flat</th>
                                            <th>Entry Time</th>
                                            <th>Exit Time</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredVehicles.length > 0 ? (
                                            filteredVehicles.map(v => (
                                                <tr key={v.id}>
                                                    <td><strong>{v.vehicleNumber}</strong></td>
                                                    <td>{v.vehicleType}</td>
                                                    <td>{v.ownerName || "N/A"}</td>
                                                    <td>{v.flatNumber || "N/A"}</td>
                                                    <td>{formatDate(v.entryTime)}</td>
                                                    <td>{formatDate(v.exitTime)}</td>
                                                    <td>
                                                        <span className={`badge ${v.status === 'PARKED' ? 'badge-active' : 'badge-inactive'}`}>
                                                            {v.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="text-center">No vehicles found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
