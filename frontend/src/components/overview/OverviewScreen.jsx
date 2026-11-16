import React from 'react';
import { Armchair, ClipboardList, CreditCard, Receipt, ShoppingBag, Store } from 'lucide-react';

export default function OverviewScreen({
  setActive,
  selectedOutlet,
  setSelectedOutlet,
  analytics,
  bills,
  tables,
  orders,
  outlets,
  brands,
  brandAnalytics,
  setSelectedTableId,
  setOrderType,
  setActiveReceipt,
  setShowReceiptModal,
  handleSelectTable
}) {
  const isBrandView = selectedOutlet?.id === 'ALL';

  if (isBrandView) {
    const totalRev = brandAnalytics?.totalBrandRevenue || 0;
    const totalBills = brandAnalytics?.totalBills || 0;
    const brandName = brandAnalytics?.brandName || brands?.[0]?.name || 'Tableflow Gourmet Foods';
    const breakdowns = brandAnalytics?.outletsBreakdown || [];

    return (
      <>
        <div className="page-heading">
          <div>
            <div className="eyebrow">ENTERPRISE BRAND CONSOLIDATED VIEW</div>
            <h1>{brandName} Dashboard <span>✦</span></h1>
            <p>Aggregated real-time metrics across all {breakdowns.length || outlets.length} brand outlets & online delivery channels.</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="primary-btn" onClick={() => setActive('Outlets')}>
              <Store size={16} /> Manage Outlets
            </button>
          </div>
        </div>

        {/* Brand Banner */}
        <div className="welcome-banner" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)' }}>
          <div className="banner-copy">
            <div className="banner-kicker" style={{ color: '#6ee7b7' }}>CENTRAL RESTAURANT BRAND</div>
            <h2>{brandName}</h2>
            <p>Unified enterprise view consolidating revenue, dining floor, Swiggy & Zomato orders from all branch locations.</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '14px', flexWrap: 'wrap' }}>
              <span style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.18)', borderRadius: '20px', fontSize: '12px', fontWeight: 700, color: '#fff' }}>
                🏢 Total Outlets: {breakdowns.length || outlets.length}
              </span>
              <span style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.18)', borderRadius: '20px', fontSize: '12px', fontWeight: 700, color: '#fff' }}>
                ⚡ Multi-Outlet Realtime Sync
              </span>
            </div>
          </div>
          <div className="banner-art">
            <div className="art-ring ring-one" />
            <div className="art-ring ring-two" />
            <div className="art-store"><Store size={64} strokeWidth={1.2} /></div>
            <div className="floating-card">
              <span className="green-dot" /> Consolidated Brand View
            </div>
          </div>
        </div>

        {/* Brand Consolidated Stats Grid */}
        <div className="section-head">
          <div>
            <h2>Consolidated Brand Performance</h2>
            <p>Combined totals across all operating branches.</p>
          </div>
          <span className="updated-label"><span className="green-dot" /> Brand sync</span>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon tone-0"><CreditCard size={19} /></div>
            <div className="stat-label">Total Brand Revenue</div>
            <div className="stat-value">₹{totalRev.toLocaleString('en-IN')}</div>
            <div className="stat-sub">Across all {breakdowns.length} outlets</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon tone-1"><Receipt size={19} /></div>
            <div className="stat-label">Total Settled Invoices</div>
            <div className="stat-value">{totalBills}</div>
            <div className="stat-sub">Bills processed</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon tone-2"><Store size={19} /></div>
            <div className="stat-label">Total Brand Outlets</div>
            <div className="stat-value">{breakdowns.length || outlets.length}</div>
            <div className="stat-sub">Operating brand branches</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon tone-3"><Armchair size={19} /></div>
            <div className="stat-label">Total Dining Tables</div>
            <div className="stat-value">
              {breakdowns.reduce((sum, b) => sum + (b.totalTables || 0), 0)}
            </div>
            <div className="stat-sub">Total tables across network</div>
          </div>
        </div>

        {/* Per-Outlet Performance Breakdown Grid */}
        <div className="section-head" style={{ marginTop: '28px' }}>
          <div>
            <h2>Branch Outlets Performance Breakdown</h2>
            <p>Compare individual branch revenues, bill counts, and delivery partner IDs.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {breakdowns.map((b) => (
            <div
              key={b.outletId}
              className="panel"
              style={{ padding: '20px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="outlet-icon outlet-0" style={{ width: '38px', height: '38px' }}><Store size={20} /></div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>{b.outletName}</h3>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Code: {b.outletCode}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', background: '#ecfdf5', color: '#16a34a' }}>
                    ACTIVE
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '14px 0', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Revenue</span>
                    <div style={{ fontSize: '17px', fontWeight: 800, color: '#176b52' }}>₹{(b.revenue || 0).toLocaleString('en-IN')}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Bills</span>
                    <div style={{ fontSize: '17px', fontWeight: 800, color: '#1e293b' }}>{b.billsCount || 0} Settled</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Tables</span>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>{b.totalTables || 0} Tables</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Occupancy</span>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>{b.occupiedTables || 0} Occupied</div>
                  </div>
                </div>

                {/* Aggregator ID Badges */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '10px', padding: '2px 8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#dc2626', fontWeight: 600 }}>
                    <strong>Zomato Store:</strong> {b.zomatoStoreId || 'N/A'}
                  </span>
                  <span style={{ fontSize: '10px', padding: '2px 8px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '6px', color: '#ea580c', fontWeight: 600 }}>
                    <strong>Swiggy Store:</strong> {b.swiggyStoreId || 'N/A'}
                  </span>
                </div>
              </div>

              <button
                className="outline-btn"
                style={{ width: '100%', justifyContent: 'center', padding: '8px 14px', fontSize: '11px', fontWeight: 700 }}
                onClick={() => {
                  const target = outlets.find(o => o.id === b.outletId);
                  if (target && setSelectedOutlet) {
                    setSelectedOutlet(target);
                  }
                }}
              >
                Switch to {b.outletName} Terminal <span>→</span>
              </button>
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">RESTAURANT PERFORMANCE & OPERATIONS</div>
          <h1>Live Dashboard <span>✦</span></h1>
          <p>Real-time dining, floor status, and revenue metrics.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="primary-btn" onClick={() => setActive('POS Terminal')}>
            <ShoppingBag size={16} /> Open POS Terminal
          </button>
        </div>
      </div>

      <div className="welcome-banner">
        <div className="banner-copy">
          <div className="banner-kicker">MULTI-OUTLET RESTAURANT POS</div>
          <h2>Fast & Efficient.<br />Enterprise Point of Sale.</h2>
          <p>Streamline dine-in orders, kitchen tickets, tables, and settlements seamlessly.</p>
          <button onClick={() => setActive('POS Terminal')} className="banner-btn">
            Launch Billing Counter <span>→</span>
          </button>
        </div>
        <div className="banner-art">
          <div className="art-ring ring-one" />
          <div className="art-ring ring-two" />
          <div className="art-store"><Store size={64} strokeWidth={1.2} /></div>
          <div className="floating-card">
            <span className="green-dot" /> Active Branch <strong>{selectedOutlet?.name || 'Loading...'}</strong>
          </div>
        </div>
      </div>

      {/* Dynamic Stats from DB */}
      <div className="section-head">
        <div>
          <h2>Today's Live Performance</h2>
          <p>Real-time orders, table turnover, and settlements.</p>
        </div>
        <span className="updated-label"><span className="green-dot" /> Live sync</span>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon tone-0"><CreditCard size={19} /></div>
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">₹{(analytics.totalRevenue || 0).toLocaleString('en-IN')}</div>
          <div className="stat-sub">{analytics.totalBills || bills.length} bills settled</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon tone-1"><Armchair size={19} /></div>
          <div className="stat-label">Table Occupancy</div>
          <div className="stat-value">{analytics.occupiedTables || tables.filter(t => t.status !== 'Available').length} / {tables.length}</div>
          <div className="stat-sub">{tables.filter(t => t.status === 'Available').length} tables vacant</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon tone-2"><ClipboardList size={19} /></div>
          <div className="stat-label">Active KOT Tickets</div>
          <div className="stat-value">{orders.filter(o => o.status !== 'Completed').length}</div>
          <div className="stat-sub">Live kitchen preparation</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon tone-3"><Store size={19} /></div>
          <div className="stat-label">Active Outlets</div>
          <div className="stat-value">{outlets.length}</div>
          <div className="stat-sub">Operational restaurant branches</div>
        </div>
      </div>

      {/* Lower Grid: Dining Tables & Invoices */}
      <div className="lower-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h3>Live Dining Tables</h3>
              <p>Real-time occupancy and active bills.</p>
            </div>
            <button className="text-btn" onClick={() => setActive('Tables')}>View all floor <span>→</span></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {tables.slice(0, 4).map(t => (
              <div
                key={t.id}
                className={`table-tile ${t.status?.toLowerCase() || 'available'}`}
                style={{ minHeight: '100px', padding: '10px' }}
                onClick={() => {
                  if (handleSelectTable) {
                    handleSelectTable(t.code, 'POS Terminal');
                  } else {
                    setSelectedTableId(t.code);
                    setOrderType('Dine-In');
                    setActive('POS Terminal');
                  }
                }}
              >
                <div className="table-tile-top">
                  <strong className="table-number">{t.code}</strong>
                  <span className={`badge-pill ${t.status === 'Available' ? 'paid' : t.status === 'Occupied' ? 'cash' : 'upi'}`}>
                    {t.status}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                  {t.status === 'Occupied' ? `Bill: ₹${t.runningTotal} · ${t.orderTime || 'Running'}` : `${t.seats} Seater · ${t.zone}`}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel setup-panel">
          <div className="panel-heading">
            <div>
              <h3>Recent Paid Invoices</h3>
              <p>Settled receipts and customer payments.</p>
            </div>
            <button className="text-btn" onClick={() => setActive('Billing & Payments')}>View history <span>→</span></button>
          </div>
          {bills.length === 0 ? (
            <div style={{ padding: '20px', color: '#94a3b8', fontSize: '11px', textAlign: 'center' }}>
              No bills settled yet today.
            </div>
          ) : (
            bills.slice(0, 3).map(b => (
              <div className="outlet-row" key={b.id}>
                <div className="outlet-icon outlet-0"><Receipt size={18} /></div>
                <div className="outlet-info">
                  <strong>{b.billNumber || `BILL-${b.id}`} — ₹{b.total}</strong>
                  <span>{b.customerName} · {b.tableCode} · {b.paymentMode}</span>
                </div>
                <span className={`badge-pill ${(b.paymentMode || 'cash').toLowerCase()}`}>{b.paymentMode}</span>
                <button
                  className="outline-btn"
                  style={{ padding: '4px 8px', fontSize: '9px' }}
                  onClick={() => { setActiveReceipt(b); setShowReceiptModal(true); }}
                >
                  Receipt
                </button>
              </div>
            ))
          )}
        </section>
      </div>
    </>
  );
}
