import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, UserCheck, X, Save, Phone, Mail, Award, Users } from 'lucide-react';
import * as api from '../../services/api';

export default function CustomersScreen({
  customers,
  setCustomers,
  setCartCustomer,
  setActive,
  setNotice,
  selectedOutlet
}) {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    loyaltyPoints: 0
  });

  const activeOutletId = selectedOutlet?.id || 1;

  const filteredCustomers = (customers || []).filter(c => {
    const q = search.toLowerCase();
    return (c.name || '').toLowerCase().includes(q) || (c.phone || '').includes(q) || (c.email || '').toLowerCase().includes(q);
  });

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      loyaltyPoints: 0
    });
    setShowModal(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCustomer(c);
    setFormData({
      name: c.name || '',
      phone: c.phone || '',
      email: c.email || '',
      loyaltyPoints: c.loyaltyPoints || 0
    });
    setShowModal(true);
  };

  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('Please enter both Customer Name and Mobile Number.');
      return;
    }

    try {
      if (editingCustomer) {
        // Update existing customer in MSSQL DB
        const updated = await api.updateCustomer(editingCustomer.id, {
          ...formData,
          outletId: activeOutletId
        });
        if (setCustomers) {
          setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? updated : c));
        }
        setNotice(`Customer ${updated.name} updated successfully.`);
      } else {
        // Create new customer
        const created = await api.saveCustomer({
          ...formData,
          outletId: activeOutletId,
          visits: 1,
          totalSpent: 0.0
        });
        if (setCustomers) {
          setCustomers(prev => [created, ...prev]);
        }
        setNotice(`✅ Customer ${created.name} saved successfully!`);
      }
      setShowModal(false);
    } catch (err) {
      alert('Error saving customer: ' + err.message);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete customer "${name}"?`)) return;
    try {
      await api.deleteCustomer(id);
      if (setCustomers) {
        setCustomers(prev => prev.filter(c => c.id !== id));
      }
      setNotice(`Customer "${name}" removed.`);
    } catch (err) {
      alert('Error deleting customer: ' + err.message);
    }
  };

  return (
    <div>
      <div className="page-heading">
        <div>
          <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Users size={11} color="#176b52" /> Guest Loyalty & CRM
          </div>
          <h1>Customer Directory ({customers.length})</h1>
          <p>Verified guest profiles, loyalty reward points, and purchase history.</p>
        </div>
        <button className="primary-btn" onClick={handleOpenAdd}>
          <Plus size={16} /> Add New Customer
        </button>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
        <div className="search-box" style={{ maxWidth: '360px' }}>
          <Search size={16} />
          <input
            placeholder="Search customer by name or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ fontSize: '11px', color: '#64748b' }}>
          Showing <b>{filteredCustomers.length}</b> of {customers.length} registered guests
        </div>
      </div>

      <div className="data-table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer ID</th>
              <th>Customer Name</th>
              <th>Mobile Number</th>
              <th>Email</th>
              <th>Total Visits</th>
              <th>Total Spend</th>
              <th>Reward Points</th>
              <th>Last Visit</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                  No customer records found matching your search.
                </td>
              </tr>
            ) : (
              filteredCustomers.map(c => (
                <tr key={c.id}>
                  <td><span style={{ fontSize: '10px', color: '#94a3b8' }}>#{c.id}</span></td>
                  <td><strong>{c.name}</strong></td>
                  <td><span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{c.phone || 'N/A'}</span></td>
                  <td><span style={{ fontSize: '10px', color: '#64748b' }}>{c.email || '—'}</span></td>
                  <td>{c.visits || 1} orders</td>
                  <td><strong style={{ color: '#176b52' }}>₹{(c.totalSpent || 0).toLocaleString('en-IN')}</strong></td>
                  <td>
                    <span className="badge-pill upi" style={{ fontSize: '10px', fontWeight: 700 }}>
                      ★ {c.loyaltyPoints || 0} Pts
                    </span>
                  </td>
                  <td>{c.lastVisitAt ? new Date(c.lastVisitAt).toLocaleDateString() : 'Active'}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        className="primary-btn"
                        style={{ padding: '4px 8px', fontSize: '10px' }}
                        onClick={() => {
                          setCartCustomer({ name: c.name, phone: c.phone });
                          setActive('POS Terminal');
                          setNotice(`Customer ${c.name} linked to POS billing.`);
                        }}
                        title="Link customer to active POS cart"
                      >
                        Bill
                      </button>

                      <button
                        className="outline-btn"
                        style={{ padding: '4px 7px', fontSize: '10px' }}
                        onClick={() => handleOpenEdit(c)}
                        title="Edit customer details"
                      >
                        <Edit2 size={11} />
                      </button>

                      <button
                        className="outline-btn"
                        style={{ padding: '4px 7px', fontSize: '10px', color: '#ef4444', borderColor: '#fecaca' }}
                        onClick={() => handleDelete(c.id, c.name)}
                        title="Delete customer"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Customer Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal" style={{ width: 'min(440px, 100%)' }}>
            <div className="modal-header">
              <div>
                <h2>{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</h2>
                <p>Save customer profile and loyalty details.</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                style={{ border: 0, background: 'transparent', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer}>
              <label>
                CUSTOMER FULL NAME <b>*</b>
                <input
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </label>

              <label>
                MOBILE NUMBER <b>*</b>
                <input
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </label>

              <label>
                EMAIL ADDRESS <span className="optional">(Optional)</span>
                <input
                  type="email"
                  placeholder="e.g. ramesh@example.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </label>

              <label>
                OPENING REWARD POINTS <span className="optional">(Loyalty Program)</span>
                <input
                  type="number"
                  placeholder="0"
                  value={formData.loyaltyPoints}
                  onChange={e => setFormData({ ...formData, loyaltyPoints: parseInt(e.target.value) || 0 })}
                />
              </label>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  <Save size={13} /> {editingCustomer ? 'Save Changes' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
