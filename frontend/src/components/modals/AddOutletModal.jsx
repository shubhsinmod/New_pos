import React from 'react';
import { Plus, X } from 'lucide-react';

export default function AddOutletModal({
  showModal,
  setShowModal,
  createOutlet,
  form,
  setForm
}) {
  if (!showModal) return null;

  return (
    <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <div className="eyebrow">BRANCH SETUP</div>
            <h2>Add New Outlet</h2>
            <p>Add a new branch location for your restaurant chain.</p>
          </div>
          <button className="icon-button" onClick={() => setShowModal(false)} title="Close"><X size={18} /></button>
        </div>

        <form onSubmit={createOutlet}>
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
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
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
                value={form.code}
                onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
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
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
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
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
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
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
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
              value={form.gstin}
              onChange={e => setForm({ ...form, gstin: e.target.value.toUpperCase() })}
            />
          </label>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="primary-btn"><Plus size={16} /> Save Outlet</button>
          </div>
        </form>
      </div>
    </div>
  );
}
