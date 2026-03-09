import React, { useState, useEffect } from "react";
import "../../components/Admin/AdminShared.css";
import axiosInstance from "../../utils/axiosConfig";

export default function Facilities() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchFacilities = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get("/user/facilities");
        setFacilities(res.data.data || []);
      } catch (err) {
        setErrorMessage("Failed to load facilities.");
      } finally {
        setLoading(false);
      }
    };
    fetchFacilities();
  }, []);

  const getStatusBadge = (status) => {
    const statusMap = {
      AVAILABLE: { class: "badge-active", label: "Available" },
      UNDER_MAINTENANCE: { class: "badge-in-progress", label: "Under Maintenance" },
      CLOSED: { class: "badge-inactive", label: "Closed" }
    };
    const statusInfo = statusMap[status] || { class: "badge-neutral", label: status };
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.label}</span>;
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

  const filteredFacilities = filter === "ALL"
    ? facilities
    : filter === "AVAILABLE"
      ? facilities.filter(f => f.status === "AVAILABLE")
      : facilities.filter(f => f.status !== "AVAILABLE");

  if (loading) {
    return <div className="admin-card">Loading facilities...</div>;
  }

  return (
    <div className="fade-in-up">
      <div className="page-header page-header-container">
        <div>
          <h1 className="page-title">Facilities</h1>
          <p className="page-subtitle">View apartment amenities and facilities</p>
        </div>
      </div>

      {errorMessage && (
        <div style={{ color: 'red', padding: '10px', marginBottom: '10px' }}>{errorMessage}</div>
      )}

      {/* Filter Tabs */}
      <div className="tab-container" style={{ marginBottom: '20px' }}>
        <button
          className={`btn ${filter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilter('ALL')}
          style={{ marginRight: '10px' }}
        >
          All ({facilities.length})
        </button>
        <button
          className={`btn ${filter === 'AVAILABLE' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilter('AVAILABLE')}
          style={{ marginRight: '10px' }}
        >
          Available ({facilities.filter(f => f.status === 'AVAILABLE').length})
        </button>
        <button
          className={`btn ${filter === 'UNAVAILABLE' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilter('UNAVAILABLE')}
        >
          Unavailable ({facilities.filter(f => f.status !== 'AVAILABLE').length})
        </button>
      </div>

      {/* Facilities Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {filteredFacilities.length === 0 ? (
          <div className="admin-card" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
            {filter === 'ALL' ? 'No facilities available at the moment.' : 'No facilities found for this filter.'}
          </div>
        ) : (
          filteredFacilities.map((facility, index) => (
            <div
              key={facility.id}
              className="admin-card"
              style={{
                padding: 0,
                overflow: 'hidden',
                opacity: facility.status !== 'AVAILABLE' ? 0.7 : 1
              }}
            >
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

                {facility.status !== 'AVAILABLE' && (
                  <div style={{ marginTop: '15px', padding: '12px', background: '#fef3c7', borderRadius: '8px', fontSize: '14px', color: '#92400e', textAlign: 'center' }}>
                    ⚠️ This facility is currently {facility.status === 'UNDER_MAINTENANCE' ? 'under maintenance' : 'closed'}.
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
