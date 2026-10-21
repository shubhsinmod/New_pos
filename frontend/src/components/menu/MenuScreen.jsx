import React from 'react';
import { Plus } from 'lucide-react';

export default function MenuScreen({
  products,
  setShowProductModal,
  handleToggleStock,
  addToCart,
  setActive,
  setNotice
}) {
  return (
    <div>
      <div className="page-heading">
        <div>
          <div className="eyebrow">MENU CATALOG</div>
          <h1>Menu & Products ({products.length})</h1>
          <p>Manage your outlet's dishes, pricing, and stock status.</p>
        </div>
        <button className="primary-btn" onClick={() => setShowProductModal(true)}>
          <Plus size={16} /> Add New Dish
        </button>
      </div>

      {/* Data Table */}
      <div className="data-table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Dish Name</th>
              <th>Category</th>
              <th>Type</th>
              <th>Price</th>
              <th>Stock Status</th>
              <th>Description</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => {
              const isVeg = p.isVeg === true || p.veg === true;
              return (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={isVeg ? 'veg-tag' : 'non-veg-tag'} />
                      <strong>{p.name}</strong>
                    </div>
                  </td>
                  <td>{p.category}</td>
                  <td>
                    <span className={`badge-pill ${isVeg ? 'veg' : 'nonveg'}`}>
                      {isVeg ? 'Veg' : 'Non-Veg'}
                    </span>
                  </td>
                  <td><strong style={{ color: '#176b52' }}>₹{p.price}</strong></td>
                <td>
                  <button
                    style={{
                      border: '1px solid',
                      borderColor: p.inStock ? '#86efac' : '#fca5a5',
                      background: p.inStock ? '#f0fdf4' : '#fef2f2',
                      color: p.inStock ? '#16a34a' : '#dc2626',
                      borderRadius: '20px',
                      padding: '3px 9px',
                      fontSize: '10px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                    onClick={() => handleToggleStock(p.id)}
                  >
                    {p.inStock ? 'In Stock' : 'Sold Out'}
                  </button>
                </td>
                <td style={{ color: '#64748b', maxWidth: '280px' }}>{p.description}</td>
                <td>
                  <button
                    className="outline-btn"
                    style={{ padding: '4px 8px', fontSize: '10px' }}
                    onClick={() => {
                      addToCart(p);
                      setActive('POS Terminal');
                      setNotice(`Added ${p.name} to POS cart.`);
                    }}
                  >
                    Order in POS
                  </button>
                </td>
              </tr>
            );
          })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
