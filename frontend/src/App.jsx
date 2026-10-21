import React, { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';

import * as api from './services/api';

// Layout Components
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';

// Page Screen Components
import OverviewScreen from './components/overview/OverviewScreen';
import PosTerminal from './components/pos/PosTerminal';
import TablesScreen from './components/tables/TablesScreen';
import OrdersKotScreen from './components/orders/OrdersKotScreen';
import MenuScreen from './components/menu/MenuScreen';
import BillingScreen from './components/billing/BillingScreen';
import CustomersScreen from './components/customers/CustomersScreen';
import OutletsScreen from './components/outlets/OutletsScreen';
import ReportsScreen from './components/reports/ReportsScreen';
import SettingsScreen from './components/settings/SettingsScreen';
import StaffScreen from './components/auth/StaffScreen';

// Modal Dialog Components
import PaymentModal from './components/modals/PaymentModal';
import ReceiptModal from './components/modals/ReceiptModal';
import AddProductModal from './components/modals/AddProductModal';
import AddOutletModal from './components/modals/AddOutletModal';
import LoginModal from './components/auth/LoginModal';

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('pos_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [active, setActive] = useState('Overview');
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState('Checking API');
  const [notice, setNotice] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth > 900 : true);

  // 100% DYNAMIC STATE LOADED FROM MSSQL DATABASE
  const [outlets, setOutlets] = useState([]);
  const [selectedOutlet, setSelectedOutlet] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [bills, setBills] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalBills: 0,
    upiRevenue: 0,
    cashRevenue: 0,
    cardRevenue: 0,
    totalTables: 0,
    occupiedTables: 0,
    averageOrderValue: 0
  });

  // Outlets filter & form
  const [query, setQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', phone: '', email: '', address: '', gstin: '' });

  // POS State
  const [orderType, setOrderType] = useState('Dine-In');
  const [selectedTableId, setSelectedTableId] = useState('');
  const [posCategory, setPosCategory] = useState('All');
  const [posDietFilter, setPosDietFilter] = useState('All'); // 'All' | 'Veg' | 'NonVeg'
  const [posSearch, setPosSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [tableCarts, setTableCarts] = useState({}); // Per-table cart dictionary
  const [cartCustomer, setCartCustomer] = useState({ name: '', phone: '' });
  const [tableCustomers, setTableCustomers] = useState({}); // Per-table customer dictionary
  const [discountPercent, setDiscountPercent] = useState(0);

  // Payment & Receipt Modals
  const [showPayModal, setShowPayModal] = useState(false);
  const [payMethod, setPayMethod] = useState('UPI'); // 'UPI' | 'CASH' | 'CARD'
  const [cashTendered, setCashTendered] = useState('');
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState(null);

  // Product Add Modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', category: 'Main Course', price: '', isVeg: true, desc: '' });

  // Fetch all data dynamically from MSSQL Database for the selected outlet
  const fetchAllData = async (targetOutletId) => {
    setLoading(true);
    try {
      const outletsData = await api.getOutlets().catch(err => {
        console.error('Error fetching outlets:', err);
        return [];
      });

      let activeOutletId = targetOutletId || selectedOutlet?.id;

      if (Array.isArray(outletsData) && outletsData.length > 0) {
        setOutlets(outletsData);
        const match = activeOutletId ? outletsData.find(o => o.id === activeOutletId) : null;
        const activeToUse = match || outletsData[0];
        setSelectedOutlet(activeToUse);
        activeOutletId = activeToUse.id;
      }

      const [
        healthRes,
        categoriesRes,
        productsRes,
        tablesRes,
        ordersRes,
        billsRes,
        settlementsRes,
        customersRes,
        analyticsRes
      ] = await Promise.allSettled([
        api.checkHealth(),
        api.getCategories(activeOutletId),
        api.getProducts('All', activeOutletId),
        api.getTables(activeOutletId),
        api.getOrders(activeOutletId),
        api.getBills(activeOutletId),
        api.getSettlements(activeOutletId),
        api.getCustomers(activeOutletId),
        api.getAnalyticsSummary(activeOutletId),
      ]);

      if (healthRes.status === 'fulfilled') {
        setApiStatus('System Online');
      } else {
        setApiStatus('Offline / Reconnecting');
      }



      if (categoriesRes.status === 'fulfilled' && Array.isArray(categoriesRes.value)) {
        setCategories(categoriesRes.value);
      }

      let loadedProducts = [];
      if (productsRes.status === 'fulfilled' && Array.isArray(productsRes.value)) {
        loadedProducts = productsRes.value;
        setProducts(loadedProducts);
      }

      let loadedTables = [];
      if (tablesRes.status === 'fulfilled' && Array.isArray(tablesRes.value)) {
        loadedTables = tablesRes.value;
        setTables(loadedTables);
        if (loadedTables.length > 0 && !selectedTableId) {
          setSelectedTableId(loadedTables[0].code);
        }
      }

      let loadedOrders = [];
      if (ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value)) {
        loadedOrders = ordersRes.value.map(o => ({
          ...o,
          items: typeof o.itemsJson === 'string' ? JSON.parse(o.itemsJson || '[]') : (o.items || [])
        }));
        setOrders(loadedOrders);
      }

      if (billsRes.status === 'fulfilled' && Array.isArray(billsRes.value)) {
        setBills(billsRes.value.map(b => ({
          ...b,
          items: typeof b.itemsJson === 'string' ? JSON.parse(b.itemsJson || '[]') : (b.items || [])
        })));
      }

      if (settlementsRes.status === 'fulfilled' && Array.isArray(settlementsRes.value)) {
        setSettlements(settlementsRes.value);
      }

      if (customersRes.status === 'fulfilled' && Array.isArray(customersRes.value)) {
        setCustomers(customersRes.value);
      }

      if (analyticsRes.status === 'fulfilled') {
        setAnalytics(analyticsRes.value);
      }
    } catch (err) {
      console.error('Error fetching data from database:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('pos_token');
    if (token) {
      api.getMe()
        .then(user => {
          setCurrentUser(user);
          fetchAllData(user.outletId);
        })
        .catch(() => {
          handleLogout();
          fetchAllData();
        });
    } else {
      fetchAllData();
    }
  }, []);

  // Authentication Handlers
  const handleLoginSuccess = (user, token) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('pos_user', JSON.stringify(user));
      localStorage.setItem('pos_token', token);
    } catch {}

    // Default landing screen based on staff role
    if (user.role === 'KITCHEN') {
      setActive('Orders & KOT');
    } else if (user.role === 'WAITER') {
      setActive('Tables');
    } else if (user.role === 'CASHIER') {
      setActive('POS Terminal');
    } else {
      setActive('Overview');
    }
    setNotice(`Welcome back, ${user.fullName || user.username} (${user.role})!`);
    fetchAllData(user.outletId);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('pos_user');
      localStorage.removeItem('pos_token');
    } catch {}
    setNotice('Logged out. Please sign in to terminal.');
  };

  // Handle switching active outlet dynamically
  const handleSelectOutlet = (newOutlet) => {
    if (!newOutlet) return;
    setSelectedOutlet(newOutlet);
    fetchAllData(newOutlet.id);
  };

  // Filter Outlets
  const filteredOutlets = useMemo(() => outlets.filter(o =>
    `${o.name} ${o.code} ${o.address || ''}`.toLowerCase().includes(query.toLowerCase())), [outlets, query]);

  // Create Outlet in MSSQL
  async function handleCreateOutlet(e) {
    e.preventDefault();
    const payload = { ...form, active: true };
    try {
      const saved = await api.createOutlet(payload);
      setOutlets(current => [...current, saved]);
      handleSelectOutlet(saved);
      setNotice(`Outlet "${saved.name}" created successfully!`);
    } catch (err) {
      setNotice(err.message || 'Unable to create outlet.');
    }
    setShowModal(false);
    setForm({ name: '', code: '', phone: '', email: '', address: '', gstin: '' });
  }

  // Categories list with 'All'
  const categoryNames = useMemo(() => {
    return ['All', ...categories.map(c => c.name)];
  }, [categories]);

  // Filtered Products for POS
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = posCategory === 'All' || p.category === posCategory;
      const isVeg = p.isVeg === true || p.veg === true;
      const matchDiet = posDietFilter === 'All' ? true : posDietFilter === 'Veg' ? isVeg : !isVeg;
      const matchSearch = p.name.toLowerCase().includes(posSearch.toLowerCase()) ||
                          p.category.toLowerCase().includes(posSearch.toLowerCase());
      return matchCat && matchDiet && matchSearch;
    });
  }, [products, posCategory, posDietFilter, posSearch]);

  // Select / Switch Table and intelligently hydrate its items & guest info into Cart
  const handleSelectTable = (tableCode, targetScreen = null) => {
    // 1. Cache current cart and guest info for current table before switching
    if (orderType === 'Dine-In' && selectedTableId && selectedTableId !== tableCode) {
      setTableCarts(prev => ({ ...prev, [selectedTableId]: cart }));
      setTableCustomers(prev => ({ ...prev, [selectedTableId]: cartCustomer }));
    }

    setSelectedTableId(tableCode);
    setOrderType('Dine-In');

    // 2. Identify table state from database
    const tableData = tables.find(t => t.code === tableCode);
    const isAvailableInDb = !tableData || tableData.status === 'Available';

    // 3. Hydrate or restore customer name/phone for this specific table
    if (tableCustomers[tableCode]) {
      setCartCustomer(tableCustomers[tableCode]);
    } else if (tableData && tableData.customerName) {
      const custFromTable = { name: tableData.customerName, phone: tableData.customerPhone || '' };
      setCartCustomer(custFromTable);
      setTableCustomers(prev => ({ ...prev, [tableCode]: custFromTable }));
    } else {
      const blankCust = { name: '', phone: '' };
      setCartCustomer(blankCust);
      setTableCustomers(prev => ({ ...prev, [tableCode]: blankCust }));
    }

    // 4. Hydrate Cart:
    // If the table is Available in DB AND has no current draft cart in memory, cart MUST be empty!
    if (tableCarts[tableCode] && tableCarts[tableCode].length > 0) {
      setCart(tableCarts[tableCode]);
    } else if (isAvailableInDb) {
      // Clean vacant table: NEVER load old completed orders
      setCart([]);
    } else {
      // Table is Occupied or Billed: look up ONLY currently active kitchen orders (NOT Completed)
      const activeOrder = orders.find(o => o.tableCode === tableCode && o.status !== 'Completed' && o.status !== 'Settled');

      if (activeOrder && Array.isArray(activeOrder.items) && activeOrder.items.length > 0) {
        const hydratedItems = activeOrder.items.map(it => {
          const matched = products.find(p => p.name.toLowerCase() === it.name.toLowerCase());
          const unitPrice = it.price || matched?.price || 150;
          return {
            product: matched || {
              id: 'dish-' + it.name.replace(/\s+/g, '-'),
              name: it.name,
              price: unitPrice,
              category: 'Main Course',
              isVeg: true,
              inStock: true,
              description: 'Active kitchen order dish'
            },
            qty: it.qty,
            kotSentQty: it.qty, // Already sent to kitchen
            notes: ''
          };
        });
        setCart(hydratedItems);
        setTableCarts(prev => ({ ...prev, [tableCode]: hydratedItems }));
      } else if (tableData && tableData.runningTotal > 0) {
        // Table has running total in MSSQL
        const runningItem = {
          product: {
            id: 'running-' + tableCode,
            name: `${tableCode} Running Table Order`,
            price: tableData.runningTotal,
            category: 'Running Order',
            isVeg: true,
            inStock: true,
            description: `Active running order (${tableData.orderTime || 'Guest dining'})`
          },
          qty: 1,
          kotSentQty: 1,
          notes: ''
        };
        setCart([runningItem]);
        setTableCarts(prev => ({ ...prev, [tableCode]: [runningItem] }));
      } else {
        // Clean vacant table
        setCart([]);
      }
    }

    if (targetScreen) {
      setActive(targetScreen);
    }
    setNotice(`Table ${tableCode} active in POS.`);
  };

  // Mark Table Available / Vacant in MSSQL (Calls backend vacate endpoint)
  const handleMarkTableAvailable = async (tableCode) => {
    try {
      await api.vacateTable(tableCode);

      setTables(prev => prev.map(t => t.code === tableCode ? {
        ...t,
        status: 'Available',
        runningTotal: 0.0,
        orderTime: null,
        runningOrderId: null,
        customerName: null,
        customerPhone: null
      } : t));

      setTableCarts(prev => {
        const next = { ...prev };
        delete next[tableCode];
        return next;
      });

      setTableCustomers(prev => {
        const next = { ...prev };
        delete next[tableCode];
        return next;
      });

      if (selectedTableId === tableCode) {
        setCart([]);
        setCartCustomer({ name: '', phone: '' });
      }

      // Mark any active orders for this table as Completed
      setOrders(prev => prev.map(o => o.tableCode === tableCode ? { ...o, status: 'Completed' } : o));

      setNotice(`Table ${tableCode} has been vacated and marked Available.`);
    } catch (err) {
      setNotice(`Failed to mark table ${tableCode} available: ${err.message}`);
    }
  };

  // Update Table Status (e.g. Reserve -> Occupied)
  const handleUpdateTableStatus = async (tableCode, newStatus) => {
    try {
      const oid = selectedOutlet?.id || 1;
      await api.updateTableStatus(tableCode, { status: newStatus, outletId: oid });
      setTables(prev => prev.map(t => t.code === tableCode ? { ...t, status: newStatus, outletId: oid } : t));
      setNotice(`Table ${tableCode} status changed to "${newStatus}".`);
    } catch (err) {
      setNotice(`Error updating table: ${err.message}`);
    }
  };

  // Add new dining table to MSSQL floor layout
  const handleCreateTable = async (tableData) => {
    const payload = {
      ...tableData,
      status: 'Available',
      runningTotal: 0.0,
      outletId: selectedOutlet?.id || 1,
    };
    const saved = await api.createTable(payload);
    setTables(prev => [...prev, saved]);
    setNotice(`Table ${saved.code} (${saved.name}) added to floor!`);
    return saved;
  };

  // 1-Click Settle Table Bill
  const handleSettleTable = (table) => {
    handleSelectTable(table.code, null);
    setShowPayModal(true);
  };

  // Cart Operations
  function addToCart(product) {
    if (!product.inStock) {
      setNotice(`${product.name} is marked Out of Stock!`);
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      const next = existing
        ? prev.map(item => item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item)
        : [...prev, { product, qty: 1, kotSentQty: 0, notes: '' }];

      if (orderType === 'Dine-In' && selectedTableId) {
        setTableCarts(tc => ({ ...tc, [selectedTableId]: next }));

        // Mark table as Occupied immediately so it does not stay Available while items are in cart
        setTables(currentTables => currentTables.map(t =>
          t.code === selectedTableId && t.status === 'Available'
            ? { ...t, status: 'Occupied' }
            : t
        ));
      }
      return next;
    });
  }

  function updateCartQty(productId, delta) {
    setCart(prev => {
      const next = prev
        .map(item => {
          if (item.product.id === productId) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);

      if (orderType === 'Dine-In' && selectedTableId) {
        setTableCarts(tc => ({ ...tc, [selectedTableId]: next }));
      }
      return next;
    });
  }

  function removeFromCart(productId) {
    setCart(prev => {
      const next = prev.filter(item => item.product.id !== productId);
      if (orderType === 'Dine-In' && selectedTableId) {
        setTableCarts(tc => ({ ...tc, [selectedTableId]: next }));
        if (next.length === 0) {
          const hasActiveOrder = orders.some(o => o.tableCode === selectedTableId && o.status !== 'Completed' && o.status !== 'Settled');
          if (!hasActiveOrder) {
            setTables(current => current.map(t => t.code === selectedTableId ? { ...t, status: 'Available', runningTotal: 0.0 } : t));
          }
        }
      }
      return next;
    });
  }

  function clearCart() {
    setCart([]);
    setDiscountPercent(0);
    setCartCustomer({ name: '', phone: '' });
    if (orderType === 'Dine-In' && selectedTableId) {
      setTableCarts(tc => {
        const next = { ...tc };
        delete next[selectedTableId];
        return next;
      });
      setTableCustomers(tc => {
        const next = { ...tc };
        delete next[selectedTableId];
        return next;
      });

      // If no active kitchen order was placed, revert table status to Available
      const hasActiveOrder = orders.some(o => o.tableCode === selectedTableId && o.status !== 'Completed' && o.status !== 'Settled');
      if (!hasActiveOrder) {
        const oid = selectedOutlet?.id || 1;
        setTables(current => current.map(t => t.code === selectedTableId ? { ...t, status: 'Available', runningTotal: 0.0, outletId: oid } : t));
        api.updateTableStatus(selectedTableId, { status: 'Available', runningTotal: 0.0, outletId: oid }).catch(() => {});
      }
    }
  }

  function updateCartCustomer(newCustomer) {
    setCartCustomer(newCustomer);
    if (orderType === 'Dine-In' && selectedTableId) {
      setTableCustomers(tc => ({ ...tc, [selectedTableId]: newCustomer }));
    }
  }

  // Cart Calculations
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + (item.product.price * item.qty), 0), [cart]);
  const discountAmount = useMemo(() => Math.round((subtotal * discountPercent) / 100), [subtotal, discountPercent]);
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const cgst = useMemo(() => Math.round((taxableAmount * 0.025) * 100) / 100, [taxableAmount]);
  const sgst = useMemo(() => Math.round((taxableAmount * 0.025) * 100) / 100, [taxableAmount]);
  const grandTotal = Math.round(taxableAmount + cgst + sgst);

  // Send KOT Order dynamically to MSSQL (Incremental KOT - Only fires new items)
  async function handleSendKOT() {
    if (cart.length === 0) return;

    // Filter only new items or additional quantities that haven't been sent to kitchen yet
    const itemsToFire = cart
      .map(c => ({
        name: c.product.name,
        qty: c.qty - (c.kotSentQty || 0),
        price: c.product.price
      }))
      .filter(c => c.qty > 0);

    if (itemsToFire.length === 0) {
      setNotice('All items in this cart are already sent to Kitchen! Add new dishes to fire another KOT.');
      return;
    }

    const orderNumber = `KOT-${Math.floor(100 + Math.random() * 900)}`;
    const tableCode = orderType === 'Dine-In' ? selectedTableId : `${orderType} #${Math.floor(10 + Math.random() * 89)}`;
    const isRunningOrder = cart.some(c => (c.kotSentQty || 0) > 0);

    const orderPayload = {
      orderNumber,
      tableCode,
      orderType,
      status: 'In Kitchen',
      itemsJson: JSON.stringify(itemsToFire),
      subtotal: itemsToFire.reduce((s, i) => s + (i.price * i.qty), 0),
      discount: 0,
      tax: 0,
      total: itemsToFire.reduce((s, i) => s + (i.price * i.qty), 0),
      customerName: cartCustomer.name || 'Walk-in',
      customerPhone: cartCustomer.phone || '',
      notes: (cartCustomer.name ? `Guest: ${cartCustomer.name} · ` : '') + (isRunningOrder ? 'Running Order (Add-on items only)' : 'Initial Order')
    };

    try {
      const savedOrder = await api.createOrder(orderPayload);
      setOrders(prev => [{ ...savedOrder, items: itemsToFire }, ...prev]);

      // Mark all current quantities as sent to kitchen!
      const updatedCart = cart.map(item => ({ ...item, kotSentQty: item.qty }));
      setCart(updatedCart);
      if (orderType === 'Dine-In' && selectedTableId) {
        setTableCarts(tc => ({ ...tc, [selectedTableId]: updatedCart }));
      }

      // Update table occupancy in MSSQL with full running total, customer info & outletId
      if (orderType === 'Dine-In' && selectedTableId) {
        const oid = selectedOutlet?.id || 1;
        await api.updateTableStatus(selectedTableId, {
          status: 'Occupied',
          runningTotal: grandTotal,
          orderTime: 'Just now',
          runningOrderId: orderNumber,
          customerName: cartCustomer.name || null,
          customerPhone: cartCustomer.phone || null,
          outletId: oid
        });

        setTables(prev => prev.map(t => t.code === selectedTableId ? {
          ...t,
          status: 'Occupied',
          runningTotal: grandTotal,
          orderTime: 'Just now',
          runningOrderId: orderNumber,
          customerName: cartCustomer.name || null,
          customerPhone: cartCustomer.phone || null,
          outletId: oid
        } : t));
      }

      setNotice(`${isRunningOrder ? 'Running Add-on KOT' : 'Initial KOT'} ${orderNumber} dispatched to Kitchen (${itemsToFire.reduce((s,i)=>s+i.qty,0)} new item(s) only)!`);
    } catch (err) {
      setNotice('Error placing order: ' + err.message);
    }
  }

  // Update Order Status
  async function handleUpdateOrderStatus(orderId, newStatus) {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      setNotice(`Order #${orderId} updated to "${newStatus}".`);
    } catch (err) {
      console.error('Error updating order:', err);
    }
  }

  // Toggle Product Stock
  async function handleToggleStock(productId) {
    try {
      const updated = await api.toggleProductStock(productId);
      setProducts(prev => prev.map(p => p.id === productId ? updated : p));
      setNotice(`Product status updated to ${updated.inStock ? 'In Stock' : 'Sold Out'}.`);
    } catch (err) {
      console.error('Error updating stock in database:', err);
    }
  }

  // Complete Payment & Save to MSSQL Settlements Table
  async function handleCompletePayment() {
    if (cart.length === 0) return;
    const items = cart.map(c => ({ name: c.product.name, qty: c.qty, price: c.product.price }));
    const billNum = `BILL-${Math.floor(9000 + Math.random() * 1000)}`;
    const stlNum = `STL-${Math.floor(1000 + Math.random() * 9000)}`;

    const settlementPayload = {
      settlementNumber: stlNum,
      billNumber: billNum,
      tableCode: orderType === 'Dine-In' ? selectedTableId : orderType,
      orderType,
      customerName: cartCustomer.name || 'Walk-in Guest',
      customerPhone: cartCustomer.phone || '',
      itemsJson: JSON.stringify(items),
      itemsCount: cart.reduce((a, b) => a + b.qty, 0),
      subtotal,
      discount: discountAmount,
      tax: cgst + sgst,
      totalAmount: grandTotal,
      paymentMode: payMethod,
      cashTendered: payMethod === 'Cash' ? (parseFloat(cashTendered) || grandTotal) : grandTotal,
      changeReturned: payMethod === 'Cash' ? Math.max(0, (parseFloat(cashTendered) || grandTotal) - grandTotal) : 0,
      paymentReference: payMethod === 'UPI' ? 'UPI-TXN-' + Date.now() : payMethod === 'Card' ? 'POS-CARD-' + Date.now() : 'CASH',
      outletName: selectedOutlet?.name || 'Tableflow POS',
      cashierName: 'Admin / Cashier',
      status: 'COMPLETED'
    };

    try {
      // 1. Single atomic call to backend POST /api/settlements
      // Backend automatically:
      // - saves into `settlements` table
      // - saves into `bills` table
      // - updates customer loyalty points in `customers` table
      // - resets `dining_tables` status to 'Available', 0.0 total, and clears customer name/phone
      // - marks active kitchen tickets as 'Completed'
      const savedSettlement = await api.createSettlement(settlementPayload);

      // 2. Update state locally
      setSettlements(prev => [savedSettlement, ...prev]);
      setBills(prev => [{
        id: savedSettlement.id,
        billNumber: savedSettlement.billNumber,
        tableCode: savedSettlement.tableCode,
        orderType: savedSettlement.orderType,
        customerName: savedSettlement.customerName,
        customerPhone: savedSettlement.customerPhone,
        subtotal: savedSettlement.subtotal,
        discount: savedSettlement.discount,
        tax: savedSettlement.tax,
        total: savedSettlement.totalAmount,
        paymentMode: savedSettlement.paymentMode,
        status: 'PAID',
        createdAt: savedSettlement.settledAt,
        items
      }, ...prev]);

      if (orderType === 'Dine-In' && selectedTableId) {
        setTables(prev => prev.map(t => t.code === selectedTableId ? {
          ...t,
          status: 'Available',
          runningTotal: 0.0,
          orderTime: null,
          runningOrderId: null,
          customerName: null,
          customerPhone: null
        } : t));

        setTableCarts(prev => {
          const next = { ...prev };
          delete next[selectedTableId];
          return next;
        });

        setTableCustomers(prev => {
          const next = { ...prev };
          delete next[selectedTableId];
          return next;
        });

        setOrders(prev => prev.map(o => o.tableCode === selectedTableId ? { ...o, status: 'Completed' } : o));
      }

      // Background sync
      api.getCustomers().then(data => setCustomers(data)).catch(() => {});
      api.getAnalyticsSummary().then(data => setAnalytics(data)).catch(() => {});

      setShowPayModal(false);
      clearCart();
      setActiveReceipt({
        billNumber: savedSettlement.billNumber,
        orderNumber: 'ORD-' + savedSettlement.settlementNumber,
        tableCode: savedSettlement.tableCode,
        orderType: savedSettlement.orderType,
        customerName: savedSettlement.customerName,
        customerPhone: savedSettlement.customerPhone,
        items,
        subtotal,
        discount: discountAmount,
        tax: cgst + sgst,
        total: grandTotal,
        paymentMode: payMethod,
        outletName: selectedOutlet?.name,
        outletAddress: selectedOutlet?.address,
        gstin: selectedOutlet?.gstin
      });
      setShowReceiptModal(true);
      setNotice(`Settlement ${savedSettlement.settlementNumber} recorded & Table ${selectedTableId || ''} vacated!`);
    } catch (err) {
      setNotice('Error recording settlement: ' + err.message);
    }
  }

  // Create Product
  async function handleAddProduct(e) {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;
    const payload = {
      name: newProduct.name,
      category: newProduct.category,
      price: parseFloat(newProduct.price),
      isVeg: newProduct.isVeg,
      inStock: true,
      description: newProduct.desc || 'Freshly prepared specialty dish',
      outletId: selectedOutlet?.id || 1
    };

    try {
      const saved = await api.createProduct(payload);
      setProducts(prev => [...prev, saved]);
      setShowProductModal(false);
      setNewProduct({ name: '', category: 'Main Course', price: '', isVeg: true, desc: '' });
      setNotice(`Dish "${saved.name}" added successfully!`);
    } catch (err) {
      setNotice('Error adding dish: ' + err.message);
    }
  }

  return (
    <div className={`app-shell ${sidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
      {/* Mobile/Tablet Backdrop (Hidden on desktop) */}
      {sidebarOpen && typeof window !== 'undefined' && window.innerWidth <= 900 && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Modular Sidebar */}
      <Sidebar
        active={active}
        setActive={setActive}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        selectedOutlet={selectedOutlet}
        orders={orders}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="main">
        {/* Modular Topbar */}
        <Topbar
          active={active}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          fetchAllData={fetchAllData}
          loading={loading}
          setNotice={setNotice}
          outlets={outlets}
          selectedOutlet={selectedOutlet}
          setSelectedOutlet={handleSelectOutlet}
          apiStatus={apiStatus}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        {/* Dynamic Content Area */}
        <div className="content">
          {active === 'Overview' && (
            <OverviewScreen
              setActive={setActive}
              selectedOutlet={selectedOutlet}
              analytics={analytics}
              bills={bills}
              tables={tables}
              orders={orders}
              outlets={outlets}
              setSelectedTableId={setSelectedTableId}
              setOrderType={setOrderType}
              setActiveReceipt={setActiveReceipt}
              setShowReceiptModal={setShowReceiptModal}
              handleSelectTable={handleSelectTable}
            />
          )}

          {active === 'POS Terminal' && (
            <PosTerminal
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
              removeFromCart={removeFromCart}
              clearCart={clearCart}
              cartCustomer={cartCustomer}
              setCartCustomer={updateCartCustomer}
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
          )}

          {active === 'Tables' && (
            <TablesScreen
              tables={tables}
              handleSelectTable={handleSelectTable}
              handleSettleTable={handleSettleTable}
              handleMarkTableAvailable={handleMarkTableAvailable}
              handleUpdateTableStatus={handleUpdateTableStatus}
              handleCreateTable={handleCreateTable}
              selectedOutlet={selectedOutlet}
              setActive={setActive}
              setNotice={setNotice}
            />
          )}

          {active === 'Orders & KOT' && (
            <OrdersKotScreen
              orders={orders}
              setActive={setActive}
              handleUpdateOrderStatus={handleUpdateOrderStatus}
            />
          )}

          {active === 'Menu & Products' && (
            <MenuScreen
              products={products}
              setShowProductModal={setShowProductModal}
              handleToggleStock={handleToggleStock}
              addToCart={addToCart}
              setActive={setActive}
              setNotice={setNotice}
            />
          )}

          {active === 'Billing & Payments' && (
            <BillingScreen
              bills={bills}
              settlements={settlements}
              analytics={analytics}
              setActive={setActive}
              setActiveReceipt={setActiveReceipt}
              setShowReceiptModal={setShowReceiptModal}
            />
          )}

          {active === 'Customers' && (
            <CustomersScreen
              customers={customers}
              setCartCustomer={setCartCustomer}
              setActive={setActive}
              setNotice={setNotice}
            />
          )}

          {active === 'Outlets' && (
            <OutletsScreen
              outlets={outlets}
              filteredOutlets={filteredOutlets}
              query={query}
              setQuery={setQuery}
              setShowModal={setShowModal}
              selectedOutlet={selectedOutlet}
              setSelectedOutlet={handleSelectOutlet}
              setOutlets={setOutlets}
              setNotice={setNotice}
            />
          )}

          {active === 'Reports' && (
            <ReportsScreen
              analytics={analytics}
              bills={bills}
              tables={tables}
              customers={customers}
              products={products}
              setNotice={setNotice}
            />
          )}

          {active === 'Staff & Roles' && (
            <StaffScreen
              currentUser={currentUser}
              selectedOutlet={selectedOutlet}
              outlets={outlets}
              setNotice={setNotice}
            />
          )}

          {active === 'Settings' && (
            <SettingsScreen setNotice={setNotice} />
          )}
        </div>

        {/* Global Footer */}
        <footer className="footer">
          <span>© 2026 Tableflow Restaurant POS</span>
          <span>
            <span className="green-dot" /> System Online · Enterprise POS Cloud
          </span>
        </footer>
      </main>

      {/* Modular Modals */}
      <PaymentModal
        showPayModal={showPayModal}
        setShowPayModal={setShowPayModal}
        grandTotal={grandTotal}
        selectedTableId={selectedTableId}
        payMethod={payMethod}
        setPayMethod={setPayMethod}
        cashTendered={cashTendered}
        setCashTendered={setCashTendered}
        handleCompletePayment={handleCompletePayment}
      />

      <ReceiptModal
        showReceiptModal={showReceiptModal}
        setShowReceiptModal={setShowReceiptModal}
        activeReceipt={activeReceipt}
        selectedOutlet={selectedOutlet}
        setNotice={setNotice}
      />

      <AddProductModal
        showProductModal={showProductModal}
        setShowProductModal={setShowProductModal}
        handleAddProduct={handleAddProduct}
        newProduct={newProduct}
        setNewProduct={setNewProduct}
        categories={categories}
      />

      <AddOutletModal
        showModal={showModal}
        setShowModal={setShowModal}
        createOutlet={handleCreateOutlet}
        form={form}
        setForm={setForm}
      />

      {/* Login Screen / Modal when user is not authenticated */}
      {!currentUser && (
        <LoginModal
          onLoginSuccess={handleLoginSuccess}
          currentOutlet={selectedOutlet}
        />
      )}

      {/* Toast Notification */}
      {notice && (
        <div className="toast">
          <span>{notice}</span>
          <button onClick={() => setNotice('')}><X size={16} /></button>
        </div>
      )}
    </div>
  );
}

export default App;
