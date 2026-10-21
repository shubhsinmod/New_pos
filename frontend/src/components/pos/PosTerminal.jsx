import React from 'react';
import PosProductsGrid from './PosProductsGrid';
import PosCartDrawer from './PosCartDrawer';

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
  handleSelectTable
}) {
  return (
    <div className="pos-shell">
      <PosProductsGrid
        orderType={orderType}
        setOrderType={setOrderType}
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
      />
    </div>
  );
}
