import React, { useState } from 'react';
import { CreditCard, DollarSign, QrCode, Receipt, CheckCircle, ShieldCheck } from 'lucide-react';

export default function BillingScreen({
  bills = [],
  settlements = [],
  analytics = {},
  setActive,
  setActiveReceipt,
  setShowReceiptModal
}) {
  const [tab, setTab] = useState('settlements'); // 'settlements' | 'bills'

  // Accurately compute live metrics based on available records
  const totalBillsCount = Math.max(bills.length, settlements.length, analytics.totalBills || 0);

  const totalRevenue = settlements.length > 0
    ? settlements.reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0)
    : (analytics.totalRevenue || bills.reduce((sum, b) => sum + (Number(b.total) || 0), 0));

  const upiRevenue = settlements.length > 0
    ? settlements.filter(s => String(s.paymentMode || '').toUpperCase() === 'UPI').reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0)
    : (analytics.upiRevenue || bills.filter(b => String(b.paymentMode || '').toUpperCase() === 'UPI').reduce((sum, b) => sum + (Number(b.total) || 0), 0));

  const cashRevenue = settlements.length > 0
    ? settlements.filter(s => String(s.paymentMode || '').toUpperCase() === 'CASH').reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0)
    : (analytics.cashRevenue || bills.filter(b => String(b.paymentMode || '').toUpperCase() === 'CASH').reduce((sum, b) => sum + (Number(b.total) || 0), 0));

  return (
    <div>
      <div className="page-heading">
        <div>
          <div className="eyebrow">INVOICES & SETTLEMENTS</div>
          <h1>Billing & Invoices ({totalBillsCount})</h1>
          <p>Complete audit trail of all settled transactions and payment receipts.</p>
        </div>
        <button className="primary-btn" onClick={() => setActive('POS Terminal')}>
          <CreditCard size={16} /> New Bill (POS)
        </button>
      </div>

      {/* Stats banner */}
      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        <div className="stat-card">
          <div className="stat-icon tone-3"><Receipt size={18} /></div>
          <div className="stat-label">Total Bills</div>
          <div className="stat-value">{totalBillsCount}</div>
          <div className="stat-sub">Settled invoices</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon tone-0"><DollarSign size={18} /></div>
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">₹{Math.round(totalRevenue).toLocaleString('en-IN')}</div>
          <div className="stat-sub">Gross settled revenue</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon tone-1"><QrCode size={18} /></div>
          <div className="stat-label">UPI Revenue</div>
          <div className="stat-value">₹{Math.round(upiRevenue).toLocaleString('en-IN')}</div>
          <div className="stat-sub">Digital settlements</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon tone-2"><CreditCard size={18} /></div>
          <div className="stat-label">Cash Revenue</div>
          <div className="stat-value">₹{Math.round(cashRevenue).toLocaleString('en-IN')}</div>
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
                <th>SETTLEMENT #</th>
                <th>BILL #</th>
                <th>SETTLED AT</th>
                <th>TABLE</th>
                <th>CUSTOMER</th>
                <th>PAYMENT MODE</th>
                <th>TENDERED / CHANGE</th>
                <th>SETTLED AMOUNT</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {settlements.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                    No settled transactions recorded yet. Complete an order in POS Terminal to generate a settlement audit.
                  </td>
                </tr>
              ) : (
                settlements.map(s => {
                  const dateStr = s.settledAt ? new Date(s.settledAt).toLocaleString('en-GB') : 'Just now';
                  return (
                    <tr key={s.id || s.settlementNumber}>
                      <td><strong style={{ color: '#176b52' }}>{s.settlementNumber}</strong></td>
                      <td>{s.billNumber}</td>
                      <td style={{ fontSize: '11px', color: '#64748b' }}>{dateStr}</td>
                      <td><span className="badge-pill table-badge">{s.tableCode}</span></td>
                      <td><strong>{s.customerName || 'Walk-in Guest'}</strong></td>
                      <td>
                        <span className={`badge-pill ${s.paymentMode === 'UPI' ? 'upi-badge' : s.paymentMode === 'CASH' ? 'cash-badge' : 'card-badge'}`}>
                          {s.paymentMode}
                        </span>
                      </td>
                      <td style={{ fontSize: '11px', color: '#475569' }}>
                        ₹{s.cashTendered || s.totalAmount} / <span style={{ color: '#64748b' }}>ret ₹{s.changeReturned || 0}</span>
                      </td>
                      <td><strong style={{ color: '#16a34a' }}>₹{s.totalAmount}</strong></td>
                      <td>
                        <span className="badge-pill success">
                          <CheckCircle size={10} style={{ display: 'inline', marginRight: '3px' }} />
                          {s.status || 'COMPLETED'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Bills / Tax Invoices Table */
        <div className="data-table-card">
          <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '12px', color: '#64748b' }}>
            Tax invoices recorded in MSSQL database for this outlet.
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>INVOICE #</th>
                <th>TABLE</th>
                <th>CUSTOMER</th>
                <th>ITEMS</th>
                <th>SUBTOTAL</th>
                <th>TAX</th>
                <th>TOTAL</th>
                <th>MODE</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {bills.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                    No invoices generated yet for this branch.
                  </td>
                </tr>
              ) : (
                bills.map(b => (
                  <tr key={b.id || b.billNumber}>
                    <td><strong style={{ color: '#176b52' }}>{b.billNumber}</strong></td>
                    <td><span className="badge-pill table-badge">{b.tableCode}</span></td>
                    <td><strong>{b.customerName || 'Walk-in Guest'}</strong></td>
                    <td>{b.itemsCount || (b.items ? b.items.length : 1)} Items</td>
                    <td>₹{b.subtotal}</td>
                    <td>₹{b.tax}</td>
                    <td><strong style={{ color: '#16a34a' }}>₹{b.total}</strong></td>
                    <td>
                      <span className={`badge-pill ${b.paymentMode === 'UPI' ? 'upi-badge' : b.paymentMode === 'CASH' ? 'cash-badge' : 'card-badge'}`}>
                        {b.paymentMode}
                      </span>
                    </td>
                    <td>
                      <button
                        className="outline-btn"
                        style={{ padding: '4px 8px', fontSize: '10px' }}
                        onClick={() => {
                          setActiveReceipt({
                            billNumber: b.billNumber,
                            orderNumber: b.orderNumber,
                            tableCode: b.tableCode,
                            orderType: b.orderType,
                            customerName: b.customerName,
                            customerPhone: b.customerPhone,
                            subtotal: b.subtotal,
                            discount: b.discount,
                            tax: b.tax,
                            total: b.total,
                            paymentMode: b.paymentMode,
                            items: b.items || []
                          });
                          setShowReceiptModal(true);
                        }}
                      >
                        <Receipt size={12} style={{ display: 'inline', marginRight: '4px' }} />
                        Receipt
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
