import React from 'react';
import { Printer, X } from 'lucide-react';

export default function ReceiptModal({
  showReceiptModal,
  setShowReceiptModal,
  activeReceipt,
  selectedOutlet,
  setNotice
}) {
  if (!showReceiptModal || !activeReceipt) return null;

  // Normalize items array
  const items = Array.isArray(activeReceipt.items)
    ? activeReceipt.items
    : typeof activeReceipt.itemsJson === 'string'
    ? JSON.parse(activeReceipt.itemsJson || '[]')
    : [];

  const outletName = activeReceipt.outletName || selectedOutlet?.name || 'Tableflow POS';
  const outletAddress = activeReceipt.outletAddress || selectedOutlet?.address || '';
  const gstin = activeReceipt.gstin || selectedOutlet?.gstin || '29ABCDE1234F1Z5';
  const billNum = activeReceipt.billNumber || activeReceipt.id;
  const billDate = activeReceipt.createdAt ? new Date(activeReceipt.createdAt).toLocaleDateString() : new Date().toLocaleDateString();
  const billTime = activeReceipt.createdAt ? new Date(activeReceipt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const table = activeReceipt.tableCode || activeReceipt.table || 'Counter';
  const guest = activeReceipt.customerName || activeReceipt.customer || 'Walk-in Guest';
  const mode = activeReceipt.paymentMode || activeReceipt.mode || 'CASH';
  const subtotal = activeReceipt.subtotal || 0;
  const discount = activeReceipt.discount || 0;
  const tax = activeReceipt.tax || 0;
  const halfTax = tax ? Math.round((tax / 2) * 100) / 100 : 0;
  const total = activeReceipt.total || activeReceipt.totalAmount || 0;

  // Direct Thermal Printing for Posiflex PP8000 & 80mm printers via isolated iframe
  const handlePrint = () => {
    try {
      let iframe = document.getElementById('thermal-print-iframe');
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'thermal-print-iframe';
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);
      }

      const itemsHtml = items.map(it => {
        const unitPrice = it.price || (it.qty ? Math.round(total / it.qty) : 0);
        const itemTotal = it.qty * unitPrice;
        return `
          <div style="display:flex; justify-content:space-between; margin:3px 0; font-size:11px;">
            <span style="max-width:130px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; text-align:left;">${it.name}</span>
            <span>${it.qty} x ${unitPrice}</span>
            <span style="text-align:right;">₹${itemTotal}</span>
          </div>
        `;
      }).join('');

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Bill #${billNum}</title>
            <style>
              @page {
                size: 80mm auto;
                margin: 0mm;
              }
              * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
              }
              body {
                width: 76mm;
                max-width: 76mm;
                margin: 0 auto;
                padding: 4mm 2mm;
                font-family: 'Courier New', Courier, monospace;
                font-size: 11px;
                line-height: 1.3;
                color: #000000;
                background: #ffffff;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .center { text-align: center; }
              .header {
                text-align: center;
                border-bottom: 1px dashed #000;
                padding-bottom: 6px;
                margin-bottom: 6px;
              }
              .header h3 {
                font-size: 15px;
                font-weight: 800;
                margin-bottom: 3px;
                letter-spacing: 0.5px;
              }
              .header div {
                font-size: 10px;
              }
              .row {
                display: flex;
                justify-content: space-between;
                margin: 3px 0;
                font-size: 11px;
              }
              .table {
                border-top: 1px dashed #000;
                border-bottom: 1px dashed #000;
                padding: 5px 0;
                margin: 6px 0;
              }
              .table-header {
                display: flex;
                justify-content: space-between;
                font-weight: bold;
                margin-bottom: 4px;
                font-size: 11px;
              }
              .total-row {
                border-top: 1px dashed #000;
                border-bottom: 1px dashed #000;
                padding: 6px 0;
                margin: 6px 0;
                font-weight: 800;
                font-size: 13px;
                display: flex;
                justify-content: space-between;
              }
              .footer {
                text-align: center;
                border-top: 1px dashed #000;
                margin-top: 8px;
                padding-top: 6px;
                font-size: 10px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h3>${outletName}</h3>
              <div>${outletAddress}</div>
              <div>GSTIN: ${gstin}</div>
            </div>

            <div class="row">
              <span>Bill #: ${billNum}</span>
              <span>Date: ${billDate}</span>
            </div>
            <div class="row">
              <span>Table: ${table}</span>
              <span>Time: ${billTime}</span>
            </div>
            <div class="row">
              <span>Guest: ${guest}</span>
              <span>Mode: ${mode}</span>
            </div>

            <div class="table">
              <div class="table-header">
                <span>ITEM</span>
                <span>QTY x PRICE</span>
                <span>AMOUNT</span>
              </div>
              ${itemsHtml}
            </div>

            <div class="row">
              <span>Subtotal</span>
              <span>₹${subtotal}</span>
            </div>
            ${discount > 0 ? `
              <div class="row">
                <span>Discount</span>
                <span>- ₹${discount}</span>
              </div>
            ` : ''}
            <div class="row">
              <span>CGST (2.5%)</span>
              <span>₹${halfTax}</span>
            </div>
            <div class="row">
              <span>SGST (2.5%)</span>
              <span>₹${halfTax}</span>
            </div>

            <div class="total-row">
              <span>NET TOTAL</span>
              <span>₹${total}</span>
            </div>

            <div class="footer">
              <p>*** PAID VIA ${mode} ***</p>
              <p style="margin-top: 3px;">Thank you for dining with us! Have a great day.</p>
            </div>
          </body>
        </html>
      `;

      const frameDoc = iframe.contentWindow.document;
      frameDoc.open();
      frameDoc.write(htmlContent);
      frameDoc.close();

      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        if (setNotice) setNotice('Receipt sent to Posiflex PP8000 thermal printer.');
      }, 250);
    } catch (err) {
      console.warn('Iframe print failed, falling back to window.print():', err);
      window.print();
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setShowReceiptModal(false); }}>
      <div className="modal" style={{ maxWidth: '380px' }}>
        <div className="modal-header">
          <div>
            <div className="eyebrow">PRINT PREVIEW</div>
            <h2>Tax Invoice Receipt</h2>
          </div>
          <button className="icon-button" onClick={() => setShowReceiptModal(false)}><X size={19} /></button>
        </div>

        {/* Paper Receipt Simulation */}
        <div className="receipt-paper">
          <div className="receipt-header">
            <h4>{outletName}</h4>
            <div style={{ fontSize: '10px', color: '#475569' }}>{outletAddress}</div>
            <div style={{ fontSize: '10px', color: '#475569' }}>GSTIN: {gstin}</div>
          </div>

          <div className="receipt-row">
            <span>Bill #: {billNum}</span>
            <span>Date: {billDate}</span>
          </div>
          <div className="receipt-row">
            <span>Table: {table}</span>
            <span>Time: {billTime}</span>
          </div>
          <div className="receipt-row">
            <span>Guest: {guest}</span>
            <span>Mode: {mode}</span>
          </div>

          <div className="receipt-items-table">
            <div className="receipt-row" style={{ fontWeight: 'bold', marginBottom: '4px' }}>
              <span>ITEM</span>
              <span>QTY × PRICE</span>
              <span>AMOUNT</span>
            </div>
            {items.map((it, idx) => (
              <div className="receipt-row" key={idx}>
                <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.name}</span>
                <span>{it.qty} × ₹{it.price || Math.round(total / (items.length || 1))}</span>
                <span>₹{it.qty * (it.price || Math.round(total / (items.length || 1)))}</span>
              </div>
            ))}
          </div>

          <div className="receipt-row">
            <span>Subtotal</span>
            <span>₹${subtotal}</span>
          </div>
          {discount > 0 && (
            <div className="receipt-row">
              <span>Discount</span>
              <span>− ₹{discount}</span>
            </div>
          )}
          <div className="receipt-row">
            <span>CGST (2.5%)</span>
            <span>₹{halfTax}</span>
          </div>
          <div className="receipt-row">
            <span>SGST (2.5%)</span>
            <span>₹{halfTax}</span>
          </div>

          <div className="receipt-row" style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '6px 0', margin: '6px 0', fontWeight: 'bold', fontSize: '13px' }}>
            <span>NET TOTAL</span>
            <span>₹{total}</span>
          </div>

          <div className="receipt-footer">
            <p style={{ margin: '4px 0' }}>*** PAID VIA {mode} ***</p>
            <p style={{ margin: '4px 0' }}>Thank you for dining with us! Have a great day.</p>
          </div>
        </div>

        <div className="modal-actions" style={{ marginTop: '16px' }}>
          <button type="button" className="cancel-btn" onClick={() => setShowReceiptModal(false)}>Close</button>
          <button
            type="button"
            className="primary-btn"
            onClick={handlePrint}
          >
            <Printer size={15} /> Print Thermal Bill
          </button>
        </div>
      </div>
    </div>
  );
}
