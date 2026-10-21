import React from 'react';
import { Plus, X } from 'lucide-react';

export default function AddProductModal({
  showProductModal,
  setShowProductModal,
  handleAddProduct,
  newProduct,
  setNewProduct,
  categories
}) {
  if (!showProductModal) return null;

  return (
    <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setShowProductModal(false); }}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <div className="eyebrow">MENU CATALOG</div>
            <h2>Add New Food Dish</h2>
            <p>Add a new dish to your outlet menu.</p>
          </div>
          <button className="icon-button" onClick={() => setShowProductModal(false)} title="Close"><X size={18} /></button>
        </div>

        <form onSubmit={handleAddProduct}>
          <label>
            <div className="label-text">
              <span>Dish Name</span>
              <span className="req">*</span>
            </div>
            <input
              required
              placeholder="e.g. Crispy Paneer Fingers"
              value={newProduct.name}
              onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
            />
          </label>

          <div className="form-two">
            <label>
              <div className="label-text">
                <span>Category</span>
                <span className="req">*</span>
              </div>
              <select
                value={newProduct.category}
                onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
              >
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </label>

            <label>
              <div className="label-text">
                <span>Price (₹)</span>
                <span className="req">*</span>
              </div>
              <input
                required
                type="number"
                step="1"
                placeholder="250"
                value={newProduct.price}
                onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
              />
            </label>
          </div>

          <div>
            <div className="label-text" style={{ marginBottom: '6px' }}>Dietary Type</div>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <label className="radio-label">
                <input
                  type="radio"
                  name="isVeg"
                  checked={newProduct.isVeg}
                  onChange={() => setNewProduct({ ...newProduct, isVeg: true })}
                />
                <span className="veg-tag" />
                <span>Vegetarian</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="isVeg"
                  checked={!newProduct.isVeg}
                  onChange={() => setNewProduct({ ...newProduct, isVeg: false })}
                />
                <span className="non-veg-tag" />
                <span>Non-Vegetarian</span>
              </label>
            </div>
          </div>

          <label>
            <div className="label-text">
              <span>Description</span>
              <span className="optional">OPTIONAL</span>
            </div>
            <textarea
              rows="2"
              placeholder="Preparation notes, ingredients..."
              value={newProduct.desc}
              onChange={e => setNewProduct({ ...newProduct, desc: e.target.value })}
            />
          </label>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={() => setShowProductModal(false)}>Cancel</button>
            <button type="submit" className="primary-btn"><Plus size={16} /> Save Dish</button>
          </div>
        </form>
      </div>
    </div>
  );
}
