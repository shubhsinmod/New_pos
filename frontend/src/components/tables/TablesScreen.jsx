import React, { useState } from 'react';
import { ArrowRight, Check, CreditCard, Plus, ShoppingBag, Trash2, Users, Armchair, Store, Layers, X } from 'lucide-react';

const COMMON_ZONES = [
  'Main Dining',
  'AC Family Hall',
  'Rooftop Terrace',
  'Bar Lounge',
  'Outdoor Garden',
  'Private VIP Cabin'
];

const SEAT_OPTIONS = [2, 4, 6, 8, 10, 12];

export default function TablesScreen({
  tables,
  handleSelectTable,
  handleSettleTable,
  handleMarkTableAvailable,
  handleUpdateTableStatus,
  handleCreateTable,
  selectedOutlet,
  setActive,
  setNotice
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    code: '',
    name: '',
    zone: 'Main Dining',
    seats: 4,
  });

  const handleOpenAddModal = () => {
    // Generate suggested code
    const existingCount = tables.length;
    const suggestedNum = existingCount + 1 < 10 ? `0${existingCount + 1}` : `${existingCount + 1}`;
    setForm({
      code: `T-${suggestedNum}`,
      name: `Table ${existingCount + 1}`,
      zone: 'Main Dining',
      seats: 4,
    });
    setShowAddModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.name.trim()) return;

    // Check duplicate code in currently loaded tables
    if (tables.some(t => t.code?.toUpperCase() === form.code.trim().toUpperCase())) {
      if (setNotice) setNotice(`Table code "${form.code.trim().toUpperCase()}" already exists! Please use a unique code.`);
      return;
    }

    setSubmitting(true);
    try {
      if (handleCreateTable) {
        await handleCreateTable({
          code: form.code.trim().toUpperCase(),
          name: form.name.trim(),
          zone: form.zone,
          seats: parseInt(form.seats, 10) || 4,
        });
      }
      setShowAddModal(false);
    } catch (err) {
      if (setNotice) setNotice('Error adding table: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            FLOOR LAYOUT · {selectedOutlet?.name || 'ACTIVE OUTLET'}
          </div>
          <h1>Restaurant Dining Tables ({tables.length})</h1>
          <p>Real-time dining floor layout and table occupancy status.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="outline-btn" onClick={() => setActive('POS Terminal')}>
            <ShoppingBag size={16} /> Open POS Terminal
          </button>
          <button className="primary-btn" onClick={handleOpenAddModal}>
            <Plus size={16} /> Add Table
          </button>
        </div>
      </div>

      {/* Status legend */}
      <div className="table-status-legend">
        <span className="legend-pill"><span className="green-dot" /> Available ({tables.filter(t => t.status === 'Available').length})</span>
        <span className="legend-pill"><span className="green-dot" style={{ background: '#f97316' }} /> Occupied ({tables.filter(t => t.status === 'Occupied').length})</span>
        <span className="legend-pill"><span className="green-dot" style={{ background: '#3b82f6' }} /> Billed ({tables.filter(t => t.status === 'Billed').length})</span>
        <span className="legend-pill"><span className="green-dot" style={{ background: '#a855f7' }} /> Reserved ({tables.filter(t => t.status === 'Reserved').length})</span>
      </div>

      {/* Table Grid */}
      <div className="table-grid">
        {tables.map(t => (
          <div
            key={t.id}
            className={`table-tile ${t.status?.toLowerCase() || 'available'}`}
            onClick={() => handleSelectTable(t.code, 'POS Terminal')}
          >
            <div className="table-tile-top">
              <span className="table-number">{t.code}</span>
              <span className="table-capacity">
                <Users size={12} /> {t.seats} Seats
              </span>
            </div>

            <div className="table-tile-mid">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <strong>{t.zone}</strong>
                {t.customerName && (
                  <span style={{ fontSize: '11px', color: '#0f766e', fontWeight: 600, background: '#ccfbf1', padding: '1px 6px', borderRadius: '4px' }}>
                    👤 {t.customerName}
                  </span>
                )}
              </div>
              {t.status === 'Occupied' ? (
                <span style={{ color: '#ea580c', fontWeight: 600 }}>
                  Running: ₹{t.runningTotal} · {t.orderTime || 'Active'}
                </span>
              ) : t.status === 'Billed' ? (
                <span style={{ color: '#2563eb', fontWeight: 600 }}>
                  Bill generated: ₹{t.runningTotal}
                </span>
              ) : t.status === 'Reserved' ? (
                <span style={{ color: '#7c3aed', fontWeight: 600 }}>
                  Reserved for guest
                </span>
              ) : (
                <span style={{ color: '#16a34a' }}>Vacant & ready for guest</span>
              )}
            </div>

            {/* Quick Action Buttons for Billed, Occupied, Reserved, Available */}
            <div className="table-tile-actions" onClick={e => e.stopPropagation()}>
              {t.status === 'Billed' && (
                <>
                  <button
                    className="table-btn settle"
                    onClick={() => handleSettleTable(t)}
                    title="Collect payment and settle invoice"
                  >
                    <CreditCard size={12} /> Pay ₹{t.runningTotal}
                  </button>
                  <button
                    className="table-btn success"
                    onClick={() => handleMarkTableAvailable(t.code)}
                    title="Reset table to Available state"
                  >
                    <Check size={12} /> Mark Available
                  </button>
                </>
              )}

              {t.status === 'Occupied' && (
                <>
                  <button
                    className="table-btn primary"
                    onClick={() => handleSelectTable(t.code, 'POS Terminal')}
                    title="Open table order in POS"
                  >
                    View / Add Items
                  </button>
                  <button
                    className="table-btn settle"
                    onClick={() => handleUpdateTableStatus(t.code, 'Billed')}
                    title="Print bill and mark table as Billed"
                  >
                    Generate Bill
                  </button>
                </>
              )}

              {t.status === 'Reserved' && (
                <>
                  <button
                    className="table-btn primary"
                    onClick={() => handleUpdateTableStatus(t.code, 'Occupied')}
                    title="Seat guests at this table"
                  >
                    Seat Guests
                  </button>
                  <button
                    className="table-btn vacate"
                    onClick={() => handleMarkTableAvailable(t.code)}
                    title="Cancel reservation and make available"
                  >
                    Cancel
                  </button>
                </>
              )}

              {t.status === 'Available' && (
                <button
                  className="table-btn primary"
                  onClick={() => handleSelectTable(t.code, 'POS Terminal')}
                  title="Create new order for this table"
                >
                  Take Order <ArrowRight size={12} />
                </button>
              )}
            </div>

            <div className="table-tile-footer">
              <span className={`badge-pill ${t.status === 'Available' ? 'paid' : t.status === 'Occupied' ? 'cash' : t.status === 'Billed' ? 'card' : 'upi'}`}>
                {t.status}
              </span>
              <span style={{ color: '#64748b', fontSize: '10px' }}>
                {t.status === 'Available' ? 'Click to order' : 'Click to view'}
              </span>
            </div>
          </div>
        ))}

        {/* 1-Click Add Table Tile in Floor Grid */}
        <div
          className="table-tile available"
          onClick={handleOpenAddModal}
          style={{
            borderStyle: 'dashed',
            borderColor: '#94a3b8',
            background: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            minHeight: '170px'
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: '#e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#176b52',
              marginBottom: '8px'
            }}
          >
            <Plus size={20} />
          </div>
          <strong style={{ fontSize: '13px', color: '#1e293b' }}>Add Dining Table</strong>
          <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Increase floor capacity</span>
        </div>
      </div>

      {/* Add Dining Table Modal Form */}
      {showAddModal && (
        <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setShowAddModal(false); }}>
          <div className="modal">
            <div className="modal-header">
              <div>
                <div className="eyebrow">FLOOR CAPACITY</div>
                <h2>Add Dining Table</h2>
                <p>Add a new table to <strong>{selectedOutlet?.name || 'Current Branch'}</strong></p>
              </div>
              <button className="icon-button" onClick={() => setShowAddModal(false)} title="Close"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-two">
                <label>
                  <div className="label-text">
                    <span>Table Code</span>
                    <span className="req">*</span>
                  </div>
                  <input
                    type="text"
                    value={form.code}
                    onChange={e => setForm({ ...form, code: e.target.value })}
                    placeholder="e.g. T-05, AC-04"
                    required
                    autoFocus
                  />
                  <small style={{ color: '#94a3b8', fontSize: '10px', marginTop: '2px' }}>Unique identifier on floor</small>
                </label>
                <label>
                  <div className="label-text">
                    <span>Display Name</span>
                    <span className="req">*</span>
                  </div>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Table 5"
                    required
                  />
                  <small style={{ color: '#94a3b8', fontSize: '10px', marginTop: '2px' }}>Friendly label</small>
                </label>
              </div>

              <label>
                <div className="label-text">
                  <span>Floor / Dining Zone</span>
                  <span className="req">*</span>
                </div>
                <select
                  value={form.zone}
                  onChange={e => setForm({ ...form, zone: e.target.value })}
                  required
                >
                  {COMMON_ZONES.map(z => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>
              </label>

              <label>
                <div className="label-text">
                  <span>Seating Capacity</span>
                  <span className="req">*</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', margin: '4px 0 6px', flexWrap: 'wrap' }}>
                  {SEAT_OPTIONS.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm({ ...form, seats: s })}
                      style={{
                        padding: '5px 12px',
                        border: form.seats === s ? '1.5px solid #176b52' : '1px solid #e2e8f0',
                        background: form.seats === s ? '#e6f4ec' : '#ffffff',
                        color: form.seats === s ? '#176b52' : '#475569',
                        fontWeight: 700,
                        fontSize: '11px',
                        borderRadius: '20px',
                        cursor: 'pointer'
                      }}
                    >
                      <Users size={11} style={{ display: 'inline', marginRight: '4px' }} />
                      {s} Seats
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={form.seats}
                  onChange={e => setForm({ ...form, seats: parseInt(e.target.value, 10) || 1 })}
                  placeholder="Or enter custom seats"
                />
              </label>

              {/* Outlet Badge Confirmation */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '11.5px', color: '#334155' }}>
                <Store size={15} color="#176b52" />
                <span>Assigned Outlet: <strong>{selectedOutlet?.name || 'Current Branch'}</strong></span>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="primary-btn" disabled={submitting}>
                  <Plus size={16} /> {submitting ? 'Adding...' : 'Add Table to Floor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
