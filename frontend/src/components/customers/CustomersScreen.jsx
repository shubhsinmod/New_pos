import React from 'react';

export default function CustomersScreen({
  customers,
  setCartCustomer,
  setActive,
  setNotice
}) {
  return (
    <div>
      <div className="page-heading">
        <div>
          <div className="eyebrow">CUSTOMER DIRECTORY</div>
          <h1>Customer Directory ({customers.length})</h1>
          <p>Loyalty points, purchase history, and guest contact records.</p>
        </div>
      </div>

      <div className="data-table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Mobile Number</th>
              <th>Total Visits</th>
              <th>Total Spend</th>
              <th>Reward Points</th>
              <th>Last Visit</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id}>
                <td><strong>{c.name}</strong></td>
                <td>{c.phone}</td>
                <td>{c.visits} orders</td>
                <td><strong style={{ color: '#176b52' }}>₹{(c.totalSpent || 0).toLocaleString('en-IN')}</strong></td>
                <td>
                  <span className="badge-pill upi">
                    ★ {c.loyaltyPoints || 0} Pts
                  </span>
                </td>
                <td>{c.lastVisitAt ? new Date(c.lastVisitAt).toLocaleDateString() : 'Active'}</td>
                <td>
                  <button
                    className="outline-btn"
                    style={{ padding: '4px 8px', fontSize: '10px' }}
                    onClick={() => {
                      setCartCustomer({ name: c.name, phone: c.phone });
                      setActive('POS Terminal');
                      setNotice(`Customer ${c.name} linked to POS billing.`);
                    }}
                  >
                    Bill Customer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
