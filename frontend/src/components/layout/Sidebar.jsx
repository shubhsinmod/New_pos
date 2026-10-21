import React from 'react';
import {
  Armchair,
  BarChart3,
  CircleHelp,
  ClipboardList,
  Coffee,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Settings,
  ShoppingBag,
  Store,
  Users,
  Utensils,
  X,
  ChevronDown,
  ShieldCheck
} from 'lucide-react';

const NAV_ITEMS = [
  ['Overview', LayoutDashboard],
  ['POS Terminal', ShoppingBag],
  ['Tables', Armchair],
  ['Orders & KOT', ClipboardList],
  ['Menu & Products', Coffee],
  ['Billing & Payments', CreditCard],
  ['Customers', Users],
  ['Outlets', Store],
  ['Reports', BarChart3],
  ['Staff & Roles', ShieldCheck],
  ['Settings', Settings],
];

const ROLE_PERMISSIONS = {
  SUPER_ADMIN: ['Overview', 'POS Terminal', 'Tables', 'Orders & KOT', 'Menu & Products', 'Billing & Payments', 'Customers', 'Outlets', 'Reports', 'Staff & Roles', 'Settings'],
  ADMIN: ['Overview', 'POS Terminal', 'Tables', 'Orders & KOT', 'Menu & Products', 'Billing & Payments', 'Customers', 'Reports', 'Staff & Roles'],
  MANAGER: ['Overview', 'POS Terminal', 'Tables', 'Orders & KOT', 'Menu & Products', 'Billing & Payments', 'Customers', 'Reports'],
  CASHIER: ['POS Terminal', 'Tables', 'Billing & Payments'],
  WAITER: ['Tables', 'POS Terminal'],
  KITCHEN: ['Orders & KOT'],
};

export default function Sidebar({
  active,
  setActive,
  sidebarOpen,
  setSidebarOpen,
  selectedOutlet,
  orders,
  currentUser,
  onLogout
}) {
  const activeKotCount = orders.filter(o => o.status === 'In Kitchen').length;
  const userRole = currentUser?.role || 'WAITER';
  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  const allowedTabs = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS.WAITER;
  const visibleNavItems = NAV_ITEMS.filter(([label]) => allowedTabs.includes(label));

  const initials = currentUser?.fullName
    ? currentUser.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : currentUser?.username?.slice(0, 2).toUpperCase() || 'SA';

  return (
    <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <div className="brand">
        <div className="brand-mark"><Utensils size={21} /></div>
        <div>
          <strong>tableflow</strong>
          <small>{isSuperAdmin ? 'SUPER ADMIN CONSOLE' : 'RESTAURANT POS'}</small>
        </div>
        <button
          className="sidebar-close-btn"
          onClick={() => setSidebarOpen(false)}
          title="Close / Collapse Sidebar"
        >
          <X size={17} />
        </button>
      </div>

      <div className="workspace-label">
        {isSuperAdmin ? 'OUTLET SELECTION' : 'ASSIGNED OUTLET'}
      </div>
      <div
        className="workspace"
        onClick={() => {
          if (isSuperAdmin) setActive('Outlets');
        }}
        style={{ cursor: isSuperAdmin ? 'pointer' : 'default' }}
        title={isSuperAdmin ? 'Click to manage outlets' : `Locked to ${selectedOutlet?.name || currentUser?.outletName}`}
      >
        <div className="workspace-avatar">{selectedOutlet?.code?.slice(0, 2) || 'TF'}</div>
        <div className="workspace-copy">
          <strong>{selectedOutlet?.name || currentUser?.outletName || 'Loading branch...'}</strong>
          <span>{selectedOutlet?.code || 'BLR'} · {isSuperAdmin ? 'All Outlets Access' : 'Branch Staff'}</span>
        </div>
        {isSuperAdmin && <ChevronDown size={16} />}
      </div>

      <div className="nav-label">OPERATIONS & BILLING</div>
      <nav>
        {visibleNavItems.map(([label, Icon]) => (
          <button
            key={label}
            onClick={() => {
              setActive(label);
              if (window.innerWidth <= 900) {
                setSidebarOpen(false);
              }
            }}
            className={`nav-item ${active === label ? 'active' : ''}`}
          >
            <Icon size={18} />
            <span>{label}</span>
            {label === 'POS Terminal' && <span className="nav-soon" style={{ color: '#176b52', fontWeight: 700 }}>LIVE</span>}
            {label === 'Orders & KOT' && activeKotCount > 0 && (
              <span className="badge-pill paid" style={{ marginLeft: 'auto', fontSize: '9px', padding: '1px 6px' }}>
                {activeKotCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="help-card">
          <CircleHelp size={18} />
          <div>
            <strong>Role: {userRole}</strong>
            <span>Active session verified</span>
          </div>
        </div>
        <div className="profile">
          <div className="profile-avatar">{initials}</div>
          <div className="profile-copy">
            <strong>{currentUser?.fullName || currentUser?.username || 'Admin User'}</strong>
            <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{userRole}</span>
          </div>
          <button
            onClick={onLogout}
            title="Sign out / Switch Staff"
            style={{ border: 0, background: 'transparent', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </aside>
  );
}
