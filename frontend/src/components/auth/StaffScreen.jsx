import React, { useState, useEffect, useMemo } from 'react';
import { UserCheck, UserPlus, Key, Shield, ShieldAlert, Trash2, CheckCircle2, Lock, RefreshCw, Store, Filter, X, Plus } from 'lucide-react';
import * as api from '../../services/api';

const ROLE_COLORS = {
  SUPER_ADMIN: '#b45309',
  ADMIN: '#dc2626',
  MANAGER: '#7c3aed',
  CASHIER: '#2563eb',
  WAITER: '#ea580c',
  KITCHEN: '#059669',
};

const ROLE_BG = {
  SUPER_ADMIN: '#fef3c7',
  ADMIN: '#fee2e2',
  MANAGER: '#f3e8ff',
  CASHIER: '#eff6ff',
  WAITER: '#ffedd5',
  KITCHEN: '#dcfce7',
};

export default function StaffScreen({ currentUser, selectedOutlet, outlets = [], setNotice }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [filterOutletId, setFilterOutletId] = useState('ALL');

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  // Available roles for creation
  const creatableRoles = useMemo(() => {
    if (isSuperAdmin) {
      return [
        { value: 'ADMIN', label: 'ADMIN (Outlet Administrator)', desc: 'Manages specific outlet, floor, billing & outlet staff' },
        { value: 'MANAGER', label: 'MANAGER (Floor & KOT)', desc: 'Floor supervisor, orders, tables & reports' },
        { value: 'CASHIER', label: 'CASHIER (POS Terminal)', desc: 'Terminal POS orders & billing settlements' },
        { value: 'WAITER', label: 'WAITER (Order Taking)', desc: 'Floor table orders & customer service' },
        { value: 'KITCHEN', label: 'KITCHEN (Chef Display)', desc: 'Live KOT screen only' },
        { value: 'SUPER_ADMIN', label: 'SUPER_ADMIN (Global Control)', desc: 'Full enterprise control across all outlets' },
      ];
    }
    // Outlet Admin can create branch staff only
    return [
      { value: 'MANAGER', label: 'MANAGER (Floor & KOT)', desc: 'Floor supervisor, orders, tables & reports' },
      { value: 'CASHIER', label: 'CASHIER (POS Terminal)', desc: 'Terminal POS orders & billing settlements' },
      { value: 'WAITER', label: 'WAITER (Order Taking)', desc: 'Floor table orders & customer service' },
      { value: 'KITCHEN', label: 'KITCHEN (Chef Display)', desc: 'Live KOT screen only' },
    ];
  }, [isSuperAdmin]);

  const defaultRole = isSuperAdmin ? 'ADMIN' : 'CASHIER';
  const defaultOutletId = isSuperAdmin ? (selectedOutlet?.id || (outlets[0]?.id || 1)) : (currentUser?.outletId || 1);
  const defaultOutletName = isSuperAdmin ? (selectedOutlet?.name || (outlets[0]?.name || 'Main Branch')) : (currentUser?.outletName || 'Assigned Branch');

  const [form, setForm] = useState({
    username: '',
    password: '',
    fullName: '',
    role: defaultRole,
    email: '',
    phone: '',
    outletName: defaultOutletName,
    outletId: defaultOutletId,
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      if (setNotice) setNotice('Error loading users: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtered users: Super Admin can see all or filter; Outlet Admin only sees their own branch users
  const visibleUsers = useMemo(() => {
    if (isSuperAdmin) {
      if (filterOutletId === 'ALL') return users;
      return users.filter(u => String(u.outletId) === String(filterOutletId));
    }
    // Outlet Admin only sees users of their assigned outlet
    return users.filter(u => String(u.outletId) === String(currentUser?.outletId));
  }, [users, isSuperAdmin, filterOutletId, currentUser]);

  const handleOpenAddModal = () => {
    const oId = isSuperAdmin ? (selectedOutlet?.id || outlets[0]?.id || 1) : (currentUser?.outletId || 1);
    const oFound = outlets.find(o => o.id === oId);
    const oName = oFound ? oFound.name : (currentUser?.outletName || 'Main Branch');

    setForm({
      username: '',
      password: '',
      fullName: '',
      role: defaultRole,
      email: '',
      phone: '',
      outletName: oName,
      outletId: oId,
    });
    setShowAddModal(true);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) return;

    // Determine target outlet
    let targetOid = form.outletId;
    let targetOname = form.outletName;

    if (!isSuperAdmin) {
      // Force Outlet Admin's own outlet
      targetOid = currentUser?.outletId;
      targetOname = currentUser?.outletName;
    } else if (form.role === 'SUPER_ADMIN') {
      targetOid = null;
      targetOname = 'All Outlets (Global)';
    }

    try {
      const created = await api.createUser({
        ...form,
        outletId: targetOid,
        outletName: targetOname,
      });
      setUsers(prev => [created, ...prev]);
      setShowAddModal(false);
      if (setNotice) setNotice(`Staff account "${created.username}" (${created.role}) created for ${targetOname}!`);
    } catch (err) {
      if (setNotice) setNotice('Failed to create user: ' + err.message);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!selectedUser || !newPassword) return;
    try {
      await api.updateUser(selectedUser.id, { password: newPassword });
      setShowResetModal(false);
      setNewPassword('');
      if (setNotice) setNotice(`Password reset and re-encrypted for ${selectedUser.username}!`);
    } catch (err) {
      if (setNotice) setNotice('Password update failed: ' + err.message);
    }
  };

  const handleToggleActive = async (user) => {
    if (user.username === 'superadmin') {
      if (setNotice) setNotice('Cannot deactivate master superadmin account.');
      return;
    }
    try {
      const updated = await api.updateUser(user.id, { active: !user.active });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, active: updated.active } : u));
      if (setNotice) setNotice(`User ${user.username} is now ${updated.active ? 'Active' : 'Deactivated'}.`);
    } catch (err) {
      if (setNotice) setNotice('Error toggling status: ' + err.message);
    }
  };

  const handleDeleteUser = async (user) => {
    if (user.username === 'superadmin') {
      if (setNotice) setNotice('Cannot delete master superadmin account.');
      return;
    }
    if (!isSuperAdmin && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) {
      if (setNotice) setNotice('Outlet Admin cannot delete Admin accounts.');
      return;
    }
    if (!window.confirm(`Delete user "${user.username}"?`)) return;
    try {
      await api.deleteUser(user.id);
      setUsers(prev => prev.filter(u => u.id !== user.id));
      if (setNotice) setNotice(`User ${user.username} removed.`);
    } catch (err) {
      if (setNotice) setNotice('Delete failed: ' + err.message);
    }
  };

  return (
    <div>
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            {isSuperAdmin ? 'ENTERPRISE ACCESS CONTROL' : `OUTLET STAFF · ${currentUser?.outletName || 'MY BRANCH'}`}
          </div>
          <h1>Staff & Role Permissions ({visibleUsers.length})</h1>
          <p>
            {isSuperAdmin
              ? 'Super Admin: Manage Outlet Admins and branch staff across all restaurant outlets.'
              : `Outlet Admin: Manage Waiters, Kitchen Chefs, Cashiers and Managers for ${currentUser?.outletName}.`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {isSuperAdmin && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b' }}>
              <Filter size={14} />
              <select
                className="pos-select-pill"
                value={filterOutletId}
                onChange={e => setFilterOutletId(e.target.value)}
                title="Filter staff by outlet"
              >
                <option value="ALL">All Outlets ({users.length})</option>
                {outlets.map(o => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>
          )}
          <button className="outline-btn" onClick={fetchUsers} title="Refresh Staff">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button className="primary-btn" onClick={handleOpenAddModal}>
            <UserPlus size={16} /> Add Staff User
          </button>
        </div>
      </div>

      {/* Role Summary Cards */}
      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        <div className="stat-card">
          <div className="stat-label">{isSuperAdmin ? 'Super / Outlet Admins' : 'Outlet Admin'}</div>
          <div className="stat-value">
            {visibleUsers.filter(u => u.role === 'SUPER_ADMIN' || u.role === 'ADMIN').length}
          </div>
          <div className="stat-sub">Administrative control</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Managers & Cashiers</div>
          <div className="stat-value">
            {visibleUsers.filter(u => u.role === 'MANAGER' || u.role === 'CASHIER').length}
          </div>
          <div className="stat-sub">Floor & billing operations</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Waiters & Captains</div>
          <div className="stat-value">
            {visibleUsers.filter(u => u.role === 'WAITER').length}
          </div>
          <div className="stat-sub">Floor table ordering</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Kitchen Chefs</div>
          <div className="stat-value">
            {visibleUsers.filter(u => u.role === 'KITCHEN').length}
          </div>
          <div className="stat-sub">Live KOT preparation</div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="panel" style={{ padding: '0', overflow: 'hidden' }}>
        <table className="pos-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', fontSize: '11px', color: '#64748b' }}>
              <th style={{ padding: '12px 16px' }}>STAFF USER</th>
              <th style={{ padding: '12px 16px' }}>ROLE ACCESS</th>
              <th style={{ padding: '12px 16px' }}>ASSIGNED OUTLET</th>
              <th style={{ padding: '12px 16px' }}>CONTACT</th>
              <th style={{ padding: '12px 16px' }}>STATUS</th>
              <th style={{ padding: '12px 16px' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {visibleUsers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                  No staff accounts found for this outlet. Click "Add Staff User" to create one.
                </td>
              </tr>
            ) : (
              visibleUsers.map((u) => {
                const color = ROLE_COLORS[u.role] || '#64748b';
                const bg = ROLE_BG[u.role] || '#f1f5f9';
                const canManageUser = isSuperAdmin || (u.role !== 'SUPER_ADMIN' && u.role !== 'ADMIN');

                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '12px' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: bg,
                            color: color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '11px'
                          }}
                        >
                          {u.username?.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <strong style={{ display: 'block', color: '#0f172a' }}>{u.fullName || u.username}</strong>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>@{u.username}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontWeight: 700,
                          fontSize: '10px',
                          background: bg,
                          color: color,
                          letterSpacing: '0.4px'
                        }}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155', fontWeight: 600 }}>
                        <Store size={14} color="#176b52" />
                        <span>{u.outletName || (u.role === 'SUPER_ADMIN' ? 'All Outlets (Global)' : 'Main Branch')}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '11px' }}>
                      {u.phone || u.email || '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        onClick={() => canManageUser && handleToggleActive(u)}
                        style={{
                          cursor: canManageUser ? 'pointer' : 'default',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: u.active ? '#15803d' : '#94a3b8'
                        }}
                        title={canManageUser ? 'Click to toggle status' : 'Locked'}
                      >
                        <span
                          style={{
                            width: '7px',
                            height: '7px',
                            borderRadius: '50%',
                            background: u.active ? '#22c55e' : '#cbd5e1'
                          }}
                        />
                        {u.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {canManageUser ? (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            className="outline-btn"
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                            onClick={() => { setSelectedUser(u); setNewPassword(''); setShowResetModal(true); }}
                            title="Reset password with new BCrypt hash"
                          >
                            <Key size={12} /> Reset Pass
                          </button>
                          {u.username !== 'superadmin' && (
                            <button
                              className="outline-btn"
                              style={{ padding: '4px 8px', fontSize: '11px', color: '#ef4444' }}
                              onClick={() => handleDeleteUser(u)}
                              title="Delete user"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>Protected</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setShowAddModal(false); }}>
          <div className="modal">
            <div className="modal-header">
              <div>
                <div className="eyebrow">
                  {isSuperAdmin ? 'ENTERPRISE USER PROVISIONING' : `OUTLET STAFF · ${currentUser?.outletName || 'BRANCH'}`}
                </div>
                <h2>Create Staff Account</h2>
                <p>Add a login for manager, cashier, waiter or kitchen.</p>
              </div>
              <button className="icon-button" onClick={() => setShowAddModal(false)} title="Close"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="form-two">
                <label>
                  <div className="label-text">
                    <span>Username</span>
                    <span className="req">*</span>
                  </div>
                  <input
                    type="text"
                    value={form.username}
                    onChange={e => setForm({ ...form, username: e.target.value })}
                    placeholder="e.g. rohan"
                    required
                  />
                </label>
                <label>
                  <div className="label-text">
                    <span>Password</span>
                    <span className="req">*</span>
                  </div>
                  <input
                    type="password"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="Min 4 characters"
                    required
                  />
                </label>
              </div>

              <label>
                <div className="label-text">
                  <span>Full Name</span>
                </div>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={e => setForm({ ...form, fullName: e.target.value })}
                  placeholder="e.g. Rohan Sharma"
                />
              </label>

              {/* Role Selection */}
              <label>
                <div className="label-text">
                  <span>Role Permission</span>
                  <span className="req">*</span>
                </div>
                <select
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  required
                >
                  {creatableRoles.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                <small style={{ display: 'block', marginTop: '2px', color: '#64748b', fontSize: '10.5px' }}>
                  {creatableRoles.find(r => r.value === form.role)?.desc}
                </small>
              </label>

              {/* Outlet Assignment */}
              <label>
                <div className="label-text">
                  <span>Assigned Branch / Outlet</span>
                  <span className="req">*</span>
                </div>
                {isSuperAdmin ? (
                  form.role === 'SUPER_ADMIN' ? (
                    <div style={{ padding: '8px 12px', background: '#fef3c7', borderRadius: '8px', fontSize: '11px', color: '#b45309', fontWeight: 600 }}>
                      Global Access · All Outlets
                    </div>
                  ) : (
                    <select
                      value={form.outletId}
                      onChange={e => {
                        const found = outlets.find(o => String(o.id) === e.target.value);
                        setForm({
                          ...form,
                          outletId: found ? found.id : e.target.value,
                          outletName: found ? found.name : 'Branch'
                        });
                      }}
                      required
                    >
                      {outlets.map(o => (
                        <option key={o.id} value={o.id}>{o.name} ({o.code})</option>
                      ))}
                    </select>
                  )
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', color: '#334155', fontWeight: 600 }}>
                    <Store size={15} color="#176b52" />
                    <span>{currentUser?.outletName || 'Assigned Branch'}</span>
                    <span style={{ marginLeft: 'auto', fontSize: '10px', color: '#94a3b8' }}>Locked to your outlet</span>
                  </div>
                )}
              </label>

              <div className="form-two">
                <label>
                  <div className="label-text">
                    <span>Email</span>
                    <span className="optional">OPTIONAL</span>
                  </div>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="staff@tableflow.com"
                  />
                </label>
                <label>
                  <div className="label-text">
                    <span>Phone</span>
                    <span className="optional">OPTIONAL</span>
                  </div>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                  />
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="primary-btn"><Plus size={16} /> Create Staff Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showResetModal && selectedUser && (
        <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setShowResetModal(false); }}>
          <div className="modal" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <div>
                <div className="eyebrow">SECURITY / BCRYPT HASH</div>
                <h2>Reset Password</h2>
                <p>Set a new password for <strong>{selectedUser.username}</strong> ({selectedUser.role}).</p>
              </div>
              <button className="icon-button" onClick={() => setShowResetModal(false)} title="Close"><X size={18} /></button>
            </div>
            <form onSubmit={handleResetPassword}>
              <label>
                <div className="label-text">
                  <span>New Password</span>
                  <span className="req">*</span>
                </div>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  autoFocus
                />
              </label>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowResetModal(false)}>Cancel</button>
                <button type="submit" className="primary-btn">Save Encrypted Password</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
