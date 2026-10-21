import React from 'react';

export default function ReportsScreen({
  analytics,
  bills,
  tables,
  customers,
  products,
  setNotice
}) {
  return (
    <div>
      <div className="page-heading">
        <div>
          <div className="eyebrow">SALES ANALYTICS</div>
          <h1>Sales & Performance Reports</h1>
          <p>Real-time analytics and revenue breakdown.</p>
        </div>
        <button className="outline-btn" onClick={() => setNotice('Report exported.')}>
          Export Report
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Net Sales Today</div>
          <div className="stat-value">₹{(analytics.totalRevenue || 0).toLocaleString('en-IN')}</div>
          <div className="stat-sub">Gross revenue</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Average Order Value</div>
          <div className="stat-value">₹{analytics.averageOrderValue || 0}</div>
          <div className="stat-sub">Across {analytics.totalBills || bills.length} bills</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Tables</div>
          <div className="stat-value">{analytics.totalTables || tables.length}</div>
          <div className="stat-sub">{analytics.occupiedTables || 0} currently occupied</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Customers</div>
          <div className="stat-value">{customers.length}</div>
          <div className="stat-sub">Registered guests</div>
        </div>
      </div>

      <div className="report-grid">
        {/* Products in DB */}
        <div className="panel">
          <div className="panel-heading">
            <div>
              <h3>Menu Catalog Overview</h3>
              <p>Dishes registered in system.</p>
            </div>
          </div>

          {products.slice(0, 5).map(p => (
            <div className="report-bar-row" key={p.id}>
              <div className="report-bar-meta">
                <span>{p.name} ({p.category})</span>
                <strong style={{ color: '#176b52' }}>₹{p.price}</strong>
              </div>
              <div className="report-bar-track">
                <div className="report-bar-fill" style={{ width: `${Math.min(100, (p.price / 400) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Payment Breakdown from DB */}
        <div className="panel">
          <div className="panel-heading">
            <div>
              <h3>Payment Modes Breakdown</h3>
              <p>Live settlements.</p>
            </div>
          </div>

          {[
            { mode: 'UPI / Dynamic QR', amount: `₹${(analytics.upiRevenue || 0).toLocaleString('en-IN')}`, color: '#0284c7' },
            { mode: 'Cash Counter', amount: `₹${(analytics.cashRevenue || 0).toLocaleString('en-IN')}`, color: '#eab308' },
            { mode: 'Credit / Debit Card', amount: `₹${(analytics.cardRevenue || 0).toLocaleString('en-IN')}`, color: '#8b5cf6' },
          ].map(pay => (
            <div className="report-bar-row" key={pay.mode}>
              <div className="report-bar-meta">
                <span>{pay.mode}</span>
                <span>{pay.amount}</span>
              </div>
              <div className="report-bar-track">
                <div className="report-bar-fill" style={{ width: '100%', background: pay.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
