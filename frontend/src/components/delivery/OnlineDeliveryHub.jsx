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
  ExternalLink
} from 'lucide-react';
import * as api from '../../services/api';

// Native Browser Audio Beep for Incoming Orders
function playDingSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.55);
  } catch {}
}

const SAMPLE_ONLINE_ORDERS = [
  {
    id: 'zom-101',
    platform: 'Zomato',
    orderNumber: 'ZOM-4892',
    placedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    customerName: 'Rahul Sharma',
    customerPhone: '+91 98765 43210',
    deliveryAddress: 'Flat 402, Oakwood Heights, Indiranagar, Bengaluru',
    instructions: 'Don\'t ring bell, baby sleeping. Leave at door.',
    items: [
      { name: 'Paneer Butter Masala', qty: 1, price: 290, isVeg: true },
      { name: 'Butter Garlic Naan', qty: 2, price: 60, isVeg: true }
    ],
    subtotal: 410,
    tax: 20.5,
    deliveryFee: 30,
    total: 460.5,
    paymentStatus: 'PAID (UPI)',
    riderName: 'Suresh Kumar',
    riderPhone: '+91 98450 11223',
    riderEta: '12 mins',
    status: 'Pending Acceptance'
  },
  {
    id: 'swg-202',
    platform: 'Swiggy',
    orderNumber: 'SWG-7319',
    placedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    customerName: 'Ananya Verma',
    customerPhone: '+91 98111 22334',
    deliveryAddress: 'Villa 12, Palm Meadows, Whitefield, Bengaluru',
    instructions: 'Send extra green chutney and onions please.',
    items: [
      { name: 'Butter Chicken Gravy', qty: 1, price: 360, isVeg: false },
      { name: 'Hyderabadi Chicken Biryani', qty: 1, price: 340, isVeg: false }
    ],
    subtotal: 700,
    tax: 35,
    deliveryFee: 40,
    total: 775,
    paymentStatus: 'PAID (Card)',
    riderName: 'Manoj Patel',
    riderPhone: '+91 97312 44556',
    riderEta: '8 mins',
    status: 'Pending Acceptance'
  }
];

