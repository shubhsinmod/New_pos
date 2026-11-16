import React, { useState } from 'react';
import { 
  Check, 
  Clock, 
  Plus, 
  ChefHat, 
  Printer, 
  Flame, 
  Coffee, 
  Utensils, 
  CheckCircle2, 
  AlertCircle,
  Filter
} from 'lucide-react';

export default function OrdersKotScreen({
  orders = [],
  kitchenOrders = [],
  setKitchenOrders,
  setActive,
  handleUpdateOrderStatus,
  handleUpdateKitchenOrderStatus,
  selectedOutlet,
  setNotice
}) {
  const [stationFilter, setStationFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [checkedItems, setCheckedItems] = useState({}); // { `${kotId}_${itemIndex}`: true/false }

  const KANBAN_STAGES = ['In Kitchen', 'Preparing', 'Ready to Serve', 'Completed'];
  const STATIONS = ['All', 'Main Kitchen', 'Tandoor', 'Beverages', 'Dessert'];

  // Filter active tickets for selected outlet
  const currentOutletId = selectedOutlet?.id;
  const rawTickets = (kitchenOrders && kitchenOrders.length > 0) ? kitchenOrders : orders;
  const activeTickets = currentOutletId 
    ? rawTickets.filter(k => !k.outletId || k.outletId === currentOutletId)
    : rawTickets;

  // Filtered tickets
  const filteredTickets = activeTickets.filter(k => {
    if (stationFilter !== 'All') {
      const station = k.station || 'Main Kitchen';
      if (station.toLowerCase() !== stationFilter.toLowerCase()) return false;
    }
    if (typeFilter !== 'All') {
      if (k.orderType !== typeFilter) return false;
    }
    return true;
  });

  const toggleItemChecked = (kotId, idx) => {
    const key = `${kotId}_${idx}`;
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePrintKotSlip = (ticket) => {
    const printWindow = window.open('', '_blank', 'width=380,height=550');
    if (!printWindow) return;

    const items = (ticket.items || []).map(i => `
      <tr>
        <td style="padding: 4px 0; font-size: 13px; font-weight: bold;">${i.name}</td>
        <td style="padding: 4px 0; text-align: right; font-size: 14px; font-weight: 800;">× ${i.qty}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>KOT #${ticket.kotNumber || ticket.orderNumber}</title>
          <style>
            body { font-family: monospace, sans-serif; padding: 14px; font-size: 12px; color: #000; line-height: 1.3; }
            .center { text-align: center; }
            .line { border-top: 1px dashed #000; margin: 8px 0; }
            table { width: 100%; border-collapse: collapse; }
          </style>
        </head>
        <body>
          <div class="center">
            <h2 style="margin: 0; font-size: 18px;">*** KITCHEN ORDER TICKET ***</h2>
            <div style="font-size: 11px; margin-top: 2px;">${selectedOutlet?.name || 'Tableflow POS'}</div>
          </div>
          <div class="line"></div>
          <div><b>KOT No:</b> ${ticket.kotNumber || ticket.orderNumber || 'KOT-' + ticket.id}</div>
          <div><b>Table/Order:</b> ${ticket.tableCode} (${ticket.orderType})</div>
          <div><b>Station:</b> ${ticket.station || 'Main Kitchen'}</div>
          <div><b>Time:</b> ${ticket.createdAt ? new Date(ticket.createdAt).toLocaleTimeString() : new Date().toLocaleTimeString()}</div>
          <div class="line"></div>
          <table>
            <thead>
              <tr style="border-bottom: 1px solid #000;">
                <th style="text-align: left; padding-bottom: 4px;">Item</th>
                <th style="text-align: right; padding-bottom: 4px;">Qty</th>
              </tr>
            </thead>
            <tbody>
              ${items}
            </tbody>
          </table>
          ${ticket.notes ? `
            <div class="line"></div>
            <div><b>Chef Instructions / Notes:</b><br/>${ticket.notes}</div>
          ` : ''}
          <div class="line"></div>
          <div class="center" style="font-size: 10px;">-- Kitchen Copy --</div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleAdvanceStatus = async (ticket, nextStage) => {
    if (handleUpdateKitchenOrderStatus && ticket.kotNumber) {
      await handleUpdateKitchenOrderStatus(ticket.id, nextStage, ticket.prepTimeMinutes || 15);
    } else if (handleUpdateOrderStatus) {
      await handleUpdateOrderStatus(ticket.id, nextStage);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Header */}
      <div className="page-heading">
        <div>
          <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ChefHat size={14} style={{ color: '#176b52' }} />
            <span>KITCHEN DISPLAY SYSTEM (KDS) · LIVE STATION PREP</span>
          </div>
          <h1>Live Kitchen Tickets & KOT ({filteredTickets.length})</h1>
          <p>Real-time chef display and station prep tracking across kitchen stations.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="primary-btn" onClick={() => setActive('POS Terminal')}>
            <Plus size={16} /> New Order (POS)
          </button>
        </div>
      </div>

      {/* Control / Filter Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          background: '#ffffff',
          padding: '12px 16px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}
      >
        {/* Station Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Flame size={13} style={{ color: '#ea580c' }} /> Kitchen Station:
          </span>
          <div style={{ display: 'flex', gap: '4px' }}>
            {STATIONS.map(st => (
              <button
                key={st}
                onClick={() => setStationFilter(st)}
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: '20px',
                  border: '1px solid',
                  cursor: 'pointer',
                  background: stationFilter === st ? '#176b52' : '#f8fafc',
                  color: stationFilter === st ? '#ffffff' : '#475569',
                  borderColor: stationFilter === st ? '#176b52' : '#cbd5e1',
                  transition: 'all 0.15s ease'
                }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Order Type Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Type:
          </span>
          {['All', 'Dine-In', 'Takeaway', 'Delivery'].map(type => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '4px 9px',
                borderRadius: '6px',
                border: '1px solid',
                cursor: 'pointer',
                background: typeFilter === type ? '#0f172a' : '#ffffff',
                color: typeFilter === type ? '#ffffff' : '#64748b',
                borderColor: typeFilter === type ? '#0f172a' : '#e2e8f0'
              }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="orders-kanban">
        {KANBAN_STAGES.map(stage => {
          const stageOrders = filteredTickets.filter(o => o.status === stage);
          const stageColor = stage === 'In Kitchen' ? '#ea580c' : stage === 'Preparing' ? '#0284c7' : stage === 'Ready to Serve' ? '#16a34a' : '#64748b';

          return (
            <div className="kanban-col" key={stage}>
              <div className="kanban-header" style={{ borderLeft: `3px solid ${stageColor}`, paddingLeft: '8px' }}>
                <span style={{ color: stageColor }}>{stage.toUpperCase()}</span>
                <span className="kanban-badge">{stageOrders.length}</span>
              </div>

              {stageOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 10px', color: '#94a3b8', fontSize: '12px' }}>
                  No tickets in {stage}
                </div>
              ) : (
                stageOrders.map(ticket => {
                  const items = ticket.items || [];
                  const timeFormatted = ticket.createdAt 
                    ? new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                    : 'Active';

                  return (
                    <div className="kot-card" key={ticket.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {/* Ticket Top Info */}
                      <div className="kot-top" style={{ marginBottom: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="kot-id" style={{ background: '#f1f5f9', color: '#0f172a', fontWeight: 800 }}>
                            {ticket.kotNumber || ticket.orderNumber || `KOT-${ticket.id}`}
                          </span>
                          <span style={{ fontSize: '10px', color: '#64748b', background: '#f8fafc', padding: '2px 5px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                            {ticket.station || 'Main Kitchen'}
                          </span>
                        </div>
                        <span className="kot-time">
                          <Clock size={11} /> {timeFormatted}
                        </span>
                      </div>

                      {/* Table / Order Channel */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="kot-table" style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                          {ticket.tableCode}
                        </span>
                        <span
                          className="badge-pill"
                          style={{
                            fontSize: '9px',
                            fontWeight: 700,
                            background: ticket.orderType === 'Delivery' ? '#0284c7' : ticket.orderType === 'Takeaway' ? '#ea580c' : '#176b52',
                            color: '#ffffff',
                            padding: '2px 7px',
                            borderRadius: '10px'
                          }}
                        >
                          {ticket.orderType}
                        </span>
                      </div>

                      {/* Interactive Item Check-off List */}
                      <div className="kot-items-list" style={{ background: '#f8fafc', padding: '8px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                        {items.length === 0 ? (
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Order items in preparation</div>
                        ) : (
                          items.map((item, idx) => {
                            const isChecked = checkedItems[`${ticket.id}_${idx}`] || false;
                            return (
                              <div
                                key={idx}
                                onClick={() => toggleItemChecked(ticket.id, idx)}
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  padding: '4px 2px',
                                  cursor: 'pointer',
                                  textDecoration: isChecked ? 'line-through' : 'none',
                                  color: isChecked ? '#94a3b8' : '#0f172a',
                                  fontSize: '12px'
                                }}
                              >
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {}}
                                    style={{ cursor: 'pointer', accentColor: '#176b52' }}
                                  />
                                  <span style={{ fontWeight: 600 }}>{item.name}</span>
                                </span>
                                <b style={{ fontSize: '13px', color: isChecked ? '#94a3b8' : '#dc2626' }}>
                                  × {item.qty}
                                </b>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Notes / Special Instructions */}
                      {ticket.notes && (
                        <div
                          style={{
                            fontSize: '10px',
                            color: ticket.orderType === 'Delivery' ? '#0369a1' : '#854d0e',
                            background: ticket.orderType === 'Delivery' ? '#f0f9ff' : '#fef9c3',
                            border: ticket.orderType === 'Delivery' ? '1px solid #bae6fd' : '1px solid #fef08a',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            lineHeight: 1.3
                          }}
                        >
                          <b>{ticket.orderType === 'Delivery' ? '🛵 Delivery & Instructions:' : 'Special Instruction:'}</b> {ticket.notes}
                        </div>
                      )}

                      {/* Actions Bar */}
                      <div className="kot-actions" style={{ marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button
                          onClick={() => handlePrintKotSlip(ticket)}
                          style={{
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#475569',
                            padding: '4px 7px',
                            borderRadius: '6px',
                            fontSize: '10px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title="Print Thermal KOT Ticket"
                        >
                          <Printer size={12} /> Slip
                        </button>

                        <div style={{ display: 'flex', gap: '6px' }}>
                          {stage === 'In Kitchen' && (
                            <button
                              className="outline-btn"
                              style={{ padding: '4px 10px', fontSize: '10px', fontWeight: 700 }}
                              onClick={() => handleAdvanceStatus(ticket, 'Preparing')}
                            >
                              Start Cooking
                            </button>
                          )}
                          {stage === 'Preparing' && (
                            <button
                              className="primary-btn"
                              style={{ padding: '4px 10px', fontSize: '10px', fontWeight: 700, background: '#0284c7' }}
                              onClick={() => handleAdvanceStatus(ticket, 'Ready to Serve')}
                            >
                              Mark Ready
                            </button>
                          )}
                          {stage === 'Ready to Serve' && (
                            <button
                              className="primary-btn"
                              style={{ padding: '4px 10px', fontSize: '10px', fontWeight: 700, background: '#16a34a' }}
                              onClick={() => handleAdvanceStatus(ticket, 'Completed')}
                            >
                              Served / Done
                            </button>
                          )}
                          {stage === 'Completed' && (
                            <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle2 size={13} /> Completed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
