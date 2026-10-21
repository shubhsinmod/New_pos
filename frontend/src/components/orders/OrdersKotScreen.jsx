import React from 'react';
import { Check, Clock, Plus } from 'lucide-react';

export default function OrdersKotScreen({
  orders,
  setActive,
  handleUpdateOrderStatus
}) {
  const KANBAN_STAGES = ['In Kitchen', 'Preparing', 'Ready to Serve', 'Completed'];

  return (
    <div>
      <div className="page-heading">
        <div>
          <div className="eyebrow">KITCHEN DISPLAY (KDS)</div>
          <h1>Live Orders & KOT ({orders.length})</h1>
          <p>Real-time kitchen order tickets and preparation status.</p>
        </div>
        <button className="primary-btn" onClick={() => setActive('POS Terminal')}>
          <Plus size={16} /> New Order (POS)
        </button>
      </div>

      <div className="orders-kanban">
        {KANBAN_STAGES.map(stage => {
          const stageOrders = orders.filter(o => o.status === stage);
          return (
            <div className="kanban-col" key={stage}>
              <div className="kanban-header">
                <span>{stage.toUpperCase()}</span>
                <span className="kanban-badge">{stageOrders.length}</span>
              </div>

              {stageOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8', fontSize: '11px' }}>
                  No orders in {stage}
                </div>
              ) : (
                stageOrders.map(o => (
                  <div className="kot-card" key={o.id}>
                    <div className="kot-top">
                      <span className="kot-id">{o.orderNumber || `ORD-${o.id}`}</span>
                      <span className="kot-time">
                        <Clock size={11} />{' '}
                        {o.createdAt ? new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="kot-table">{o.tableCode}</span>
                      <span className="badge-pill paid" style={{ fontSize: '9px' }}>{o.orderType}</span>
                    </div>

                    <div className="kot-items-list">
                      {(o.items || []).map((item, idx) => (
                        <div className="kot-item" key={idx}>
                          <span>{item.name}</span>
                          <b>× {item.qty}</b>
                        </div>
                      ))}
                    </div>

                    {o.notes && (
                      <div style={{ fontSize: '10px', color: '#854d0e', background: '#fef9c3', padding: '4px 6px', borderRadius: '4px' }}>
                        Note: {o.notes}
                      </div>
                    )}

                    <div className="kot-actions">
                      {stage === 'In Kitchen' && (
                        <button
                          className="outline-btn"
                          style={{ padding: '4px 8px', fontSize: '10px' }}
                          onClick={() => handleUpdateOrderStatus(o.id, 'Preparing')}
                        >
                          Start Cooking
                        </button>
                      )}
                      {stage === 'Preparing' && (
                        <button
                          className="primary-btn"
                          style={{ padding: '4px 8px', fontSize: '10px' }}
                          onClick={() => handleUpdateOrderStatus(o.id, 'Ready to Serve')}
                        >
                          Mark Ready
                        </button>
                      )}
                      {stage === 'Ready to Serve' && (
                        <button
                          className="primary-btn"
                          style={{ padding: '4px 8px', fontSize: '10px', background: '#16a34a' }}
                          onClick={() => handleUpdateOrderStatus(o.id, 'Completed')}
                        >
                          Served / Done
                        </button>
                      )}
                      {stage === 'Completed' && (
                        <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Check size={12} /> Delivered
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
