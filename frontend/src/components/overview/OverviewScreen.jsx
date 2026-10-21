import React from 'react';
import { Armchair, ClipboardList, CreditCard, Receipt, ShoppingBag, Store } from 'lucide-react';

export default function OverviewScreen({
  setActive,
  selectedOutlet,
  analytics,
  bills,
  tables,
  orders,
  outlets,
  setSelectedTableId,
  setOrderType,
  setActiveReceipt,
  setShowReceiptModal,
  handleSelectTable
}) {
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
          <div className="stat-sub">From restaurant_orders table</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon tone-3"><Store size={19} /></div>
          <div className="stat-label">Active Outlets</div>
          <div className="stat-value">{outlets.length}</div>
          <div className="stat-sub">Branches in outlets table</div>
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
              No bills yet in database.
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
