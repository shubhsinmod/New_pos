const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const FRAMES_DIR = path.join(__dirname, 'demo_frames');
if (!fs.existsSync(FRAMES_DIR)) {
  fs.mkdirSync(FRAMES_DIR, { recursive: true });
} else {
  fs.readdirSync(FRAMES_DIR).forEach(f => fs.unlinkSync(path.join(FRAMES_DIR, f)));
}

let frameIndex = 0;

async function saveFrame(page, count = 1) {
  for (let i = 0; i < count; i++) {
    frameIndex++;
    const filename = `frame_${String(frameIndex).padStart(5, '0')}.jpg`;
    await page.screenshot({
      path: path.join(FRAMES_DIR, filename),
      type: 'jpeg',
      quality: 85
    });
  }
}

async function injectOverlays(page) {
  await page.evaluate(() => {
    if (document.getElementById('demo-cursor')) return;

    // Inject Custom Pointer Cursor
    const cursor = document.createElement('div');
    cursor.id = 'demo-cursor';
    cursor.innerHTML = `
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" style="filter: drop-shadow(0 2px 6px rgba(0,0,0,0.45));">
        <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.85a.5.5 0 0 0-.85.36z" fill="#0f172a" stroke="#ffffff" stroke-width="1.8" stroke-linejoin="round"/>
      </svg>
      <div id="demo-ripple" style="position: absolute; top: 0; left: 0; width: 38px; height: 38px; border-radius: 50%; border: 3px solid #10b981; opacity: 0; transform: translate(-15px, -15px) scale(0.3); pointer-events: none; transition: transform 0.35s ease-out, opacity 0.35s ease-out;"></div>
    `;
    cursor.style.position = 'fixed';
    cursor.style.top = '0px';
    cursor.style.left = '0px';
    cursor.style.zIndex = '999999';
    cursor.style.pointerEvents = 'none';
    cursor.style.transform = 'translate(960px, 540px)';
    cursor.style.transition = 'transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1)';
    document.body.appendChild(cursor);

    // Inject Floating Feature Spotlight Banner
    const banner = document.createElement('div');
    banner.id = 'demo-banner';
    banner.style.position = 'fixed';
    banner.style.bottom = '26px';
    banner.style.left = '50%';
    banner.style.transform = 'translateX(-50%)';
    banner.style.background = 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)';
    banner.style.backdropFilter = 'blur(14px)';
    banner.style.color = '#ffffff';
    banner.style.padding = '12px 28px';
    banner.style.borderRadius = '50px';
    banner.style.boxShadow = '0 16px 45px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.18)';
    banner.style.zIndex = '999998';
    banner.style.display = 'flex';
    banner.style.alignItems = 'center';
    banner.style.gap = '14px';
    banner.style.fontFamily = 'Inter, -apple-system, sans-serif';
    banner.style.transition = 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)';
    banner.innerHTML = `
      <span id="banner-tag" style="background: #10b981; color: #ffffff; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">TABLEFLOW POS</span>
      <span id="banner-title" style="font-size: 15px; font-weight: 700; color: #f8fafc; letter-spacing: 0.2px;">Complete Restaurant Workflow Demo</span>
    `;
    document.body.appendChild(banner);
  });
}

async function updateBanner(page, tag, title) {
  await page.evaluate((t, txt) => {
    const banner = document.getElementById('demo-banner');
    const tagEl = document.getElementById('banner-tag');
    const titleEl = document.getElementById('banner-title');
    if (tagEl) tagEl.innerText = t;
    if (titleEl) titleEl.innerText = txt;
    if (banner) {
      banner.style.transform = 'translateX(-50%) scale(1.04)';
      setTimeout(() => {
        banner.style.transform = 'translateX(-50%) scale(1)';
      }, 180);
    }
  }, tag, title);
}

async function moveCursor(page, x, y, steps = 4) {
  for (let s = 1; s <= steps; s++) {
    await page.evaluate((tx, ty) => {
      const cursor = document.getElementById('demo-cursor');
      if (cursor) cursor.style.transform = `translate(${tx}px, ${ty}px)`;
    }, x, y);
    await saveFrame(page, 1);
  }
}

