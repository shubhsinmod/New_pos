import React from 'react';
import { Menu, RefreshCw, Store, LogOut } from 'lucide-react';

export default function Topbar({
  active,
  sidebarOpen,
  setSidebarOpen,
  fetchAllData,
  loading,
  setNotice,
  outlets,
  brands,
  selectedOutlet,
  setSelectedOutlet,
  apiStatus,
  currentUser,
  onLogout
}) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="sidebar-toggle-btn"
          onClick={() => setSidebarOpen(prev => !prev)}
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <Menu size={19} />
        </button>
        <span className="breadcrumb">Tableflow POS</span>
        <span className="crumb-slash">/</span>
        <strong>{active}</strong>
      </div>

      <div className="topbar-actions">
        {/* Central Brand Badge */}
        {brands && brands.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 10px',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '16px',
              fontSize: '11px',
              color: '#065f46',
              fontWeight: 700
            }}
            title={`Brand: ${brands[0].name} (${brands[0].code})`}
          >
            <span>🏢</span>
            <span>{brands[0].name}</span>
          </div>
        )}

        {/* Quick Refresh from DB */}
        <button
          className="icon-button"
          title="Refresh data"
          onClick={() => {
            fetchAllData();
            setNotice('Data refreshed.');
          }}
        >
          <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
        </button>

        {/* Outlet Switcher / Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b' }}>
          <Store size={15} color="#176b52" />
          {currentUser?.role === 'SUPER_ADMIN' ? (
            <select
              className="pos-select-pill"
              value={selectedOutlet?.id || ''}
              onChange={e => {
                if (e.target.value === 'ALL') {
                  setSelectedOutlet({ id: 'ALL', name: 'All Outlets (Brand View)', code: 'ALL' });
                } else {
                  const found = outlets.find(o => String(o.id) === e.target.value);
                  if (found) setSelectedOutlet(found);
                }
              }}
              title="Super Admin: Switch active outlet or Brand View"
            >
              <option value="ALL">🏢 All Outlets (Consolidated Brand View)</option>
              {outlets.map(o => (
                <option key={o.id} value={o.id}>📍 {o.name} ({o.code})</option>
              ))}
            </select>
          ) : (
            <span
              style={{
                padding: '4px 10px',
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                fontWeight: 600,
                color: '#334155',
              }}
              title="Assigned Branch Outlet"
            >
              {selectedOutlet?.name || currentUser?.outletName || 'Assigned Branch'}
            </span>
          )}
        </div>

        {/* Current Logged In Staff Badge & Explicit Logout Button */}
        {currentUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 10px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '20px',
              }}
            >
              <div className="top-avatar" style={{ width: '24px', height: '24px', fontSize: '10px' }}>
                {currentUser.username?.slice(0, 2).toUpperCase()}
              </div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#1e293b' }}>
                {currentUser.username}
              </span>
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 800,
                  background:
                    currentUser.role === 'SUPER_ADMIN'
                      ? '#fef3c7'
                      : currentUser.role === 'ADMIN'
                      ? '#fee2e2'
                      : currentUser.role === 'KITCHEN'
                      ? '#dcfce7'
                      : '#e0e7ff',
                  color:
                    currentUser.role === 'SUPER_ADMIN'
                      ? '#b45309'
                      : currentUser.role === 'ADMIN'
                      ? '#b91c1c'
                      : currentUser.role === 'KITCHEN'
                      ? '#15803d'
                      : '#4338ca',
                  padding: '1px 5px',
                  borderRadius: '4px',
                }}
              >
                {currentUser.role}
              </span>
            </div>

            <button
              onClick={onLogout}
              title="Logout from Terminal"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 10px',
                background: '#fff1f2',
                border: '1px solid #fecdd3',
                borderRadius: '20px',
                color: '#e11d48',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#ffe4e6';
                e.currentTarget.style.borderColor = '#fda4af';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#fff1f2';
                e.currentTarget.style.borderColor = '#fecdd3';
              }}
            >
              <LogOut size={13} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
