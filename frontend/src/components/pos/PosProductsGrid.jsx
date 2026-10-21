import React from 'react';
import { Coffee, Plus, Search, X } from 'lucide-react';

export default function PosProductsGrid({
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
  handleSelectTable
}) {
  return (
    <div className="pos-main-section">
      {/* Control bar */}
      <div className="pos-header-bar">
        <div className="pos-header-left">
          {/* Order Type Tabs */}
          <div className="pos-segmented">
            {['Dine-In', 'Takeaway', 'Delivery'].map(type => (
              <button
                key={type}
                className={`pos-seg-btn ${orderType === type ? 'active' : ''}`}
                onClick={() => setOrderType(type)}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Table selector for Dine-in */}
          {orderType === 'Dine-In' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>TABLE:</span>
              <select
                className="pos-select-pill"
                value={selectedTableId}
                onChange={e => {
                  if (handleSelectTable) {
                    handleSelectTable(e.target.value);
                  } else {
                    setSelectedTableId(e.target.value);
                  }
                }}
              >
                {tables.map(t => (
                  <option key={t.id} value={t.code}>
                    {t.code} ({t.seats}S - {t.status})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="pos-header-right">
          {/* Veg / Non-Veg Filter */}
          <div className="pos-segmented">
            <button
              className={`pos-seg-btn ${posDietFilter === 'All' ? 'active' : ''}`}
              onClick={() => setPosDietFilter('All')}
            >
              All
            </button>
            <button
              className={`pos-seg-btn ${posDietFilter === 'Veg' ? 'active' : ''}`}
              onClick={() => setPosDietFilter('Veg')}
            >
              <span className="veg-tag" style={{ width: '10px', height: '10px' }} /> Veg
            </button>
            <button
              className={`pos-seg-btn ${posDietFilter === 'NonVeg' ? 'active' : ''}`}
              onClick={() => setPosDietFilter('NonVeg')}
            >
              <span className="non-veg-tag" style={{ width: '10px', height: '10px' }} /> Non-Veg
            </button>
          </div>

          {/* Search box */}
          <div className="search-box" style={{ width: '220px', height: '36px' }}>
            <Search size={15} />
            <input
              placeholder="Search food item..."
              value={posSearch}
              onChange={e => setPosSearch(e.target.value)}
            />
            {posSearch && (
              <button style={{ border: 0, background: 'transparent', padding: 0 }} onClick={() => setPosSearch('')}>
                <X size={14} color="#94a3b8" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Categories Slider from DB */}
      <div className="pos-category-scroll">
        {categoryNames.map(cat => (
          <button
            key={cat}
            className={`pos-cat-pill ${posCategory === cat ? 'active' : ''}`}
            onClick={() => setPosCategory(cat)}
          >
            <span>{cat}</span>
            <span className="badge">
              {cat === 'All' ? products.length : products.filter(p => p.category === cat).length}
            </span>
          </button>
        ))}
      </div>

      {/* Products Grid from DB */}
      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
          <Coffee size={40} style={{ marginBottom: '10px' }} />
          <h4>No menu items found for this outlet</h4>
          <p style={{ fontSize: '11px' }}>Click "Menu & Products" tab to add your first dish.</p>
        </div>
      ) : (
        <div className="pos-product-grid">
          {filteredProducts.map(p => {
            const inCartItem = cart.find(c => c.product.id === p.id);
            const isVeg = p.isVeg === true || p.veg === true;
            return (
              <div
                key={p.id}
                className={`pos-product-card ${inCartItem ? 'in-cart' : ''}`}
                style={{ opacity: p.inStock ? 1 : 0.6 }}
                onClick={() => addToCart(p)}
              >
                <div>
                  <div className="pos-product-top">
                    <span className={isVeg ? 'veg-tag' : 'non-veg-tag'} title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'} />
                    <span className="pos-item-cat">{p.category}</span>
                  </div>
                  <h4 className="pos-item-name">{p.name}</h4>
                  <p className="pos-item-desc">{p.description}</p>
                  {!p.inStock && (
                    <span style={{ fontSize: '9px', fontWeight: 800, color: '#dc2626' }}>[SOLD OUT]</span>
                  )}
                </div>

                <div className="pos-item-bottom">
                  <span className="pos-item-price">₹{p.price}</span>

                  {inCartItem ? (
                    <div className="pos-card-qty" onClick={e => e.stopPropagation()}>
                      <button onClick={() => updateCartQty(p.id, -1)}>−</button>
                      <span>{inCartItem.qty}</span>
                      <button onClick={() => updateCartQty(p.id, 1)}>+</button>
                    </div>
                  ) : (
                    <button className="pos-add-btn" disabled={!p.inStock}>
                      <Plus size={14} /> Add
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