async function clickAt(page, selector, textToMatch = null) {
  const coords = await page.evaluate((sel, match) => {
    let el = null;
    if (match) {
      el = Array.from(document.querySelectorAll(sel)).find(e => e.innerText.includes(match));
    } else {
      el = document.querySelector(sel);
    }
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }, selector, textToMatch);

  if (coords) {
    await moveCursor(page, coords.x, coords.y, 3);
    await page.evaluate(() => {
      const ripple = document.getElementById('demo-ripple');
      if (ripple) {
        ripple.style.opacity = '1';
        ripple.style.transform = 'translate(-15px, -15px) scale(1.5)';
        setTimeout(() => {
          ripple.style.opacity = '0';
          ripple.style.transform = 'translate(-15px, -15px) scale(0.3)';
        }, 300);
      }
    });
    await saveFrame(page, 1);

    await page.evaluate((sel, match) => {
      let el = null;
      if (match) {
        el = Array.from(document.querySelectorAll(sel)).find(e => e.innerText.includes(match));
      } else {
        el = document.querySelector(sel);
      }
      if (el) el.click();
    }, selector, textToMatch);

    await saveFrame(page, 2);
  }
}

(async () => {
  console.log('Logging in and getting real JWT token...');
  const loginRes = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'superadmin', password: 'admin123' })
  });
  const { user, token } = await loginRes.json();

  console.log('Starting Full HD automated workflow recording session...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--window-size=1920,1080', '--force-device-scale-factor=1']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('http://localhost:5174', { waitUntil: 'domcontentloaded' });

  // Authenticate properly with pos_user AND pos_token
  await page.evaluate((u, t) => {
    localStorage.setItem('pos_user', JSON.stringify(u));
    localStorage.setItem('pos_token', t);
  }, user, token);

  await page.reload({ waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2200));
  await injectOverlays(page);

  // ================= SCENE 1 (0.0s - 7.5s): MENU & CATEGORIES BROWSER =================
  // (~75 frames)
  console.log('Scene 1: Live Menu Browsing & Dish Highlights...');
  await updateBanner(page, 'STEP 1: LIVE MENU', 'Browse Menu Dishes · Prices, Veg/Non-Veg Badges & Multi-Category Filter');
  
  // Navigate to POS Terminal
  await clickAt(page, '.nav-item', 'POS Terminal');
  await saveFrame(page, 15);

  // Hover over Categories: All, Main Course, Biryani & Rice, Beverages
  await moveCursor(page, 380, 140, 5);
  await saveFrame(page, 12);

  // Filter Category: Main Course
  await clickAt(page, '.pos-cat-pill', 'Main Course');
  await saveFrame(page, 14);

  // Hover over Dishes: Paneer Butter Masala & Butter Chicken
  await moveCursor(page, 440, 320, 5);
  await saveFrame(page, 14);
  await moveCursor(page, 720, 320, 5);
  await saveFrame(page, 15);

  // ================= SCENE 2 (7.5s - 19.0s): SELECT TABLE & ADD TO CART =================
  // (~115 frames)
  console.log('Scene 2: Select Table & Add Dishes to Smart Cart...');
  await updateBanner(page, 'STEP 2: SMART CART', 'Select Table T-02 · Add Dishes, Modify Quantities & 5% Discount');

  // Select Table T-02 from dropdown
  await page.evaluate(() => {
    const selects = Array.from(document.querySelectorAll('select.pos-select-pill'));
    // Table dropdown is the one with table codes
    const tableSel = selects.find(s => Array.from(s.options).some(o => o.value === 'T-02' || o.text.includes('T-02')));
    if (tableSel) {
      tableSel.value = 'T-02';
      tableSel.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await moveCursor(page, 320, 95, 4);
  await saveFrame(page, 16);

  // Click Butter Chicken Gravy
  await clickAt(page, '.pos-product-card', 'Butter Chicken');
  await saveFrame(page, 14);

  // Click Paneer Butter Masala
  await clickAt(page, '.pos-product-card', 'Paneer Butter Masala');
  await saveFrame(page, 14);

  // Switch Category to Beverages
  await clickAt(page, '.pos-cat-pill', 'Beverages');
  await saveFrame(page, 12);

  // Click Mango Lassi
  await clickAt(page, '.pos-product-card', 'Mango Lassi');
  await saveFrame(page, 14);

  // In Cart: Increase Mango Lassi Qty to 2
  await clickAt(page, '.cart-qty-btn:last-child');
  await saveFrame(page, 14);

  // Apply 5% Discount in Cart
  await clickAt(page, '.cart-summary-row button', '5%');
  await saveFrame(page, 15);

  // Inspect Cart Summary (Subtotal, GST, Grand Total)
  await moveCursor(page, 1680, 520, 5);
  await saveFrame(page, 16);

  // ================= SCENE 3 (19.0s - 29.0s): SEND KOT TO KITCHEN =================
  // (~100 frames)
  console.log('Scene 3: Firing KOT to Kitchen Stations...');
  await updateBanner(page, 'STEP 3: FIRE KOT', 'Instant KOT Dispatch · Dishes Locked & Routed to Prep Stations');

  // Move cursor to Send KOT button
  await moveCursor(page, 1620, 680, 5);
  await saveFrame(page, 15);

  // Click KOT Print button
  await clickAt(page, 'button.btn-kot');
  await saveFrame(page, 35);

  // Show locked items with green badge: ✓ Kitchen
  await moveCursor(page, 1600, 260, 5);
  await saveFrame(page, 30);

  // ================= SCENE 4 (29.0s - 45.0s): KITCHEN TEAM WORKFLOW (KDS) =================
  // (~160 frames)
  console.log('Scene 4: Kitchen Team Workflow on KDS Kanban...');
  await updateBanner(page, 'STEP 4: KITCHEN KDS', 'Live Kitchen Display (KDS) · Chefs Start Prep & Mark Food Ready');

  // Navigate to Orders & KOT
  await clickAt(page, '.nav-item', 'Orders & KOT');
  await saveFrame(page, 20);

  // Show ticket for Table T-02 in 'In Kitchen'
  await moveCursor(page, 520, 340, 5);
  await saveFrame(page, 25);

  // Chef clicks Start Prep button on ticket
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Start Prep') || b.innerText.includes('Preparing'));
    if (btn) btn.click();
  });
  await saveFrame(page, 35);

  // Filter station: Beverages / Tandoor
  await clickAt(page, 'button', 'Tandoor');
  await saveFrame(page, 20);
  await clickAt(page, 'button', 'All');
  await saveFrame(page, 20);

  // Chef clicks Ready to Serve / Food Ready
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Ready') || b.innerText.includes('Food Ready'));
    if (btn) btn.click();
  });
  await saveFrame(page, 35);

  // ================= SCENE 5 (45.0s - 56.5s): BILL CHECKOUT & THERMAL RECEIPT =================
  // (~115 frames)
  console.log('Scene 5: Bill Settlement, Cash Return & Thermal Tax Invoice...');
  await updateBanner(page, 'STEP 5: BILL & SETTLE', 'One-Click Cash Payment · Return Change Calculator & Thermal Invoice');

  // Return to POS Terminal
  await clickAt(page, '.nav-item', 'POS Terminal');
  await saveFrame(page, 16);

  // Click Pay button
  await clickAt(page, 'button.btn-pay');
  await saveFrame(page, 16);

  // Select Cash Payment Mode
  await clickAt(page, '.pay-methods button', 'Cash');
  await saveFrame(page, 12);

  // Tender ₹1000 Cash
  await page.evaluate(() => {
    const inp = document.querySelector('input[type="number"]');
    if (inp) {
      inp.value = '1000';
      inp.dispatchEvent(new Event('input', { bubbles: true }));
      inp.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await saveFrame(page, 18);

  // Confirm Payment & Settle
  await clickAt(page, 'button.primary-btn', 'Confirm & Settle Payment');
  await saveFrame(page, 25);

  // View Thermal Invoice Receipt popup
  await moveCursor(page, 960, 480, 5);
  await saveFrame(page, 20);

  // Close receipt
  await clickAt(page, 'button.primary-btn', 'Close');
  await saveFrame(page, 8);

  // ================= SCENE 6 (56.5s - 62.0s): SUMMARY & ARCHITECTURE =================
  // (~55 frames)
  console.log('Scene 6: Enterprise Overview & Stack Badge...');
  await updateBanner(page, 'ENTERPRISE STACK', 'Spring Boot 3 · Microsoft SQL Server · React 18 · Tableflow POS');

  // Go to Overview
  await clickAt(page, '.nav-item', 'Overview');
  await saveFrame(page, 25);

  await moveCursor(page, 960, 450, 5);
  await saveFrame(page, 25);

  console.log(`Recording completed! Total frames captured: ${frameIndex}`);
  await browser.close();
})();