export default function OnlineDeliveryHub({
  orders,
  setOrders,
  selectedOutlet,
  setNotice,
  setActiveReceipt,
  setShowReceiptModal,
  onSwitchToManualCallOrder
}) {
  const [onlineTab, setOnlineTab] = useState('New'); // 'New' | 'In Kitchen' | 'Ready' | 'Completed' | 'All'
  const [pendingOrders, setPendingOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('pos_pending_online_orders');
      return saved ? JSON.parse(saved) : SAMPLE_ONLINE_ORDERS;
    } catch {
      return SAMPLE_ONLINE_ORDERS;
    }
  });
  const [autoAccept, setAutoAccept] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Sync pending orders to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pos_pending_online_orders', JSON.stringify(pendingOrders));
    } catch {}
  }, [pendingOrders]);

  // Active delivery orders from database (Already accepted & in kitchen / completed)
  const dbDeliveryOrders = (orders || []).filter(o => o.orderType === 'Delivery');

  const pendingCount = pendingOrders.filter(o => o.status === 'Pending Acceptance').length;
  const preparingCount = dbDeliveryOrders.filter(o => o.status === 'In Kitchen' || o.status === 'Preparing').length;
  const readyCount = dbDeliveryOrders.filter(o => o.status === 'Ready to Serve').length;
  const completedCount = dbDeliveryOrders.filter(o => o.status === 'Completed' || o.status === 'Delivered').length;

  // Accept Online Order -> Dispatches to DB & Kitchen KOT
  const handleAcceptOnlineOrder = async (order, prepTimeMinutes = 15) => {
    const oid = selectedOutlet?.id || 1;
    const formattedNotes = `[${order.platform.toUpperCase()} DELIVERY] Drop: ${order.deliveryAddress} | Rider: ${order.riderName || 'Assigned'} (${order.riderPhone || 'N/A'})${order.instructions ? ` | Note: ${order.instructions}` : ''} | Prep: ${prepTimeMinutes}m`;

    const orderPayload = {
      orderNumber: order.orderNumber,
      tableCode: `${order.platform} #${order.orderNumber.replace(/[^0-9]/g, '') || Math.floor(1000 + Math.random() * 9000)}`,
      orderType: 'Delivery',
      status: 'In Kitchen',
      itemsJson: JSON.stringify(order.items),
      subtotal: order.subtotal || order.items.reduce((s, i) => s + (i.price * i.qty), 0),
      discount: 0,
      tax: order.tax || 0,
      total: order.total || order.subtotal || 0,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      notes: formattedNotes,
      outletId: oid
    };

    try {
      const savedOrder = await api.createOrder(orderPayload);
      setOrders(prev => [{ ...savedOrder, items: order.items }, ...prev]);
      
      // Remove from pending queue
      setPendingOrders(prev => prev.filter(o => o.id !== order.id));

      if (soundEnabled) playDingSound();
      setNotice(`✅ ${order.platform} Order #${order.orderNumber} Accepted! KOT dispatched to Kitchen (${prepTimeMinutes} mins prep).`);
      setOnlineTab('In Kitchen');
    } catch (err) {
      setNotice('Error accepting order: ' + err.message);
    }
  };

  // Reject Online Order
  const handleRejectOnlineOrder = (orderId, platform) => {
    setPendingOrders(prev => prev.filter(o => o.id !== orderId));
    setNotice(`❌ ${platform} Order rejected.`);
  };

  // Mark Ready for Rider Pickup
  const handleMarkReady = async (orderId, orderNum) => {
    try {
      await api.updateOrderStatus(orderId, 'Ready to Serve');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Ready to Serve' } : o));
      if (soundEnabled) playDingSound();
      setNotice(`🛵 Order #${orderNum} marked Ready for Rider Pickup!`);
    } catch (err) {
      setNotice('Error updating status: ' + err.message);
    }
  };

  // Mark Handed Over / Completed
  const handleMarkCompleted = async (orderId, orderNum) => {
    try {
      await api.updateOrderStatus(orderId, 'Completed');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Completed' } : o));
      setNotice(`✓ Order #${orderNum} handed over to Rider & Completed.`);
    } catch (err) {
      setNotice('Error updating status: ' + err.message);
    }
  };

  // Print Thermal Packing Slip
  const handlePrintPackingSlip = (order) => {
    const items = Array.isArray(order.items) 
      ? order.items 
      : typeof order.itemsJson === 'string' 
      ? JSON.parse(order.itemsJson || '[]') 
      : [];

    setActiveReceipt({
      billNumber: order.orderNumber,
      orderNumber: order.orderNumber,
      tableCode: order.tableCode,
      orderType: 'Delivery',
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      deliveryAddress: order.notes?.includes('Drop:') ? order.notes.split('Drop:')[1]?.split('|')[0]?.trim() : order.deliveryAddress,
      deliveryPartner: order.notes?.includes('SWIGGY') ? 'Swiggy' : order.notes?.includes('ZOMATO') ? 'Zomato' : 'Online Partner',
      riderName: order.riderName,
      riderPhone: order.riderPhone,
      items,
      subtotal: order.subtotal || order.total,
      discount: order.discount || 0,
      tax: order.tax || 0,
      total: order.total || order.subtotal,
      paymentMode: 'ONLINE PAID',
      outletName: selectedOutlet?.name || 'Tableflow POS',
      outletAddress: selectedOutlet?.address || '',
      gstin: selectedOutlet?.gstin || ''
    });
    setShowReceiptModal(true);
  };

  // Simulate Incoming Online Order from Zomato or Swiggy
  const handleSimulateOrder = (platform = 'Zomato') => {
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

    const newSimulated = {
      id: `${platform.toLowerCase()}-${Date.now()}`,
      platform,
      orderNumber: `${isZomato ? 'ZOM' : 'SWG'}-${randNum}`,
      placedAt: new Date().toISOString(),
      customerName: mockNames[Math.floor(Math.random() * mockNames.length)],
      customerPhone: `+91 ${Math.floor(9000000000 + Math.random() * 999999999)}`,
      deliveryAddress: mockAddresses[Math.floor(Math.random() * mockAddresses.length)],
      instructions: isZomato ? 'Contactless delivery, drop at security' : 'Please provide cutlery and tissue',
      items: chosenDishes,
      subtotal,
      tax,
      deliveryFee: 35,
      total,
      paymentStatus: 'PAID (Online Gateway)',
      riderName: 'Delivery Partner Assigned',
      riderPhone: '+91 98' + Math.floor(10000000 + Math.random() * 90000000),
      riderEta: `${Math.floor(8 + Math.random() * 12)} mins`,
      status: 'Pending Acceptance'
    };

    setPendingOrders(prev => [newSimulated, ...prev]);
    if (soundEnabled) playDingSound();
    setNotice(`🔔 BEEP! New Incoming ${platform} Order #${newSimulated.orderNumber} received!`);
    setOnlineTab('New');

    if (autoAccept) {
      handleAcceptOnlineOrder(newSimulated, 15);
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>Live Aggregators:</span>
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
            🔴 ZOMATO <span style={{ fontSize: '9px', color: '#16a34a', background: '#dcfce7', padding: '1px 5px', borderRadius: '10px' }}>Active</span>
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
            🟠 SWIGGY <span style={{ fontSize: '9px', color: '#16a34a', background: '#dcfce7', padding: '1px 5px', borderRadius: '10px' }}>Active</span>
          </div>

          {/* Dunzo / ONDC Pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#15803d',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 700
          }}>
            <Zap size={12} /> ONDC / UrbanPiper <span style={{ fontSize: '9px', color: '#15803d', background: '#dcfce7', padding: '1px 5px', borderRadius: '10px' }}>Connected</span>
          </div>
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
            title={soundEnabled ? 'Mute incoming order sound' : 'Enable incoming order sound'}
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

          {/* Simulator Dropdown / Buttons */}
          <div style={{ display: 'flex', gap: '4px' }}>
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
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(220,38,38,0.2)'
              }}
            >
              + Test Zomato Order
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
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(234,88,12,0.2)'
              }}
            >
              + Test Swiggy Order
            </button>
          </div>

          {/* Switch to manual call order */}
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
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
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
            {pendingCount}
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
            {preparingCount}
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
          <span>🛵 Food Ready / Rider Assigned</span>
          <span style={{
            background: onlineTab === 'Ready' ? '#ffffff' : '#16a34a',
            color: onlineTab === 'Ready' ? '#16a34a' : '#ffffff',
            borderRadius: '10px',
            padding: '1px 7px',
            fontSize: '10px'
          }}>
            {readyCount}
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
          <span>✓ Dispatched ({completedCount})</span>
        </button>
      </div>

      {/* Orders List Container */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '14px' }}>
        {/* NEW INCOMING ORDERS (Pending Acceptance) */}
        {(onlineTab === 'New' || onlineTab === 'All') && pendingOrders.map(order => (
          <div 
            key={order.id}
            style={{
              background: '#ffffff',
              border: '2px solid #fecaca',
              borderRadius: '12px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              boxShadow: '0 4px 12px rgba(220,38,38,0.06)',
              position: 'relative'
            }}
          >
            {/* Top Bar */}
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
              </div>
              <span style={{ fontSize: '10px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={11} /> {new Date(order.placedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* Customer & Address */}
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
              {order.items.map((it, idx) => (
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

            {/* Total & Rider Status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
              <div>
                <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: 700 }}>✓ {order.paymentStatus}</span>
                <div style={{ fontSize: '10px', color: '#64748b' }}>
                  🛵 {order.riderName} ({order.riderEta})
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '10px', color: '#64748b' }}>Bill Amount:</span>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#176b52' }}>₹{order.total}</div>
              </div>
            </div>

            {/* Accept / Reject Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 60px', gap: '6px', marginTop: '4px' }}>
              <button
                onClick={() => handleAcceptOnlineOrder(order, 15)}
                style={{
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
                  padding: '9px 6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Reject this order"
              >
                <X size={14} /> Reject
              </button>
            </div>
          </div>
        ))}

        {/* PREPARING / IN KITCHEN ORDERS */}
        {(onlineTab === 'In Kitchen' || onlineTab === 'All') && dbDeliveryOrders
          .filter(o => o.status === 'In Kitchen' || o.status === 'Preparing')
          .map(order => {
            const items = Array.isArray(order.items) 
              ? order.items 
              : typeof order.itemsJson === 'string' 
              ? JSON.parse(order.itemsJson || '[]') 
              : [];

            const isZomato = (order.tableCode || '').toLowerCase().includes('zomato') || (order.notes || '').includes('ZOMATO');
            const isSwiggy = (order.tableCode || '').toLowerCase().includes('swiggy') || (order.notes || '').includes('SWIGGY');

            return (
              <div 
                key={order.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #bae6fd',
                  borderRadius: '12px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  boxShadow: '0 2px 8px rgba(2,132,199,0.06)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span 
                      style={{
                        background: isZomato ? '#dc2626' : isSwiggy ? '#ea580c' : '#0284c7',
                        color: '#ffffff',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontWeight: 800,
                        fontSize: '11px'
                      }}
                    >
                      {isZomato ? '🔴 ZOMATO' : isSwiggy ? '🟠 SWIGGY' : '🛵 DELIVERY'}
                    </span>
                    <strong style={{ fontSize: '13px', color: '#0f172a' }}>{order.orderNumber}</strong>
                  </div>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: '#0284c7', background: '#e0f2fe', padding: '2px 7px', borderRadius: '10px' }}>
                    🍳 In Kitchen
                  </span>
                </div>

                <div style={{ fontSize: '11px', color: '#475569' }}>
                  <div style={{ fontWeight: 700, color: '#1e293b' }}>Customer: {order.customerName} ({order.customerPhone})</div>
                  {order.notes && (
                    <div style={{ fontSize: '10px', color: '#0369a1', background: '#f0f9ff', padding: '4px 6px', borderRadius: '4px', marginTop: '4px' }}>
                      {order.notes}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', borderTop: '1px dashed #e2e8f0', borderBottom: '1px dashed #e2e8f0', padding: '6px 0' }}>
                  {items.map((it, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                      <span style={{ color: '#1e293b', fontWeight: 600 }}>{it.name}</span>
                      <b>× {it.qty}</b>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#176b52' }}>₹{order.total || order.subtotal}</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handlePrintPackingSlip(order)}
                      style={{
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        color: '#334155',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Printer size={13} /> Print Slip
                    </button>

                    <button
                      onClick={() => handleMarkReady(order.id, order.orderNumber)}
                      style={{
                        border: 0,
                        background: '#16a34a',
                        color: '#ffffff',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <CheckCircle2 size={13} /> Food Ready
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

        {/* FOOD READY / RIDER ASSIGNED */}
        {(onlineTab === 'Ready' || onlineTab === 'All') && dbDeliveryOrders
          .filter(o => o.status === 'Ready to Serve')
          .map(order => {
            return (
              <div 
                key={order.id}
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #86efac',
                  borderRadius: '12px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ background: '#16a34a', color: '#ffffff', padding: '3px 8px', borderRadius: '6px', fontWeight: 800, fontSize: '11px' }}>
                      🛵 FOOD READY
                    </span>
                    <strong style={{ fontSize: '13px' }}>{order.orderNumber}</strong>
                  </div>
                  <span style={{ fontSize: '10px', color: '#166534', fontWeight: 700 }}>Awaiting Rider Pickup</span>
                </div>

                <div style={{ fontSize: '11px', color: '#334155' }}>
                  <div><strong>Customer:</strong> {order.customerName} ({order.customerPhone})</div>
                  {order.notes && <div style={{ fontSize: '10px', marginTop: '3px', color: '#166534' }}>{order.notes}</div>}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <button
                    onClick={() => handlePrintPackingSlip(order)}
                    style={{
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#334155',
                      borderRadius: '6px',
                      padding: '6px 10px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <Printer size={13} /> Print Slip
                  </button>

                  <button
                    onClick={() => handleMarkCompleted(order.id, order.orderNumber)}
                    style={{
                      border: 0,
                      background: '#166534',
                      color: '#ffffff',
                      borderRadius: '6px',
                      padding: '7px 14px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Check size={13} /> Handover to Rider (Done)
                  </button>
                </div>
              </div>
            );
          })}

        {/* COMPLETED / DISPATCHED */}
        {onlineTab === 'Completed' && dbDeliveryOrders
          .filter(o => o.status === 'Completed' || o.status === 'Delivered')
          .map(order => (
            <div 
              key={order.id}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '12px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '12px', color: '#1e293b' }}>
                  {order.orderNumber} · {order.customerName}
                </div>
                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                  {order.tableCode} · ₹{order.total || order.subtotal} · Delivered
                </div>
              </div>
              <button
                onClick={() => handlePrintPackingSlip(order)}
                style={{
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  borderRadius: '5px',
                  padding: '5px 8px',
                  fontSize: '10px',
                  cursor: 'pointer'
                }}
              >
                Receipt
              </button>
            </div>
          ))}

        {/* Empty state when no orders in active tab */}
        {((onlineTab === 'New' && pendingCount === 0) ||
          (onlineTab === 'In Kitchen' && preparingCount === 0) ||
          (onlineTab === 'Ready' && readyCount === 0) ||
          (onlineTab === 'Completed' && completedCount === 0)) && (
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
              No {onlineTab} delivery orders right now
            </div>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: '4px 0 12px 0' }}>
              Click on <b>+ Test Zomato Order</b> or <b>+ Test Swiggy Order</b> above to simulate an incoming online order!
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <button
                onClick={() => handleSimulateOrder('Zomato')}
                style={{
                  border: '1px solid #fecaca',
                  background: '#dc2626',
                  color: '#ffffff',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Simulate Zomato Order
              </button>
              <button
                onClick={() => handleSimulateOrder('Swiggy')}
                style={{
                  border: '1px solid #fed7aa',
                  background: '#ea580c',
                  color: '#ffffff',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Simulate Swiggy Order
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
