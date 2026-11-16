import React, { useState, useEffect } from 'react';
import { 
  Bike, 
  Check, 
  Clock, 
  MapPin, 
  Phone, 
  Plus, 
  Printer, 
  RefreshCw, 
  Trash2, 
  X, 
  Zap, 
  AlertCircle, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  ShoppingBag,
  Edit2,
  Save,
  Radio
} from 'lucide-react';
import * as api from '../../services/api';

// Browser Audio Beep for Incoming Orders
function playDingSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.55);
  } catch {}
}

export default function OnlineDeliveryHub({
  orders,
  setOrders,
  selectedOutlet,
  setNotice,
  setActiveReceipt,
  setShowReceiptModal,
  fetchAllData,
  onSwitchToManualCallOrder
}) {
  const [onlineTab, setOnlineTab] = useState('New'); // 'New' | 'In Kitchen' | 'Ready' | 'Completed' | 'All'
  const [dbOrders, setDbOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [autoAccept, setAutoAccept] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Edit / Modify Modal State
  const [editingOrder, setEditingOrder] = useState(null);
  const [editForm, setEditForm] = useState({
    customerName: '',
    customerPhone: '',
    deliveryAddress: '',
    instructions: '',
    riderName: '',
    riderPhone: '',
    riderEta: '',
    prepTimeMinutes: 15,
    status: 'Pending Acceptance'
  });

  const activeOutletId = selectedOutlet?.id || 1;

  // Load online delivery orders directly from MSSQL database table: online_delivery_orders
  const loadDeliveryOrders = async () => {
    setLoading(true);
    try {
      const data = await api.getDeliveryOrders(activeOutletId);
      if (Array.isArray(data)) {
        setDbOrders(data);
      }
    } catch (err) {
      console.error('Error fetching online delivery orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeliveryOrders();
  }, [activeOutletId]);

  // Derived counts from MSSQL DB records
  const pendingOrders = dbOrders.filter(o => o.status === 'Pending Acceptance');
  const preparingOrders = dbOrders.filter(o => o.status === 'In Kitchen' || o.status === 'Preparing' || o.status === 'Accepted');
  const readyOrders = dbOrders.filter(o => o.status === 'Ready for Pickup' || o.status === 'Ready to Serve');
  const completedOrders = dbOrders.filter(o => o.status === 'Completed' || o.status === 'Dispatched' || o.status === 'Delivered');

  // Accept Online Order -> Updates MSSQL online_delivery_orders table & syncs to RestaurantOrder KOT
  const handleAcceptOnlineOrder = async (order, prepTimeMinutes = 15) => {
    try {
      const updated = await api.updateDeliveryOrderStatus(order.id, 'In Kitchen', prepTimeMinutes);
      setDbOrders(prev => prev.map(o => o.id === order.id ? updated : o));

      // Refresh orders in parent state so Kitchen Display (KDS) immediately receives the ticket
      const kitchenOrders = await api.getOrders(activeOutletId);
      if (Array.isArray(kitchenOrders)) {
        setOrders(kitchenOrders.map(o => ({
          ...o,
          items: typeof o.itemsJson === 'string' ? JSON.parse(o.itemsJson || '[]') : (o.items || [])
        })));
      }

      if (soundEnabled) playDingSound();
      setNotice(`✅ ${order.platform} Order #${order.orderNumber} Accepted! KOT dispatched to Kitchen (${prepTimeMinutes}m prep).`);
      setOnlineTab('In Kitchen');
    } catch (err) {
      setNotice('Error accepting order: ' + err.message);
    }
  };

  // Reject Online Order
  const handleRejectOnlineOrder = async (orderId, platform) => {
    try {
      const updated = await api.updateDeliveryOrderStatus(orderId, 'Rejected');
      setDbOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      setNotice(`❌ ${platform} Order rejected.`);
    } catch (err) {
      setNotice('Error rejecting order: ' + err.message);
    }
  };

  // Mark Food Ready for Rider Pickup
  const handleMarkReady = async (order) => {
    try {
      const updated = await api.updateDeliveryOrderStatus(order.id, 'Ready for Pickup');
      setDbOrders(prev => prev.map(o => o.id === order.id ? updated : o));
      if (soundEnabled) playDingSound();
      setNotice(`🛵 Order #${order.orderNumber} marked Ready for Rider!`);
      if (fetchAllData) fetchAllData(undefined, true);
    } catch (err) {
      setNotice('Error updating status: ' + err.message);
    }
  };

  // Mark Handed Over / Completed
  const handleMarkCompleted = async (order) => {
    try {
      const updated = await api.updateDeliveryOrderStatus(order.id, 'Completed');
      setDbOrders(prev => prev.map(o => o.id === order.id ? updated : o));
      setNotice(`✓ Order #${order.orderNumber} handed over to Rider & Completed.`);
      if (fetchAllData) fetchAllData(undefined, true);
    } catch (err) {
      setNotice('Error updating status: ' + err.message);
    }
  };

  // Open Edit Modal for checking and modifying any delivery order
  const handleOpenEdit = (order) => {
    setEditingOrder(order);
    setEditForm({
      customerName: order.customerName || '',
      customerPhone: order.customerPhone || '',
      deliveryAddress: order.deliveryAddress || '',
      instructions: order.instructions || '',
      riderName: order.riderName || '',
      riderPhone: order.riderPhone || '',
      riderEta: order.riderEta || '',
      prepTimeMinutes: order.prepTimeMinutes || 15,
      status: order.status || 'Pending Acceptance'
    });
  };

  // Save modified order details
  const handleSaveEdit = async () => {
    if (!editingOrder) return;
    try {
      const updated = await api.updateDeliveryOrder(editingOrder.id, editForm);
      setDbOrders(prev => prev.map(o => o.id === editingOrder.id ? updated : o));
      setNotice(`✅ Order #${editingOrder.orderNumber} updated successfully!`);
      setEditingOrder(null);
    } catch (err) {
      setNotice('Error saving order modifications: ' + err.message);
    }
  };

  // Delete an order
  const handleDeleteOrder = async (orderId, orderNum) => {
    if (!window.confirm(`Are you sure you want to delete order #${orderNum}?`)) return;
    try {
      await api.deleteDeliveryOrder(orderId);
      setDbOrders(prev => prev.filter(o => o.id !== orderId));
      setNotice(`Order #${orderNum} deleted.`);
    } catch (err) {
      setNotice('Error deleting order: ' + err.message);
    }
  };

  // Print Thermal Packing Slip
  const handlePrintPackingSlip = (order) => {
    const items = typeof order.itemsJson === 'string' 
      ? JSON.parse(order.itemsJson || '[]') 
      : (order.items || []);

    setActiveReceipt({
      billNumber: order.orderNumber,
      orderNumber: order.orderNumber,
      tableCode: `${order.platform} #${order.orderNumber.replace(/[^0-9]/g, '')}`,
      orderType: 'Delivery',
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      deliveryAddress: order.deliveryAddress,
      deliveryPartner: order.platform,
      riderName: order.riderName,
      riderPhone: order.riderPhone,
      items,
      subtotal: order.subtotal || order.totalAmount,
      discount: 0,
      tax: order.tax || 0,
      total: order.totalAmount,
      paymentMode: order.paymentStatus || 'ONLINE PAID',
      outletName: selectedOutlet?.name || 'Tableflow POS',
      outletAddress: selectedOutlet?.address || '',
      gstin: selectedOutlet?.gstin || ''
    });
    setShowReceiptModal(true);
  };

  // Simulate Incoming Online Order -> Performs real POST /api/delivery-orders to MSSQL
  const handleSimulateOrder = async (platform = 'Zomato') => {
    const isZomato = platform === 'Zomato';
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const mockNames = ['Vikram Singh', 'Pooja Hegde', 'Arjun Kapoor', 'Sneha Reddy', 'Rohan Mehta'];
    const mockAddresses = [
      'Tower B - 1204, Prestige Lakeside, Marathahalli',
      'Flat 201, Sobha Dream Acres, Panathur',
      'House 44, 4th Cross, Koramangala 5th Block',
      'Apartment 304, Brigade Metropolis, Whitefield'
    ];
    const mockDishes = [
      [
        { name: 'Paneer Butter Masala', qty: 1, price: 290, isVeg: true },
        { name: 'Butter Garlic Naan', qty: 3, price: 60, isVeg: true }
      ],
      [
        { name: 'Hyderabadi Chicken Biryani', qty: 2, price: 340, isVeg: false },
        { name: 'Crispy Corn & Water Chestnut', qty: 1, price: 220, isVeg: true }
      ],
      [
        { name: 'Butter Chicken Gravy', qty: 1, price: 360, isVeg: false },
        { name: 'Dal Makhani Gold', qty: 1, price: 260, isVeg: true },
        { name: 'Laccha Paratha', qty: 4, price: 50, isVeg: true }
      ]
    ];

    const chosenDishes = mockDishes[Math.floor(Math.random() * mockDishes.length)];
    const subtotal = chosenDishes.reduce((s, d) => s + (d.price * d.qty), 0);
    const tax = Math.round(subtotal * 0.05 * 100) / 100;
    const total = subtotal + tax + 35;

    const payload = {
      platform,
      orderNumber: `${isZomato ? 'ZOM' : 'SWG'}-${randNum}`,
      customerName: mockNames[Math.floor(Math.random() * mockNames.length)],
      customerPhone: `+91 ${Math.floor(9000000000 + Math.random() * 999999999)}`,
      deliveryAddress: mockAddresses[Math.floor(Math.random() * mockAddresses.length)],
      instructions: isZomato ? 'Contactless delivery, drop at security' : 'Please provide cutlery and tissue',
      itemsJson: JSON.stringify(chosenDishes),
      subtotal,
      tax,
      deliveryFee: 35,
      totalAmount: total,
      paymentStatus: 'PAID (Online Gateway)',
      riderName: 'Delivery Partner Assigned',
      riderPhone: '+91 98' + Math.floor(10000000 + Math.random() * 90000000),
      riderEta: `${Math.floor(8 + Math.random() * 12)} mins`,
      prepTimeMinutes: 15,
      status: 'Pending Acceptance',
      outletId: activeOutletId
    };

    try {
      const created = await api.createDeliveryOrder(payload);
      setDbOrders(prev => [created, ...prev]);
      if (soundEnabled) playDingSound();
      setNotice(`🔔 New ${platform} Order #${created.orderNumber} received!`);
      setOnlineTab('New');

      if (autoAccept) {
        handleAcceptOnlineOrder(created, 15);
      }
    } catch (err) {
      setNotice('Error placing online order: ' + err.message);
    }
  };

  return (
    <div className="online-delivery-hub" style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
      {/* Integrations Header Bar */}
      <div 
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '12px 18px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Radio size={15} color="#176b52" />
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>Online Delivery Channels</span>
          </div>

          {/* Zomato Pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 700
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
            🔴 ZOMATO <span style={{ fontSize: '9px', color: '#16a34a', background: '#dcfce7', padding: '1px 5px', borderRadius: '10px' }}>Active API</span>
          </div>

          {/* Swiggy Pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#fff7ed',
            border: '1px solid #fed7aa',
            color: '#c2410c',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 700
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#f97316', display: 'inline-block' }} />
            🟠 SWIGGY <span style={{ fontSize: '9px', color: '#16a34a', background: '#dcfce7', padding: '1px 5px', borderRadius: '10px' }}>Active API</span>
          </div>

          {/* Refresh button */}
          <button
            onClick={loadDeliveryOrders}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '10px',
              fontWeight: 700,
              color: '#475569',
              cursor: 'pointer'
            }}
            title="Reload live orders"
          >
            <RefreshCw size={11} className={loading ? 'spin' : ''} /> Refresh
          </button>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '11px',
              fontWeight: 600,
              color: soundEnabled ? '#0f172a' : '#94a3b8',
              cursor: 'pointer'
            }}
          >
            {soundEnabled ? <Volume2 size={14} color="#16a34a" /> : <VolumeX size={14} />} Sound {soundEnabled ? 'ON' : 'OFF'}
          </button>

          {/* Auto-Accept Toggle */}
          <button
            onClick={() => {
              setAutoAccept(!autoAccept);
              setNotice(autoAccept ? 'Auto-Accept disabled.' : '⚡ Auto-Accept enabled: Incoming orders will be automatically sent to Kitchen!');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              border: autoAccept ? '1px solid #16a34a' : '1px solid #cbd5e1',
              background: autoAccept ? '#dcfce7' : '#ffffff',
              color: autoAccept ? '#166534' : '#475569',
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Zap size={13} color={autoAccept ? '#16a34a' : '#64748b'} /> Auto-Accept: {autoAccept ? 'ON' : 'OFF'}
          </button>

          {/* Test Buttons - Inserts row into DB */}
          <button
            onClick={() => handleSimulateOrder('Zomato')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              border: '1px solid #fecaca',
              background: '#dc2626',
              color: '#ffffff',
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            + New Zomato Order
          </button>

          <button
            onClick={() => handleSimulateOrder('Swiggy')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              border: '1px solid #fed7aa',
              background: '#ea580c',
              color: '#ffffff',
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            + New Swiggy Order
          </button>

          {onSwitchToManualCallOrder && (
            <button
              onClick={onSwitchToManualCallOrder}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                border: '1px dashed #176b52',
                background: '#f0fdf4',
                color: '#166534',
                borderRadius: '6px',
                padding: '6px 11px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Phone size={13} /> Punch Phone Order
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', alignItems: 'center' }}>
        <button
          onClick={() => setOnlineTab('New')}
          style={{
            border: 0,
            background: onlineTab === 'New' ? '#dc2626' : '#f1f5f9',
            color: onlineTab === 'New' ? '#ffffff' : '#475569',
            borderRadius: '8px',
            padding: '7px 14px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>🔔 New Incoming</span>
          <span style={{
            background: onlineTab === 'New' ? '#ffffff' : '#dc2626',
            color: onlineTab === 'New' ? '#dc2626' : '#ffffff',
            borderRadius: '10px',
            padding: '1px 7px',
            fontSize: '10px'
          }}>
            {pendingOrders.length}
          </span>
        </button>

        <button
          onClick={() => setOnlineTab('In Kitchen')}
          style={{
            border: 0,
            background: onlineTab === 'In Kitchen' ? '#0284c7' : '#f1f5f9',
            color: onlineTab === 'In Kitchen' ? '#ffffff' : '#475569',
            borderRadius: '8px',
            padding: '7px 14px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>🍳 Preparing in Kitchen</span>
          <span style={{
            background: onlineTab === 'In Kitchen' ? '#ffffff' : '#0284c7',
            color: onlineTab === 'In Kitchen' ? '#0284c7' : '#ffffff',
            borderRadius: '10px',
            padding: '1px 7px',
            fontSize: '10px'
          }}>
            {preparingOrders.length}
          </span>
        </button>

        <button
          onClick={() => setOnlineTab('Ready')}
          style={{
            border: 0,
            background: onlineTab === 'Ready' ? '#16a34a' : '#f1f5f9',
            color: onlineTab === 'Ready' ? '#ffffff' : '#475569',
            borderRadius: '8px',
            padding: '7px 14px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>🛵 Food Ready / Rider Pickup</span>
          <span style={{
            background: onlineTab === 'Ready' ? '#ffffff' : '#16a34a',
            color: onlineTab === 'Ready' ? '#16a34a' : '#ffffff',
            borderRadius: '10px',
            padding: '1px 7px',
            fontSize: '10px'
          }}>
            {readyOrders.length}
          </span>
        </button>

        <button
          onClick={() => setOnlineTab('Completed')}
          style={{
            border: 0,
            background: onlineTab === 'Completed' ? '#475569' : '#f1f5f9',
            color: onlineTab === 'Completed' ? '#ffffff' : '#475569',
            borderRadius: '8px',
            padding: '7px 14px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>✓ Dispatched ({completedOrders.length})</span>
        </button>

        <button
          onClick={() => setOnlineTab('All')}
          style={{
            border: 0,
            background: onlineTab === 'All' ? '#176b52' : '#f1f5f9',
            color: onlineTab === 'All' ? '#ffffff' : '#475569',
            borderRadius: '8px',
            padding: '7px 14px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          All Orders ({dbOrders.length})
        </button>
      </div>

      {/* Orders List Container */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '14px' }}>
        {dbOrders
          .filter(order => {
            if (onlineTab === 'New') return order.status === 'Pending Acceptance';
            if (onlineTab === 'In Kitchen') return order.status === 'In Kitchen' || order.status === 'Preparing' || order.status === 'Accepted';
            if (onlineTab === 'Ready') return order.status === 'Ready for Pickup' || order.status === 'Ready to Serve';
            if (onlineTab === 'Completed') return order.status === 'Completed' || order.status === 'Dispatched' || order.status === 'Delivered';
            return true;
          })
          .map(order => {
            const items = typeof order.itemsJson === 'string' 
              ? JSON.parse(order.itemsJson || '[]') 
              : (order.items || []);

            const isPending = order.status === 'Pending Acceptance';
            const isKitchen = order.status === 'In Kitchen' || order.status === 'Preparing' || order.status === 'Accepted';
            const isReady = order.status === 'Ready for Pickup' || order.status === 'Ready to Serve';
            const isDone = order.status === 'Completed' || order.status === 'Dispatched' || order.status === 'Delivered';

            return (
              <div 
                key={order.id}
                style={{
                  background: '#ffffff',
                  border: isPending ? '2px solid #fecaca' : isReady ? '2px solid #86efac' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  position: 'relative'
                }}
              >
                {/* Top Bar with Platform Badge & DB ID */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span 
                      style={{
                        background: order.platform === 'Zomato' ? '#dc2626' : '#ea580c',
                        color: '#ffffff',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontWeight: 800,
                        fontSize: '11px'
                      }}
                    >
                      {order.platform === 'Zomato' ? '🔴 ZOMATO' : '🟠 SWIGGY'}
                    </span>
                    <strong style={{ fontSize: '13px', color: '#0f172a' }}>{order.orderNumber}</strong>
                    <span style={{ fontSize: '9px', color: '#94a3b8', background: '#f1f5f9', padding: '1px 5px', borderRadius: '4px' }}>
                      #{order.id}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      onClick={() => handleOpenEdit(order)}
                      style={{
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        color: '#475569',
                        borderRadius: '5px',
                        padding: '3px 7px',
                        fontSize: '10px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                      title="Edit order details"
                    >
                      <Edit2 size={11} /> Modify
                    </button>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>
                      {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                    </span>
                  </div>
                </div>

                {/* Customer & Address Details */}
                <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '8px', fontSize: '11px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#1e293b' }}>
                    <span>{order.customerName}</span>
                    <span style={{ color: '#0284c7' }}>{order.customerPhone}</span>
                  </div>
                  <div style={{ color: '#475569', fontSize: '10px', marginTop: '3px', display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                    <MapPin size={12} style={{ flexShrink: 0, marginTop: '2px', color: '#64748b' }} />
                    <span>{order.deliveryAddress}</span>
                  </div>
                  {order.instructions && (
                    <div style={{ marginTop: '4px', fontSize: '10px', color: '#b45309', background: '#fef3c7', padding: '3px 6px', borderRadius: '4px' }}>
                      <b>Instructions:</b> {order.instructions}
                    </div>
                  )}
                </div>

                {/* Items List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px dashed #e2e8f0', borderBottom: '1px dashed #e2e8f0', padding: '8px 0' }}>
                  {items.map((it, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className={it.isVeg ? 'veg-tag' : 'non-veg-tag'} style={{ width: '8px', height: '8px' }} />
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{it.name}</span>
                        <b style={{ color: '#0f172a' }}>× {it.qty}</b>
                      </div>
                      <span style={{ color: '#64748b' }}>₹{it.price * it.qty}</span>
                    </div>
                  ))}
                </div>

                {/* Amount, Rider, and Current Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: 700 }}>✓ {order.paymentStatus}</span>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>
                      🛵 {order.riderName} ({order.riderEta || 'ETA pending'})
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>Status: <b style={{ color: '#0f172a' }}>{order.status}</b></span>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#176b52' }}>₹{order.totalAmount}</div>
                  </div>
                </div>

                {/* Contextual Actions */}
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                  {isPending && (
                    <>
                      <button
                        onClick={() => handleAcceptOnlineOrder(order, 15)}
                        style={{
                          flex: 1,
                          border: 0,
                          background: '#16a34a',
                          color: '#ffffff',
                          borderRadius: '7px',
                          padding: '9px 8px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px'
                        }}
                      >
                        <Check size={14} /> Accept (15m)
                      </button>

                      <button
                        onClick={() => handleAcceptOnlineOrder(order, 25)}
                        style={{
                          flex: 1,
                          border: 0,
                          background: '#0284c7',
                          color: '#ffffff',
                          borderRadius: '7px',
                          padding: '9px 8px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px'
                        }}
                      >
                        <Check size={14} /> Accept (25m)
                      </button>

                      <button
                        onClick={() => handleRejectOnlineOrder(order.id, order.platform)}
                        style={{
                          border: '1px solid #fecaca',
                          background: '#fef2f2',
                          color: '#dc2626',
                          borderRadius: '7px',
                          padding: '9px 10px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                        title="Reject this order"
                      >
                        <X size={14} />
                      </button>
                    </>
                  )}

                  {isKitchen && (
                    <>
                      <button
                        onClick={() => handlePrintPackingSlip(order)}
                        style={{
                          flex: 1,
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          color: '#334155',
                          borderRadius: '7px',
                          padding: '8px 10px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}
                      >
                        <Printer size={13} /> Print Slip
                      </button>

                      <button
                        onClick={() => handleMarkReady(order)}
                        style={{
                          flex: 1.2,
                          border: 0,
                          background: '#16a34a',
                          color: '#ffffff',
                          borderRadius: '7px',
                          padding: '8px 12px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}
                      >
                        <CheckCircle2 size={13} /> Food Ready
                      </button>
                    </>
                  )}

                  {isReady && (
                    <>
                      <button
                        onClick={() => handlePrintPackingSlip(order)}
                        style={{
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          color: '#334155',
                          borderRadius: '7px',
                          padding: '8px 10px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <Printer size={13} /> Print Slip
                      </button>

                      <button
                        onClick={() => handleMarkCompleted(order)}
                        style={{
                          flex: 1,
                          border: 0,
                          background: '#166534',
                          color: '#ffffff',
                          borderRadius: '7px',
                          padding: '8px 14px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px'
                        }}
                      >
                        <Check size={13} /> Handover to Rider (Done)
                      </button>
                    </>
                  )}

                  {isDone && (
                    <button
                      onClick={() => handlePrintPackingSlip(order)}
                      style={{
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        color: '#475569',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        fontSize: '10px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <Printer size={12} /> Reprint Thermal Slip
                    </button>
                  )}
                </div>
              </div>
            );
          })}

        {/* Empty state */}
        {dbOrders.length === 0 && (
          <div 
            style={{ 
              gridColumn: '1 / -1', 
              background: '#ffffff', 
              border: '1px dashed #cbd5e1', 
              borderRadius: '12px', 
              padding: '40px 20px', 
              textAlign: 'center', 
              color: '#64748b' 
            }}
          >
            <ShoppingBag size={34} style={{ color: '#cbd5e1', marginBottom: '8px' }} />
            <div style={{ fontWeight: 700, fontSize: '13px', color: '#334155' }}>
              No online delivery orders found
            </div>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: '4px 0 12px 0' }}>
              Click on <b>+ New Zomato Order</b> or <b>+ New Swiggy Order</b> above to receive orders live!
            </p>
          </div>
        )}
      </div>

      {/* EDIT / MODIFY ORDER MODAL */}
      {editingOrder && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 100,
            padding: '20px'
          }}
        >
          <div 
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '22px',
              width: 'min(520px, 100%)',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>
                  Modify Order: {editingOrder.orderNumber}
                </h3>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  Platform: {editingOrder.platform} · Order #{editingOrder.id}
                </span>
              </div>
              <button 
                onClick={() => setEditingOrder(null)}
                style={{ border: 0, background: 'transparent', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>CUSTOMER NAME</label>
                  <input
                    value={editForm.customerName}
                    onChange={e => setEditForm({ ...editForm, customerName: e.target.value })}
                    style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '11px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>MOBILE NUMBER</label>
                  <input
                    value={editForm.customerPhone}
                    onChange={e => setEditForm({ ...editForm, customerPhone: e.target.value })}
                    style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '11px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '10px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>DELIVERY ADDRESS</label>
                <textarea
                  rows={2}
                  value={editForm.deliveryAddress}
                  onChange={e => setEditForm({ ...editForm, deliveryAddress: e.target.value })}
                  style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '11px', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '10px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>SPECIAL INSTRUCTIONS</label>
                <input
                  value={editForm.instructions}
                  onChange={e => setEditForm({ ...editForm, instructions: e.target.value })}
                  style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '11px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>RIDER NAME</label>
                  <input
                    value={editForm.riderName}
                    onChange={e => setEditForm({ ...editForm, riderName: e.target.value })}
                    style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '11px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>RIDER PHONE</label>
                  <input
                    value={editForm.riderPhone}
                    onChange={e => setEditForm({ ...editForm, riderPhone: e.target.value })}
                    style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '11px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>ORDER STATUS</label>
                  <select
                    value={editForm.status}
                    onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                    style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '11px', boxSizing: 'border-box' }}
                  >
                    <option value="Pending Acceptance">Pending Acceptance</option>
                    <option value="In Kitchen">In Kitchen</option>
                    <option value="Ready for Pickup">Ready for Pickup</option>
                    <option value="Completed">Completed</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>PREP TIME (MINS)</label>
                  <input
                    type="number"
                    value={editForm.prepTimeMinutes}
                    onChange={e => setEditForm({ ...editForm, prepTimeMinutes: parseInt(e.target.value) || 15 })}
                    style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '11px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
              <button
                onClick={() => handleDeleteOrder(editingOrder.id, editingOrder.orderNumber)}
                style={{
                  border: '1px solid #fecaca',
                  background: '#fef2f2',
                  color: '#dc2626',
                  borderRadius: '6px',
                  padding: '7px 12px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Trash2 size={12} /> Delete Order
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setEditingOrder(null)}
                  style={{
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    borderRadius: '6px',
                    padding: '7px 14px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  style={{
                    border: 0,
                    background: '#176b52',
                    color: '#ffffff',
                    borderRadius: '6px',
                    padding: '7px 16px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <Save size={13} /> Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
