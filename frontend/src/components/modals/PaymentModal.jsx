import React from 'react';
import { Check, CreditCard, DollarSign, QrCode, X } from 'lucide-react';

export default function PaymentModal({
  showPayModal,
  setShowPayModal,
  grandTotal,
  selectedTableId,
  payMethod,
  setPayMethod,
  cashTendered,
  setCashTendered,
  handleCompletePayment
}) {
  if (!showPayModal) return null;

  return (
    <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setShowPayModal(false); }}>
      <div className="modal" style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div>
            <div className="eyebrow">SETTLE BILL</div>
            <h2>Payment & Checkout</h2>
            <p>Total Due: <strong style={{ color: '#176b52', fontSize: '16px' }}>₹{grandTotal}</strong> · Table {selectedTableId}</p>
          </div>
          <button className="icon-button" onClick={() => setShowPayModal(false)}><X size={19} /></button>
        </div>

        {/* Payment Mode Selector */}
        <div className="pay-methods">
          {[
            { id: 'UPI', label: 'UPI / QR', icon: QrCode },
            { id: 'CASH', label: 'Cash', icon: DollarSign },
            { id: 'CARD', label: 'Card', icon: CreditCard },
          ].map(method => {
            const Icon = method.icon;
            return (
              <button
                key={method.id}
                className={`pay-method-btn ${payMethod === method.id ? 'active' : ''}`}
                onClick={() => setPayMethod(method.id)}
              >
                <Icon size={20} />
                <span>{method.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Payment Body */}
        {payMethod === 'UPI' && (
          <div style={{ textAlign: 'center', padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
            <div style={{ display: 'inline-block', padding: '12px', background: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <QrCode size={110} color="#176b52" />
            </div>
            <div style={{ marginTop: '10px', fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>
              Scan with GPay, PhonePe, or Paytm
            </div>
            <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
              UPI ID: <code>tableflow.pos@icici</code>
            </div>
          </div>
        )}

        {payMethod === 'CASH' && (
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#475467', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              Cash Tendered by Customer
              <input
                type="number"
                placeholder={`e.g. ${grandTotal}`}
                value={cashTendered}
                onChange={e => setCashTendered(e.target.value)}
                style={{ padding: '8px 10px', border: '1px solid #dfe5eb', borderRadius: '7px', fontSize: '13px' }}
              />
            </label>
            <div className="tender-quick-pills">
              {[grandTotal, 500, 1000, 2000].filter((v, i, a) => a.indexOf(v) === i && v >= grandTotal).map(val => (
                <button key={val} onClick={() => setCashTendered(String(val))}>
                  ₹{val}
                </button>
              ))}
            </div>

            {parseFloat(cashTendered) >= grandTotal && (
              <div style={{ marginTop: '10px', padding: '10px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '7px', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: '#166534', fontWeight: 600 }}>Change to Return:</span>
                <strong style={{ color: '#15803d', fontSize: '14px' }}>₹{parseFloat(cashTendered) - grandTotal}</strong>
              </div>
            )}
          </div>
        )}

        {payMethod === 'CARD' && (
          <div style={{ textAlign: 'center', padding: '24px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '14px', fontSize: '12px', color: '#64748b' }}>
            <CreditCard size={32} color="#176b52" style={{ marginBottom: '8px' }} />
            <div>Swipe, Insert, or Tap Customer Card on EDC Machine</div>
          </div>
        )}

        <div className="modal-actions">
          <button type="button" className="cancel-btn" onClick={() => setShowPayModal(false)}>Cancel</button>
          <button
            type="button"
            className="primary-btn"
            onClick={handleCompletePayment}
          >
            <Check size={16} /> Confirm Payment & Save to DB
          </button>
        </div>
      </div>
    </div>
  );
}
