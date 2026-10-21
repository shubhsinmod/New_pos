import React, { useState } from 'react';
import { Activity, Plus, Search, Store, Edit2, Check, X, ToggleLeft, ToggleRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import * as api from '../../services/api';

export default function OutletsScreen({
  outlets,
  filteredOutlets,
  query,
  setQuery,
  setShowModal,
  selectedOutlet,
  setSelectedOutlet,
  setOutlets,
  setNotice
}) {
  const [editingOutlet, setEditingOutlet] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    code: '',
    phone: '',
    email: '',
    address: '',
    gstin: '',
    active: true
  });
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  // Open Edit Modal
  const handleOpenEdit = (outlet) => {
    setEditingOutlet(outlet);
    setEditForm({
      name: outlet.name || '',
      code: outlet.code || '',
      phone: outlet.phone || '',
      email: outlet.email || '',
      address: outlet.address || '',
      gstin: outlet.gstin || '',
      active: outlet.active !== false
    });
  };

  // Save Edited Outlet
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingOutlet) return;
    setSaving(true);
    try {
      const payload = {
        name: editForm.name.trim(),
        code: editForm.code.trim().toUpperCase(),
        phone: editForm.phone?.trim() || null,
        email: editForm.email?.trim() || null,
        address: editForm.address?.trim() || null,
        gstin: editForm.gstin?.trim() || null,
        active: editForm.active
      };
      const updated = await api.updateOutlet(editingOutlet.id, payload);

      if (setOutlets) {
        setOutlets(prev => prev.map(o => o.id === updated.id ? updated : o));
      }

      // If updated outlet is currently selected, update selectedOutlet state too
      if (selectedOutlet?.id === updated.id && setSelectedOutlet) {
        setSelectedOutlet(updated);
      }

      setEditingOutlet(null);
      if (setNotice) setNotice(`Outlet "${updated.name}" saved successfully!`);
    } catch (err) {
      if (setNotice) setNotice('Error updating outlet: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // 1-Click Toggle Active / Inactive
  const handleToggleActive = async (outlet) => {
    setTogglingId(outlet.id);
    try {
      const updated = await api.toggleOutletActive(outlet.id);
      if (setOutlets) {
        setOutlets(prev => prev.map(o => o.id === updated.id ? updated : o));
      }
      if (selectedOutlet?.id === updated.id && setSelectedOutlet) {
        setSelectedOutlet(updated);
      }
      const statusText = updated.active ? 'Active (Open)' : 'Inactive (Closed)';
      if (setNotice) setNotice(`Outlet "${updated.name}" is now ${statusText}!`);
    } catch (err) {
      if (setNotice) setNotice('Failed to update status: ' + err.message);
    } finally {
      setTogglingId(null);
    }
  };

  const activeCount = outlets.filter(o => o.active !== false).length;
  const inactiveCount = outlets.length - activeCount;

  return (
    <div>
      <div className="page-heading">
        <div>
          <div className="eyebrow">ENTERPRISE OUTLET MANAGEMENT</div>
          <h1>Restaurant Outlets ({outlets.length})</h1>
          <p>Super Admin can activate <strong>multiple/all outlets simultaneously</strong>. All active branches can take orders and operate concurrently.</p>
        </div>
        <button className="primary-btn" onClick={() => setShowModal(true)}>
          <Plus size={17} /> Add outlet
        </button>
      </div>

      {/* Metrics Bar */}
      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        <div className="stat-card" style={{ minHeight: 'auto', padding: '14px 18px' }}>
          <div className="stat-label">TOTAL OUTLETS</div>
          <div className="stat-value" style={{ fontSize: '22px' }}>{outlets.length} Branches</div>
          <div className="stat-sub">Configured branches</div>
        </div>
        <div className="stat-card" style={{ minHeight: 'auto', padding: '14px 18px' }}>
          <div className="stat-label">OPERATING STATUS</div>
          <div className="stat-value" style={{ fontSize: '22px', color: '#16a34a' }}>
            {activeCount} Active
          </div>
          <div className="stat-sub">{inactiveCount > 0 ? `${inactiveCount} Inactive` : 'All branches operational'}</div>
        </div>
        <div className="stat-card" style={{ minHeight: 'auto', padding: '14px 18px' }}>
          <div className="stat-label">SUPER ADMIN MULTI-OUTLET</div>
          <div className="stat-value" style={{ fontSize: '22px', color: '#d97706' }}>Unlimited</div>
          <div className="stat-sub">All branches can be active at once</div>
        </div>
        <div className="stat-card" style={{ minHeight: 'auto', padding: '14px 18px' }}>
          <div className="stat-label">CURRENT TERMINAL VIEW</div>
          <div className="stat-value" style={{ fontSize: '18px', color: '#176b52', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {selectedOutlet?.name || 'None'}
          </div>
          <div className="stat-sub">{selectedOutlet?.code || 'BLR'} · Active Session</div>
        </div>
      </div>

      <div className="outlet-toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            placeholder="Search outlet name, code, GSTIN or location..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <span className="results-count">{filteredOutlets.length} branches found</span>
      </div>

      <div className="outlet-cards">
        {filteredOutlets.map((o, i) => {
          const isSelected = selectedOutlet?.id === o.id;
          const isActive = o.active !== false;

          return (
            <div
              className="location-card"
              key={o.id}
              style={{
                borderColor: isSelected ? '#176b52' : '#e7ebf1',
                boxShadow: isSelected ? '0 4px 18px rgba(23,107,82,0.14)' : 'none',
                position: 'relative'
              }}
            >
              <div className="location-card-top">
                <div className={`outlet-icon outlet-${i % 3}`}><Store size={22} /></div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {/* Modern Interactive Active/Inactive Switch */}
                  <div
                    onClick={() => handleToggleActive(o)}
                    title={isActive ? 'Click to Deactivate branch (Close)' : 'Click to Activate branch (Open)'}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: togglingId === o.id ? 'wait' : 'pointer',
                      background: isActive ? '#ecfdf5' : '#f8fafc',
                      border: `1.5px solid ${isActive ? '#86efac' : '#cbd5e1'}`,
                      padding: '4px 9px 4px 6px',
                      borderRadius: '20px',
                      userSelect: 'none',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                  >
                    {/* Toggle Slider Track & Knob */}
                    <div
                      style={{
                        width: '28px',
                        height: '16px',
                        borderRadius: '10px',
                        background: isActive ? '#16a34a' : '#94a3b8',
                        position: 'relative',
                        transition: 'background 0.2s ease',
                        flexShrink: 0
                      }}
                    >
                      <div
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: '#ffffff',
                          position: 'absolute',
                          top: '2px',
                          left: isActive ? '14px' : '2px',
                          transition: 'left 0.2s ease',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: isActive ? '#15803d' : '#64748b' }}>
                      {isActive ? 'Active (Open)' : 'Inactive (Closed)'}
                    </span>
                  </div>

                  {/* Edit Outlet Button */}
                  <button
                    onClick={() => handleOpenEdit(o)}
                    className="outline-btn"
                    title="Edit outlet details"
                    style={{ padding: '5px 10px', display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600 }}
                  >
                    <Edit2 size={13} /> Edit
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px' }}>
                <h3 style={{ margin: '0 0 4px 0' }}>{o.name}</h3>
                {isSelected && (
                  <span style={{ fontSize: '9px', fontWeight: 800, color: '#176b52', background: '#eaf5ef', padding: '2px 7px', borderRadius: '4px' }}>
                    CURRENT VIEW
                  </span>
                )}
              </div>

              <div className="location-code">{o.code}</div>

              <div className="location-details">
                <div>
                  <span>PHONE</span>
                  <strong>{o.phone || 'Not added'}</strong>
                </div>
                <div>
                  <span>EMAIL</span>
                  <strong>{o.email || 'Not added'}</strong>
                </div>
                <div>
                  <span>LOCATION</span>
                  <strong>{o.address || 'Not added'}</strong>
                </div>
                <div>
                  <span>GSTIN</span>
                  <strong>{o.gstin || 'Unregistered / Not added'}</strong>
                </div>
              </div>

              <div className="location-footer">
                <span style={{ fontSize: '10px', color: '#64748b' }}>
                  Branch ID: #{o.id}
                </span>

                {isSelected ? (
                  <button
                    className="primary-btn"
                    style={{ padding: '6px 12px', fontSize: '10px', background: '#176b52' }}
                    disabled
                  >
                    <CheckCircle2 size={13} /> Active in POS
                  </button>
                ) : (
                  <button
                    className="outline-btn"
                    style={{ padding: '6px 12px', fontSize: '10px', fontWeight: 700 }}
                    onClick={() => {
                      if (setSelectedOutlet) {
                        setSelectedOutlet(o);
                      }
                      if (setNotice) setNotice(`Switched active terminal view to ${o.name}!`);
                    }}
                  >
                    Switch View <span>→</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        <button className="add-location-card" onClick={() => setShowModal(true)}>
          <span className="add-circle"><Plus size={22} /></span>
          <strong>Add a new outlet</strong>
          <span>Add a new branch location for your restaurant chain.</span>
        </button>
      </div>

      <div className="note-banner">
        <Activity size={19} />
        <div>
          <strong>Enterprise Multi-Outlet Architecture</strong>
          <p>
            Super Admin can maintain <strong>unlimited simultaneously active outlets</strong>. All operational tables isolate data automatically per outlet.
          </p>
        </div>
      </div>

      {/* Edit Outlet Modal */}
      {editingOutlet && (
        <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setEditingOutlet(null); }}>
          <div className="modal">
            <div className="modal-header">
              <div>
                <div className="eyebrow">BRANCH SETTINGS</div>
                <h2>Edit Outlet: {editingOutlet.name}</h2>
                <p>Update branch details and operating status.</p>
              </div>
              <button className="icon-button" onClick={() => setEditingOutlet(null)} title="Close"><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="form-two">
                <label>
                  <div className="label-text">
                    <span>Outlet Name</span>
                    <span className="req">*</span>
                  </div>
                  <input
                    required
                    maxLength="150"
                    placeholder="e.g. Hyderabad Hitech"
                    value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </label>

                <label>
                  <div className="label-text">
                    <span>Outlet Code</span>
                    <span className="req">*</span>
                  </div>
                  <input
                    required
                    maxLength="30"
                    placeholder="e.g. HYD-01"
                    value={editForm.code}
                    onChange={e => setEditForm({ ...editForm, code: e.target.value.toUpperCase() })}
                  />
                </label>
              </div>

              <div className="form-two">
                <label>
                  <div className="label-text">
                    <span>Phone</span>
                  </div>
                  <input
                    maxLength="30"
                    placeholder="+91..."
                    value={editForm.phone}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </label>
                <label>
                  <div className="label-text">
                    <span>Email</span>
                  </div>
                  <input
                    type="email"
                    maxLength="150"
                    placeholder="branch@example.com"
                    value={editForm.email}
                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                  />
                </label>
              </div>

              <label>
                <div className="label-text">
                  <span>Address</span>
                </div>
                <textarea
                  rows="2"
                  placeholder="Street, city, state"
                  value={editForm.address}
                  onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                />
              </label>

              <label>
                <div className="label-text">
                  <span>GSTIN</span>
                  <span className="optional">OPTIONAL</span>
                </div>
                <input
                  maxLength="15"
                  placeholder="GST registration number"
                  value={editForm.gstin}
                  onChange={e => setEditForm({ ...editForm, gstin: e.target.value.toUpperCase() })}
                />
              </label>

              <label className="inline-label" style={{ padding: '10px 12px', background: editForm.active ? '#ecfdf5' : '#f8fafc', border: `1.5px solid ${editForm.active ? '#86efac' : '#cbd5e1'}`, borderRadius: '8px' }}>
                <input
                  type="checkbox"
                  checked={editForm.active}
                  onChange={e => setEditForm({ ...editForm, active: e.target.checked })}
                />
                <span style={{ fontSize: '12px', fontWeight: 600, color: editForm.active ? '#15803d' : '#475569' }}>
                  Branch is Active (Accepting Orders & Operational)
                </span>
              </label>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setEditingOutlet(null)}>Cancel</button>
                <button type="submit" className="primary-btn" disabled={saving}>
                  <Check size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
