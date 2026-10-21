import React from 'react';
import { CreditCard, Printer, ShoppingBag, Trash2 } from 'lucide-react';

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
  setShowPayModal
}) {
  const newItemsCount = cart.reduce((sum, item) => sum + Math.max(0, item.qty - (item.kotSentQty || 0)), 0);

  return (
    <div className="pos-cart-panel">
      <div className="cart-header">
        <div className="cart-header-title">
          <h3>Active Order Cart</h3>
          <span>{orderType} {orderType === 'Dine-In' ? `· Table ${selectedTableId}` : ''}</span>
        </div>
        {cart.length > 0 && (
          <button className="cart-clear-btn" onClick={clearCart}>
            Clear
          </button>
        )}
      </div>

      {/* Customer quick capture */}
      <div className="cart-customer-box">
        <input
          placeholder="Customer Name (Optional)"
          value={cartCustomer.name}
          onChange={e => setCartCustomer({ ...cartCustomer, name: e.target.value })}
        />
        <input
          placeholder="Phone (for GST/Bill)"
          value={cartCustomer.phone}
          onChange={e => setCartCustomer({ ...cartCustomer, phone: e.target.value })}
        />
      </div>

      {/* Cart Items List */}
      <div className="cart-items-scroll">
        {cart.length === 0 ? (
          <div className="cart-empty">
            <ShoppingBag size={38} />
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
