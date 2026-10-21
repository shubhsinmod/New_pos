import React, { useState } from 'react';
import { CreditCard, DollarSign, QrCode, Receipt, CheckCircle, ShieldCheck } from 'lucide-react';

export default function BillingScreen({
  bills,
  settlements = [],
  analytics,
  setActive,
  setActiveReceipt,
  setShowReceiptModal
}) {
  const [tab, setTab] = useState('settlements'); // 'settlements' | 'bills'
  return (
    <div>
      <div className="page-heading">
        <div>
          <div className="eyebrow">INVOICES & SETTLEMENTS</div>
          <h1>Billing & Invoices ({bills.length})</h1>
          <p>Complete audit trail of all settled transactions and payment receipts.</p>
        </div>
        <button className="primary-btn" onClick={() => setActive('POS Terminal')}>
          <CreditCard size={16} /> New Bill (POS)
        </button>
      </div>

      {/* Stats banner */}
      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        <div className="stat-card">
          <div className="stat-label">Total Bills</div>
          <div className="stat-value">{bills.length}</div>
          <div className="stat-sub">Settled invoices</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon tone-0"><DollarSign size={18} /></div>
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">₹{(analytics.totalRevenue || 0).toLocaleString('en-IN')}</div>
          <div className="stat-sub">Gross settled revenue</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon tone-1"><QrCode size={18} /></div>
          <div className="stat-label">UPI Revenue</div>
          <div className="stat-value">₹{(analytics.upiRevenue || 0).toLocaleString('en-IN')}</div>
          <div className="stat-sub">Digital settlements</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon tone-2"><CreditCard size={18} /></div>
          <div className="stat-label">Cash Revenue</div>
          <div className="stat-value">₹{(analytics.cashRevenue || 0).toLocaleString('en-IN')}</div>
          <div className="stat-sub">Cash drawer total</div>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          className={`filter-pill ${tab === 'settlements' ? 'active' : ''}`}
          onClick={() => setTab('settlements')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <ShieldCheck size={14} /> Settlements Table ({settlements.length})
        </button>
        <button
          className={`filter-pill ${tab === 'bills' ? 'active' : ''}`}
          onClick={() => setTab('bills')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Receipt size={14} /> Invoices Table ({bills.length})
        </button>
      </div>

      {tab === 'settlements' ? (
        /* Settlements History Table from MSSQL settlements table */
        <div className="data-table-card">
          <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '12px', color: '#64748b' }}>
            Complete audit trail of settled payments, cashier details, tender modes, and transaction references.
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Settlement #</th>
                <th>Bill #</th>
                <th>Settled At</th>
                <th>Table</th>
                <th>Customer</th>
                <th>Payment Mode</th>
                <th>Tendered / Change</th>
                <th>Settled Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {settlements.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                    No settlements recorded in <code>settlements</code> table yet.
                  </td>
                </tr>
              ) : (
                settlements.map(s => (
                  <tr key={s.id || s.settlementNumber}>
                    <td><strong style={{ color: '#0f766e' }}>{s.settlementNumber}</strong></td>
                    <td>{s.billNumber}</td>
                    <td>{s.settledAt ? new Date(s.settledAt).toLocaleString() : 'Recent'}</td>
                    <td><span className="badge-pill outline">{s.tableCode}</span></td>
                    <td>
                      <div><strong>{s.customerName || 'Walk-in'}</strong></div>
                      {s.customerPhone && <div style={{ fontSize: '10px', color: '#64748b' }}>{s.customerPhone}</div>}
                    </td>
                    <td>
                      <span className={`badge-pill ${(s.paymentMode || 'cash').toLowerCase()}`}>
                        {s.paymentMode}
                      </span>
                    </td>
                    <td style={{ fontSize: '11px' }}>
                      {s.paymentMode === 'CASH' && s.cashTendered ? (
                        <>₹{s.cashTendered} / ret ₹{s.changeReturned || 0}</>
                      ) : (
                        <span style={{ color: '#64748b' }}>{s.paymentReference || 'Direct'}</span>
                      )}
                    </td>
                    <td><strong style={{ color: '#15803d', fontSize: '13px' }}>₹{s.totalAmount}</strong></td>
                    <td><span className="badge-pill paid">{s.status || 'COMPLETED'}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Bills History Table */
        <div className="data-table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Date / Time</th>
                <th>Table / Order</th>
                <th>Customer</th>
                <th>Payment Mode</th>
                <th>Subtotal</th>
                <th>Tax</th>
                <th>Grand Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bills.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                    No settled invoices in database yet.
                  </td>
                </tr>
              ) : (
                bills.map(b => (
                  <tr key={b.id}>
                    <td><strong>{b.billNumber || `BILL-${b.id}`}</strong></td>
                    <td>{b.createdAt ? new Date(b.createdAt).toLocaleString() : 'Recent'}</td>
                    <td>{b.tableCode} ({b.orderType})</td>
                    <td>{b.customerName}</td>
                    <td>
                      <span className={`badge-pill ${(b.paymentMode || 'cash').toLowerCase()}`}>
                        {b.paymentMode}
                      </span>
                    </td>
                    <td>₹{b.subtotal}</td>
                    <td>₹{b.tax}</td>
                    <td><strong style={{ color: '#176b52' }}>₹{b.total}</strong></td>
                    <td><span className="badge-pill paid">{b.status}</span></td>
                    <td>
                      <button
                        className="outline-btn"
                        style={{ padding: '4px 8px', fontSize: '10px' }}
                        onClick={() => { setActiveReceipt(b); setShowReceiptModal(true); }}
                      >
                        <Receipt size={12} /> View Bill
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
