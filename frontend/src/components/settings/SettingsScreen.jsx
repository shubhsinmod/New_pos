import React from 'react';

export default function SettingsScreen({ setNotice }) {
  return (
    <div style={{ maxWidth: '800px' }}>
      <div className="page-heading">
        <div>
          <div className="eyebrow">SYSTEM & PRINTER PREFERENCES</div>
          <h1>POS Configuration</h1>
          <p>Tax rates, thermal printer, and invoice header setup.</p>
        </div>
        <button className="primary-btn" onClick={() => setNotice('Settings saved.')}>
          Save Settings
        </button>
      </div>

      <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="form-two">
          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', fontWeight: 700 }}>
            Restaurant Brand Name
            <input defaultValue="Tableflow Bistro & Bar" style={{ padding: '8px', border: '1px solid #dfe5eb', borderRadius: '7px' }} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', fontWeight: 700 }}>
            Default Currency Symbol
            <input defaultValue="₹ (INR)" style={{ padding: '8px', border: '1px solid #dfe5eb', borderRadius: '7px' }} />
          </label>
        </div>

        <div className="form-two">
          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', fontWeight: 700 }}>
            CGST Rate (%)
            <input defaultValue="2.5" type="number" step="0.1" style={{ padding: '8px', border: '1px solid #dfe5eb', borderRadius: '7px' }} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', fontWeight: 700 }}>
            SGST Rate (%)
            <input defaultValue="2.5" type="number" step="0.1" style={{ padding: '8px', border: '1px solid #dfe5eb', borderRadius: '7px' }} />
          </label>
        </div>

        <div className="form-two">
          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', fontWeight: 700 }}>
            Thermal Receipt Paper Size
            <select style={{ padding: '8px', border: '1px solid #dfe5eb', borderRadius: '7px' }}>
              <option>80mm (Standard POS Printer)</option>
              <option>58mm (Compact Printer)</option>
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', fontWeight: 700 }}>
            KOT Auto-Print
            <select style={{ padding: '8px', border: '1px solid #dfe5eb', borderRadius: '7px' }}>
              <option>Enabled (Print on order placement)</option>
              <option>Manual confirmation</option>
            </select>
          </label>
        </div>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', fontWeight: 700 }}>
          Invoice Footer Text
          <textarea
            rows="2"
            defaultValue="Thank you for dining with us! Please visit again. Follow us on Instagram @tableflow"
            style={{ padding: '8px', border: '1px solid #dfe5eb', borderRadius: '7px' }}
          />
        </label>
      </div>
    </div>
  );
}
