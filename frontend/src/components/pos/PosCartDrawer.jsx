import React from 'react';
import { Bike, CreditCard, Printer, ShoppingBag, Trash2 } from 'lucide-react';

export default function PosCartDrawer({
  orderType,
  selectedTableId,
  cart,
  cartCustomer,
  setCartCustomer,
  updateCartQty,
  removeFromCart,
  clearCart,
  discountPercent,
  setDiscountPercent,
  subtotal,
  discountAmount,
  cgst,
  sgst,
  grandTotal,
  handleSendKOT,
  setShowPayModal,
  onSwitchToOnlineHub
}) {
  const newItemsCount = cart.reduce((sum, item) => sum + Math.max(0, item.qty - (item.kotSentQty || 0)), 0);

  return (
    <div className="pos-cart-panel">
      <div className="cart-header">
        <div className="cart-header-title">
          <h3>Active Order Cart</h3>
          <span>
            {orderType === 'Dine-In'
              ? `Dine-In · Table ${selectedTableId}`
              : orderType === 'Delivery'
              ? `Delivery · ${cartCustomer.deliveryPartner || 'Home Delivery'}`
              : 'Takeaway (Parcel)'}
          </span>
        </div>
        {cart.length > 0 && (
          <button className="cart-clear-btn" onClick={clearCart}>
            Clear
          </button>
        )}
      </div>

      {/* Customer quick capture & Delivery details */}
      <div className="cart-customer-box">
        {orderType === 'Delivery' && onSwitchToOnlineHub && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#e0f2fe', padding: '5px 8px', borderRadius: '5px', fontSize: '10px', color: '#0369a1', border: '1px solid #bae6fd', marginBottom: '2px' }}>
            <span>📞 Manual Phone Order</span>
            <button 
              onClick={onSwitchToOnlineHub}
              style={{ border: 0, background: '#0284c7', color: '#fff', padding: '2px 7px', borderRadius: '4px', fontSize: '9px', fontWeight: 700, cursor: 'pointer' }}
            >
              Back to Online Orders
            </button>
          </div>
        )}

        <div className="cart-customer-row">
          <div className="cart-customer-field">
            <label>Customer Name {orderType === 'Delivery' && <span style={{ color: '#dc2626' }}>*</span>}</label>
            <input
              placeholder="e.g. Rahul Sharma"
              value={cartCustomer.name || ''}
              onChange={e => setCartCustomer({ ...cartCustomer, name: e.target.value })}
            />
          </div>
          <div className="cart-customer-field">
            <label>Mobile No. {orderType === 'Delivery' && <span style={{ color: '#dc2626' }}>*</span>}</label>
            <input
              placeholder="e.g. 9876543210"
              value={cartCustomer.phone || ''}
              onChange={e => setCartCustomer({ ...cartCustomer, phone: e.target.value })}
            />
          </div>
        </div>

        {orderType === 'Delivery' && (
          <div
            className="cart-delivery-box"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              background: '#f0fdf4',
              padding: '8px 10px',
              borderRadius: '6px',
              border: '1px solid #bbf7d0'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#166534', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Bike size={13} /> Delivery Partner:
              </span>
              <select
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  border: '1px solid #86efac',
                  background: '#ffffff',
                  color: '#166534',
                  cursor: 'pointer',
                  outline: 'none'
                }}
                value={cartCustomer.deliveryPartner || 'In-House Rider'}
                onChange={e => setCartCustomer({ ...cartCustomer, deliveryPartner: e.target.value })}
              >
                <option value="In-House Rider">🛵 In-House Staff</option>
                <option value="Zomato">🔴 Zomato</option>
                <option value="Swiggy">🟠 Swiggy</option>
                <option value="Dunzo">⚡ Dunzo / Porter</option>
              </select>
            </div>

            <textarea
              rows={2}
              placeholder="Delivery Address (Flat / House No, Street, Landmark)..."
              value={cartCustomer.address || ''}
              onChange={e => setCartCustomer({ ...cartCustomer, address: e.target.value })}
              style={{
                width: '100%',
                border: '1px solid #cbd5e1',
                borderRadius: '5px',
                padding: '6px 8px',
                fontSize: '10px',
                resize: 'none',
                fontFamily: 'inherit',
                outline: 'none',
                boxSizing: 'border-box',
                background: '#ffffff'
              }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <input
                placeholder={cartCustomer.deliveryPartner === 'In-House Rider' ? 'Rider / Boy Name' : 'Order ID / Ref #'}
                value={cartCustomer.riderName || ''}
                onChange={e => setCartCustomer({ ...cartCustomer, riderName: e.target.value })}
                style={{
                  fontSize: '10px',
                  padding: '5px 7px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  background: '#ffffff'
                }}
              />
              <input
                placeholder={cartCustomer.deliveryPartner === 'In-House Rider' ? 'Rider Phone' : 'Special Note'}
                value={cartCustomer.riderPhone || ''}
                onChange={e => setCartCustomer({ ...cartCustomer, riderPhone: e.target.value })}
                style={{
                  fontSize: '10px',
                  padding: '5px 7px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  background: '#ffffff'
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Cart Items List */}
      <div className="cart-items-scroll">
        {cart.length === 0 ? (
          <div className="cart-empty">
            <ShoppingBag size={26} />
            <strong>Order cart is empty</strong>
            <p style={{ margin: 0 }}>Select dishes from the menu to build invoice.</p>
          </div>
        ) : (
          cart.map(item => {
            const sentQty = item.kotSentQty || 0;
            const newQty = Math.max(0, item.qty - sentQty);
            return (
              <div className="cart-item-row" key={item.product.id} style={{ borderColor: newQty > 0 ? '#fed7aa' : '#f1f5f9' }}>
                <div className="cart-item-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span className={item.product.isVeg ? 'veg-tag' : 'non-veg-tag'} style={{ width: '10px', height: '10px' }} />
                    <strong className="cart-item-title">{item.product.name}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px' }}>
                    <span className="cart-item-price">₹{item.product.price} × {item.qty}</span>
                    {sentQty > 0 && (
                      <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '9px', background: '#dcfce7', padding: '1px 5px', borderRadius: '4px' }}>
                        ✓ Kitchen: {sentQty}
                      </span>
                    )}
                    {newQty > 0 && (
                      <span style={{ color: '#c2410c', fontWeight: 700, fontSize: '9px', background: '#ffedd5', padding: '1px 5px', borderRadius: '4px' }}>
                        +{newQty} New
                      </span>
                    )}
                  </div>
                </div>

                <div className="cart-qty-box">
                  <button className="cart-qty-btn" onClick={() => updateCartQty(item.product.id, -1)}>−</button>
                  <span className="cart-qty-val">{item.qty}</span>
                  <button className="cart-qty-btn" onClick={() => updateCartQty(item.product.id, 1)}>+</button>
                </div>

                <span className="cart-item-total">₹{item.product.price * item.qty}</span>

                <button className="cart-delete-btn" onClick={() => removeFromCart(item.product.id)}>
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Cart Billing Summary & Controls */}
      <div className="cart-summary-section">
        <div className="cart-summary-row">
          <span>Subtotal</span>
          <span>₹{subtotal}</span>
        </div>

        <div className="cart-summary-row" style={{ alignItems: 'center' }}>
          <span>Discount</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[0, 5, 10].map(disc => (
              <button
                key={disc}
                style={{
                  border: '1px solid #cbd5e1',
                  background: discountPercent === disc ? '#176b52' : '#ffffff',
                  color: discountPercent === disc ? '#ffffff' : '#475569',
                  borderRadius: '4px',
                  padding: '2px 6px',
                  fontSize: '9px',
                  fontWeight: 700
                }}
                onClick={() => setDiscountPercent(disc)}
              >
                {disc === 0 ? 'None' : `${disc}%`}
              </button>
            ))}
          </div>
        </div>

        {discountAmount > 0 && (
          <div className="cart-summary-row" style={{ color: '#16a34a' }}>
            <span>Discount ({discountPercent}%)</span>
            <span>− ₹{discountAmount}</span>
          </div>
        )}

        <div className="cart-summary-row">
          <span>CGST (2.5%)</span>
          <span>₹{cgst}</span>
        </div>
        <div className="cart-summary-row">
          <span>SGST (2.5%)</span>
          <span>₹{sgst}</span>
        </div>

        <div className="cart-summary-row total">
          <span>Grand Total</span>
          <span>₹{grandTotal}</span>
        </div>

        <div className="cart-actions-row">
          <button
            className="btn-kot"
            disabled={cart.length === 0 || newItemsCount === 0}
            onClick={handleSendKOT}
            title={newItemsCount === 0 ? 'All items in cart have already been sent to kitchen' : 'Send only newly added items to kitchen'}
          >
            <Printer size={15} /> {newItemsCount > 0 ? `KOT Print (${newItemsCount} New)` : 'All KOT Sent ✓'}
          </button>

          <button
            className="btn-pay"
            disabled={cart.length === 0}
            onClick={() => setShowPayModal(true)}
          >
            <CreditCard size={15} /> Pay ₹{grandTotal}
          </button>
        </div>
      </div>
    </div>
  );
}
