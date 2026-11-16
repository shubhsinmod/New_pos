import React, { useState } from 'react';
import PosProductsGrid from './PosProductsGrid';
import PosCartDrawer from './PosCartDrawer';
import OnlineDeliveryHub from '../delivery/OnlineDeliveryHub';

export default function PosTerminal({
  orderType,
  setOrderType,
  selectedTableId,
  setSelectedTableId,
  tables,
  posDietFilter,
  setPosDietFilter,
  posSearch,
  setPosSearch,
  categoryNames,
  posCategory,
  setPosCategory,
  products,
  filteredProducts,
  cart,
  addToCart,
  updateCartQty,
  removeFromCart,
  clearCart,
  cartCustomer,
  setCartCustomer,
  discountPercent,
  setDiscountPercent,
  subtotal,
  discountAmount,
  cgst,
  sgst,
  grandTotal,
  handleSendKOT,
  setShowPayModal,
  handleSelectTable,
  orders,
  setOrders,
  selectedOutlet,
  setNotice,
  setActiveReceipt,
  setShowReceiptModal
}) {
  const [manualPhoneOrder, setManualPhoneOrder] = useState(false);

  const handleSetOrderType = (type) => {
    setOrderType(type);
    if (type !== 'Delivery') {
      setManualPhoneOrder(false);
    }
  };

  // When Delivery tab is selected, show the Live Online Orders Hub by default
  if (orderType === 'Delivery' && !manualPhoneOrder) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
        {/* Top Control Bar with Tabs */}
        <div className="pos-header-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="pos-segmented">
            {['Dine-In', 'Takeaway', 'Delivery'].map(type => (
              <button
                key={type}
                className={`pos-seg-btn ${orderType === type ? 'active' : ''}`}
                onClick={() => handleSetOrderType(type)}
              >
                {type} {type === 'Delivery' && (
                  <span style={{ background: '#dc2626', color: '#ffffff', fontSize: '9px', padding: '1px 5px', borderRadius: '10px' }}>
                    Live
                  </span>
                )}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
              Live Aggregators Hub (Zomato · Swiggy · ONDC)
            </span>
          </div>
        </div>

        {/* Dedicated Online Orders Ingestion Hub */}
        <OnlineDeliveryHub
          orders={orders}
          setOrders={setOrders}
          selectedOutlet={selectedOutlet}
          setNotice={setNotice}
          setActiveReceipt={setActiveReceipt}
          setShowReceiptModal={setShowReceiptModal}
          onSwitchToManualCallOrder={() => setManualPhoneOrder(true)}
        />
      </div>
    );
  }

  return (
    <div className="pos-shell">
      <PosProductsGrid
        orderType={orderType}
        setOrderType={handleSetOrderType}
        selectedTableId={selectedTableId}
        setSelectedTableId={setSelectedTableId}
        handleSelectTable={handleSelectTable}
        tables={tables}
        posDietFilter={posDietFilter}
        setPosDietFilter={setPosDietFilter}
        posSearch={posSearch}
        setPosSearch={setPosSearch}
        categoryNames={categoryNames}
        posCategory={posCategory}
        setPosCategory={setPosCategory}
        products={products}
        filteredProducts={filteredProducts}
        cart={cart}
        addToCart={addToCart}
        updateCartQty={updateCartQty}
      />

      <PosCartDrawer
        orderType={orderType}
        selectedTableId={selectedTableId}
        cart={cart}
        cartCustomer={cartCustomer}
        setCartCustomer={setCartCustomer}
        updateCartQty={updateCartQty}
        removeFromCart={removeFromCart}
        clearCart={clearCart}
        discountPercent={discountPercent}
        setDiscountPercent={setDiscountPercent}
        subtotal={subtotal}
        discountAmount={discountAmount}
        cgst={cgst}
        sgst={sgst}
        grandTotal={grandTotal}
        handleSendKOT={handleSendKOT}
        setShowPayModal={setShowPayModal}
        onSwitchToOnlineHub={() => setManualPhoneOrder(false)}
      />
    </div>
  );
}
