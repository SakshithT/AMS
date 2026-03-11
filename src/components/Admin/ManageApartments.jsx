import React, { useState } from "react";
import axiosInstance from "../../utils/axiosConfig";
import "./AdminShared.css";

export default function ManageApartments({ apartments, blocks, flats, loadApartments, loadBlocks, loadFlats }) {
  const [activeTab, setActiveTab] = useState("apartments");
  const [editingId, setEditingId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [flatFilterStatus, setFlatFilterStatus] = useState("ALL");
  const [aptData, setAptData] = useState({ name: "", address: "" });
  const [blockData, setBlockData] = useState({ apartmentId: "", blockName: "" });
  const [flatData, setFlatData] = useState({ blockId: "", flatNumber: "", type: "", floorNumber: "", status: "AVAILABLE" });

  const resetForms = () => {
    setEditingId(null);
    setShowCreateForm(false);
    setAptData({ name: "", address: "" });
    setBlockData({ apartmentId: "", blockName: "" });
    setFlatData({ blockId: "", flatNumber: "", type: "", floorNumber: "", status: "AVAILABLE" });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    resetForms();
    setFlatFilterStatus("ALL");
  };

  const handleEditStart = (type, item) => {
    setShowCreateForm(true);
    if (type === "apartment") {
      setAptData({ name: item.name, address: item.address });
    } else if (type === "block") {
      setBlockData({
        apartmentId: item.apartmentId || (item.apartment ? item.apartment.id : ""),
        blockName: item.blockName
      });
    } else if (type === "flat") {
      setFlatData({
        blockId: item.blockId || (item.block ? item.block.id : ""),
        flatNumber: item.flatNumber,
        type: item.type,
        floorNumber: item.floorNumber,
        status: item.status
      });
    }
    setEditingId(item.id);
  };

  // --- APARTMENTS ---
  const handleSubmitApartment = async () => {
    try {
      if (editingId) {
        await axiosInstance.put(`/apartments/${editingId}`, aptData);
        alert("Apartment updated successfully");
      } else {
        await axiosInstance.post("/apartments", aptData);
        alert("Apartment added successfully");
      }
      loadApartments();
      resetForms();
    } catch (error) {
      alert(error.response?.data?.message || "Operation failed.");
    }
  };

  const handleDeleteApartment = async (id) => {
    if (!window.confirm("Delete this apartment? This will delete all associated blocks and flats.")) return;
    try {
      await axiosInstance.delete(`/apartments/${id}`);
      loadApartments(); loadBlocks(); loadFlats();
    } catch { alert("Failed to delete apartment"); }
  };

  // --- BLOCKS ---
  const handleSubmitBlock = async () => {
    try {
      if (editingId) {
        await axiosInstance.put(`/blocks/${editingId}`, blockData);
        alert("Block updated successfully");
      } else {
        await axiosInstance.post("/blocks/create", blockData);
        alert("Block added successfully");
      }
      loadBlocks();
      resetForms();
    } catch (error) {
      alert(error.response?.data?.message || "Operation failed.");
    }
  };

  const handleDeleteBlock = async (id) => {
    if (!window.confirm("Delete this block?")) return;
    try {
      await axiosInstance.delete(`/blocks/${id}`);
      loadBlocks(); loadFlats();
    } catch { alert("Failed to delete block"); }
  };

  // --- FLATS ---
  const handleSubmitFlat = async () => {
    try {
      const payload = { ...flatData, blockId: Number(flatData.blockId), floorNumber: Number(flatData.floorNumber) };
      if (editingId) {
        await axiosInstance.put(`/flats/${editingId}`, payload);
        alert("Flat updated successfully");
      } else {
        await axiosInstance.post("/flats/create", payload);
        alert("Flat added successfully");
      }
      loadFlats();
      resetForms();
    } catch { alert("Failed to save flat"); }
  };

  const handleDeleteFlat = async (id) => {
    if (!window.confirm("Delete this flat?")) return;
    try {
      await axiosInstance.delete(`/flats/${id}`);
      loadFlats();
    } catch { alert("Failed to delete flat"); }
  };

  const createLabel = { apartments: "Create Apartment", blocks: "Create Block", flats: "Create Flat" };

  return (
    <div className="admin-card fade-in-up">

      {/* Tab buttons */}
      <div className="action-group tab-container mb-24">
        <button className={`btn ${activeTab === "apartments" ? "btn-primary" : "btn-secondary"}`} onClick={() => handleTabChange("apartments")}>Apartments</button>
        <button className={`btn ${activeTab === "blocks" ? "btn-primary" : "btn-secondary"}`} onClick={() => handleTabChange("blocks")}>Blocks</button>
        <button className={`btn ${activeTab === "flats" ? "btn-primary" : "btn-secondary"}`} onClick={() => handleTabChange("flats")}>Flats</button>

        {/* Create toggle button — right side */}
        <div style={{ marginLeft: "auto" }}>
          <button
            className={`btn ${showCreateForm ? "btn-secondary" : "btn-primary"}`}
            onClick={() => { if (showCreateForm) resetForms(); else setShowCreateForm(true); }}
          >
            {showCreateForm ? "✕ Close Form" : `+ ${createLabel[activeTab]}`}
          </button>
        </div>
      </div>

      {/* ── APARTMENTS TAB ── */}
      {activeTab === "apartments" && (
        <div>
          {showCreateForm && (
            <div className="inline-form-card fade-in-up mb-24">
              <div className="inline-form-accent accent-blue"></div>
              <div className="inline-form-header">
                <div className="inline-form-icon icon-blue"><span>🏢</span></div>
                <div>
                  <h3>{editingId ? "Edit Apartment" : "Add New Apartment"}</h3>
                  <p>Enter apartment details below</p>
                </div>
              </div>
              <div className="inline-form-body">
                <div className="inline-form-row">
                  <div className="inline-form-group">
                    <label>Apartment Name</label>
                    <input className="inline-form-input" placeholder="e.g. Sunrise Towers" value={aptData.name} onChange={(e) => setAptData({ ...aptData, name: e.target.value })} />
                  </div>
                  <div className="inline-form-group">
                    <label>Address</label>
                    <input className="inline-form-input" placeholder="e.g. 123 Main St" value={aptData.address} onChange={(e) => setAptData({ ...aptData, address: e.target.value })} />
                  </div>
                </div>
                <div className="inline-form-actions">
                  <button className="inline-btn inline-btn-cancel" onClick={resetForms}>Cancel</button>
                  <button className="inline-btn inline-btn-submit btn-gradient-blue" onClick={handleSubmitApartment}>{editingId ? "Update" : "Add Apartment"}</button>
                </div>
              </div>
            </div>
          )}
          <hr className="divider mb-24" />
          <ul className="data-list">
            {apartments.map((a) => (
              <li key={a.id} className="data-list-item">
                <div><strong>{a.name}</strong> - <span className="item-meta">{a.address}</span></div>
                <div className="action-buttons">
                  <button className="btn btn-warning btn-sm" onClick={() => handleEditStart("apartment", a)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDeleteApartment(a.id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── BLOCKS TAB ── */}
      {activeTab === "blocks" && (
        <div>
          {showCreateForm && (
            <div className="inline-form-card fade-in-up mb-24">
              <div className="inline-form-accent accent-orange"></div>
              <div className="inline-form-header">
                <div className="inline-form-icon icon-orange"><span>🏗️</span></div>
                <div>
                  <h3>{editingId ? "Edit Block" : "Add New Block"}</h3>
                  <p>Create a block under an apartment</p>
                </div>
              </div>
              <div className="inline-form-body">
                <div className="inline-form-row">
                  <div className="inline-form-group">
                    <label>Select Apartment</label>
                    <select className="inline-form-select" value={blockData.apartmentId} onChange={(e) => setBlockData({ ...blockData, apartmentId: e.target.value })}>
                      <option value="">-- Select Apartment --</option>
                      {apartments.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  <div className="inline-form-group">
                    <label>Block Name</label>
                    <input className="inline-form-input" placeholder="e.g. Block A" value={blockData.blockName} onChange={(e) => setBlockData({ ...blockData, blockName: e.target.value })} />
                  </div>
                </div>
                <div className="inline-form-actions">
                  <button className="inline-btn inline-btn-cancel" onClick={resetForms}>Cancel</button>
                  <button className="inline-btn inline-btn-submit btn-gradient-blue" onClick={handleSubmitBlock}>{editingId ? "Update" : "Add Block"}</button>
                </div>
              </div>
            </div>
          )}
          <hr className="divider mb-24" />
          <ul className="data-list">
            {blocks.map((b) => {
              const aptId = b.apartmentId || b.apartment?.id;
              const apartmentName = apartments.find(a => a.id === aptId)?.name || b.apartment?.name || "Unknown Apartment";
              return (
                <li key={b.id} className="data-list-item">
                  <div>
                    <strong>{b.blockName}</strong>
                    <span className="item-meta" style={{ marginLeft: "10px" }}>(Apartment: {apartmentName})</span>
                  </div>
                  <div className="action-buttons">
                    <button className="btn btn-warning btn-sm" onClick={() => handleEditStart("block", b)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteBlock(b.id)}>Delete</button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* ── FLATS TAB ── */}
      {activeTab === "flats" && (() => {
        const filteredFlats = flats.filter(f => flatFilterStatus === "ALL" || f.status === flatFilterStatus);
        return (
          <div>
            {showCreateForm && (
              <div className="inline-form-card fade-in-up mb-24">
                <div className="inline-form-accent accent-green"></div>
                <div className="inline-form-header">
                  <div className="inline-form-icon icon-green"><span>🚪</span></div>
                  <div>
                    <h3>{editingId ? "Edit Flat Status" : "Add New Flat"}</h3>
                    <p>Register a new flat unit</p>
                  </div>
                </div>
                <div className="inline-form-body">
                  <div className="inline-form-row">
                    <div className="inline-form-group">
                      <label>Block</label>
                      <select className="inline-form-select" value={flatData.blockId} onChange={(e) => setFlatData({ ...flatData, blockId: e.target.value })} disabled={!!editingId}>
                        <option value="">-- Select Block --</option>
                        {blocks.map((b) => <option key={b.id} value={b.id}>{b.blockName}</option>)}
                      </select>
                    </div>
                    <div className="inline-form-group">
                      <label>Flat Number</label>
                      <input className="inline-form-input" placeholder="e.g. 101" value={flatData.flatNumber} onChange={(e) => setFlatData({ ...flatData, flatNumber: e.target.value })} disabled={!!editingId} />
                    </div>
                  </div>
                  <div className="inline-form-row">
                    <div className="inline-form-group">
                      <label>Type</label>
                      <select className="inline-form-select" value={flatData.type} onChange={(e) => setFlatData({ ...flatData, type: e.target.value })} disabled={!!editingId}>
                        <option value="">-- Select Type --</option>
                        <option value="1BHK">1BHK</option>
                        <option value="2BHK">2BHK</option>
                        <option value="3BHK">3BHK</option>
                        <option value="4BHK">4BHK</option>
                      </select>
                    </div>
                    <div className="inline-form-group">
                      <label>Floor Number</label>
                      <input type="number" className="inline-form-input" placeholder="e.g. 1" value={flatData.floorNumber} onChange={(e) => setFlatData({ ...flatData, floorNumber: e.target.value })} disabled={!!editingId} />
                    </div>
                  </div>
                  <div className="inline-form-row">
                    <div className="inline-form-group">
                      <label>Status</label>
                      <select className="inline-form-select" value={flatData.status} onChange={(e) => setFlatData({ ...flatData, status: e.target.value })}>
                        <option value="AVAILABLE">Available</option>
                        <option value="ALLOCATED">Allocated</option>
                        <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                      </select>
                    </div>
                    <div className="inline-form-group"></div>
                  </div>
                  <div className="inline-form-actions">
                    <button className="inline-btn inline-btn-cancel" onClick={resetForms}>Cancel</button>
                    <button className="inline-btn inline-btn-submit btn-gradient-blue" onClick={handleSubmitFlat}>{editingId ? "Update Status" : "Add Flat"}</button>
                  </div>
                </div>
              </div>
            )}
            <hr className="divider mb-24" />
            <div className="section-header" style={{ marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 className="section-title">Flats List ({filteredFlats.length})</h3>
              <div className="filter-group">
                <label>Filter by Status:</label>
                <select className="form-select" value={flatFilterStatus} onChange={(e) => setFlatFilterStatus(e.target.value)} style={{ width: "auto" }}>
                  <option value="ALL">All</option>
                  <option value="AVAILABLE">Available</option>
                  <option value="ALLOCATED">Allocated</option>
                  <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                </select>
              </div>
            </div>
            <ul className="data-list">
              {filteredFlats.length > 0 ? filteredFlats.map((f) => {
                const blockId = f.blockId || f.block?.id;
                const blockObj = blocks.find(b => b.id === blockId);
                const blockName = blockObj?.blockName || f.block?.blockName || "Unknown Block";
                const aptId = blockObj?.apartmentId || blockObj?.apartment?.id;
                const aptName = apartments.find(a => a.id === aptId)?.name || blockObj?.apartment?.name || f.block?.apartment?.name || "Unknown Apartment";
                return (
                  <li key={f.id} className="data-list-item">
                    <div>
                      <strong>Flat {f.flatNumber}</strong>
                      <span className="item-meta"> (Floor: {f.floorNumber}, Type: {f.type})</span><br />
                      <span className="item-meta" style={{ display: "inline-block", marginTop: "5px", color: "#666" }}>
                        Apartment: {aptName} | Block: {blockName}
                      </span>
                      <span className={`badge ${f.status === "AVAILABLE" ? "badge-active" : "badge-neutral"} ml-10`}>{f.status}</span>
                    </div>
                    <div className="action-buttons">
                      <button className="btn btn-warning btn-sm" onClick={() => handleEditStart("flat", f)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteFlat(f.id)}>Delete</button>
                    </div>
                  </li>
                );
              }) : (
                <li className="data-list-item" style={{ justifyContent: "center", color: "var(--txt-3)" }}>
                  No flats found with the selected status.
                </li>
              )}
            </ul>
          </div>
        );
      })()}
    </div>
  );
}
