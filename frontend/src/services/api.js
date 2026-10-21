const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim();
export const API_BASE = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;

export function getAuthHeaders(extraHeaders = {}) {
  const headers = { ...extraHeaders };
  try {
    const token = localStorage.getItem('pos_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch {}
  return headers;
}

export async function checkHealth() {
  const res = await fetch(`${API_BASE}/api/health`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

// Outlets
export async function getOutlets() {
  const res = await fetch(`${API_BASE}/api/outlets`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch outlets');
  return res.json();
}

export async function createOutlet(payload) {
  const res = await fetch(`${API_BASE}/api/outlets`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || 'Failed to create outlet');
  }
  return res.json();
}

export async function updateOutlet(id, payload) {
  const res = await fetch(`${API_BASE}/api/outlets/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || 'Failed to update outlet');
  }
  return res.json();
}

export async function toggleOutletActive(id) {
  const res = await fetch(`${API_BASE}/api/outlets/${id}/toggle-active`, {
    method: 'PUT',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to toggle outlet active status');
  return res.json();
}

// Categories
export async function getCategories(outletId) {
  const url = outletId ? `${API_BASE}/api/categories?outletId=${outletId}` : `${API_BASE}/api/categories`;
  const res = await fetch(url, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

// Products
export async function getProducts(category, outletId) {
  const params = new URLSearchParams();
  if (category && category !== 'All') params.append('category', category);
  if (outletId) params.append('outletId', outletId);
  const queryStr = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE}/api/products${queryStr}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function createProduct(payload) {
  const res = await fetch(`${API_BASE}/api/products`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to create product');
  return res.json();
}

export async function toggleProductStock(id, inStock) {
  const res = await fetch(`${API_BASE}/api/products/${id}/stock`, {
    method: 'PUT',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: inStock !== undefined ? JSON.stringify({ inStock }) : undefined
  });
  if (!res.ok) throw new Error('Failed to update stock');
  return res.json();
}

// Tables
export async function getTables(outletId) {
  const url = outletId ? `${API_BASE}/api/tables?outletId=${outletId}` : `${API_BASE}/api/tables`;
  const res = await fetch(url, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch tables');
  return res.json();
}

export async function updateTableStatus(tableCode, statusData) {
  const res = await fetch(`${API_BASE}/api/tables/${tableCode}/status`, {
    method: 'PUT',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(statusData)
  });
  if (!res.ok) throw new Error('Failed to update table status');
  return res.json();
}

export async function createTable(payload) {
  const res = await fetch(`${API_BASE}/api/tables`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || 'Failed to create dining table');
  }
  return res.json();
}

// Orders (KOT)
export async function getOrders(outletId) {
  const url = outletId ? `${API_BASE}/api/orders?outletId=${outletId}` : `${API_BASE}/api/orders`;
  const res = await fetch(url, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}

export async function createOrder(payload) {
  const res = await fetch(`${API_BASE}/api/orders`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to create order');
  return res.json();
}

export async function updateOrderStatus(orderId, status) {
  const res = await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
    method: 'PUT',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update order status');
  return res.json();
}

// Bills
export async function getBills(outletId) {
  const url = outletId ? `${API_BASE}/api/bills?outletId=${outletId}` : `${API_BASE}/api/bills`;
  const res = await fetch(url, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch bills');
  return res.json();
}

export async function createBill(payload) {
  const res = await fetch(`${API_BASE}/api/bills`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to create bill');
  return res.json();
}

// Customers
export async function getCustomers(outletId) {
  const url = outletId ? `${API_BASE}/api/customers?outletId=${outletId}` : `${API_BASE}/api/customers`;
  const res = await fetch(url, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch customers');
  return res.json();
}

export async function saveCustomer(payload) {
  const res = await fetch(`${API_BASE}/api/customers`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to save customer');
  return res.json();
}

// Analytics
export async function getAnalyticsSummary(outletId) {
  const url = outletId ? `${API_BASE}/api/analytics/summary?outletId=${outletId}` : `${API_BASE}/api/analytics/summary`;
  const res = await fetch(url, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

// Table Status & Vacate
export async function getTableActiveOrder(code) {
  const res = await fetch(`${API_BASE}/api/tables/${code}/active-order`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) return null;
  return res.json();
}

export async function vacateTable(code) {
  const res = await fetch(`${API_BASE}/api/tables/${code}/vacate`, {
    method: 'PUT',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to vacate table');
  return res.json();
}

// Settlements
export async function getSettlements(outletId) {
  const url = outletId ? `${API_BASE}/api/settlements?outletId=${outletId}` : `${API_BASE}/api/settlements`;
  const res = await fetch(url, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch settlements');
  return res.json();
}

export async function createSettlement(payload) {
  const res = await fetch(`${API_BASE}/api/settlements`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || 'Failed to process settlement');
  }
  return res.json();
}

// Authentication & Staff User Management
export async function login(username, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) {
    const err = await res.text();
    let message = 'Login failed';
    try {
      const json = JSON.parse(err);
      message = json.message || message;
    } catch {
      message = err || message;
    }
    throw new Error(message);
  }
  return res.json();
}

export async function getMe() {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
}

export async function getUsers(outletId) {
  const url = outletId ? `${API_BASE}/api/auth/users?outletId=${outletId}` : `${API_BASE}/api/auth/users`;
  const res = await fetch(url, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function createUser(payload) {
  const res = await fetch(`${API_BASE}/api/auth/users`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.text();
    let message = 'Failed to create user';
    try {
      const json = JSON.parse(err);
      message = json.message || message;
    } catch {
      message = err || message;
    }
    throw new Error(message);
  }
  return res.json();
}

export async function updateUser(id, payload) {
  const res = await fetch(`${API_BASE}/api/auth/users/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to update user');
  return res.json();
}

export async function deleteUser(id) {
  const res = await fetch(`${API_BASE}/api/auth/users/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete user');
  return true;
}
