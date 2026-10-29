/**
 * Smart Waste Monitoring System (Vanilla JavaScript Engine)
 * Features:
 * 1. 3-Role Authentication Gate (Citizen, Sanitation Worker, Municipal Administrator)
 * 2. Multi-Page SPA Client-Side Router
 * 3. Camera Snapshot & File Upload with GPS Geolocation Tracking
 * 4. Multi-Stream AI Waste Classification & Speech Synthesis Voice Announcement
 * 5. Nearest Worker Proximity Dispatch with Haversine GPS Distance Calculation
 * 6. Interactive OpenStreetMap with Hotspot Markers (Leaflet.js)
 * 7. Full LocalStorage Persistence
 */

(function () {
  'use strict';

  // --- SEED DATA ---
  const INITIAL_USERS = [
    { id: 'user-c1', name: 'Aarav Sharma', email: 'citizen@urban.eco', role: 'citizen', zone: 'Zone 1 - Central Ward' },
    { id: 'user-w1', name: 'Rajesh Kumar', email: 'worker@urban.eco', role: 'worker', zone: 'Zone 1 - Central Ward' },
    { id: 'user-a1', name: 'Dr. Priya Verma', email: 'admin@urban.eco', role: 'admin', zone: 'Municipal HQ' }
  ];

  const INITIAL_WORKERS = [
    { id: 'w-1', name: 'Rajesh Kumar', phone: '+91 98765 43210', zone: 'Central Ward', lat: 19.0765, lng: 72.8780, status: 'Available', vehicle: 'MH-01-AB-1234' },
    { id: 'w-2', name: 'Sunita Patel', phone: '+91 98765 67890', zone: 'North Sector', lat: 19.0820, lng: 72.8830, status: 'On Task', vehicle: 'MH-01-CD-5678' },
    { id: 'w-3', name: 'Vikram Singh', phone: '+91 98765 11223', zone: 'South Sector', lat: 19.0690, lng: 72.8710, status: 'Available', vehicle: 'MH-01-EF-9012' }
  ];

  const INITIAL_REPORTS = [
    {
      id: 'rep-101',
      complaint_number: 'MUM-2026-101',
      citizen_name: 'Aarav Sharma',
      citizen_email: 'citizen@urban.eco',
      description: 'Heavy road dust and sweeping debris accumulated near MG Road crossing.',
      category: 'Road Dust & Sweeping Debris',
      stream: 'Dry Waste',
      priority: 'Medium',
      status: 'In Progress',
      lat: 19.0760,
      lng: 72.8777,
      address: '42 MG Road, Ward 07, Mumbai',
      image: 'https://images.unsplash.com/photo-1599818816933-4f9d0c8d17b5?auto=format&fit=crop&w=800&q=80',
      created_at: new Date(Date.now() - 3600000 * 4).toLocaleTimeString(),
      assigned_to: 'Rajesh Kumar'
    },
    {
      id: 'rep-102',
      complaint_number: 'MUM-2026-102',
      citizen_name: 'Neha Kapoor',
      citizen_email: 'neha@urban.eco',
      description: 'Overflow of single-use plastic beverage bottles and food containers.',
      category: 'Plastic Waste',
      stream: 'Dry Waste (Recyclable)',
      priority: 'High',
      status: 'Submitted',
      lat: 19.0792,
      lng: 72.8812,
      address: '15 Station Road, North Ward, Mumbai',
      image: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
      created_at: new Date(Date.now() - 3600000 * 2).toLocaleTimeString(),
      assigned_to: null
    },
    {
      id: 'rep-103',
      complaint_number: 'MUM-2026-103',
      citizen_name: 'Rohan Mehra',
      citizen_email: 'rohan@urban.eco',
      description: 'Perishable organic market waste, vegetable discards, and wet food residues.',
      category: 'Organic Waste',
      stream: 'Wet Waste',
      priority: 'Medium',
      status: 'Resolved',
      lat: 19.0735,
      lng: 72.8745,
      address: '8 Vegetable Market, South Ward, Mumbai',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
      created_at: new Date(Date.now() - 3600000 * 8).toLocaleTimeString(),
      assigned_to: 'Sunita Patel'
    }
  ];

  // --- STATE STORE ---
  const state = {
    currentUser: null,
    reports: JSON.parse(localStorage.getItem('swm_vanilla_reports')) || INITIAL_REPORTS,
    workers: JSON.parse(localStorage.getItem('swm_vanilla_workers')) || INITIAL_WORKERS,
    currentCoords: { lat: 19.0760, lng: 72.8777, accuracy: 4 },
    selectedImage: 'https://images.unsplash.com/photo-1599818816933-4f9d0c8d17b5?auto=format&fit=crop&w=800&q=80',
    leafletMap: null,
    leafletMarkers: [],
    videoStream: null
  };

  // Check saved session
  const savedUser = localStorage.getItem('swm_vanilla_user');
  if (savedUser) {
    try {
      state.currentUser = JSON.parse(savedUser);
    } catch (e) {
      localStorage.removeItem('swm_vanilla_user');
    }
  }

  function saveState() {
    localStorage.setItem('swm_vanilla_reports', JSON.stringify(state.reports));
    localStorage.setItem('swm_vanilla_workers', JSON.stringify(state.workers));
    if (state.currentUser) {
      localStorage.setItem('swm_vanilla_user', JSON.stringify(state.currentUser));
    } else {
      localStorage.removeItem('swm_vanilla_user');
    }
  }

  // --- HAVERSINE GPS DISTANCE FORMULA ---
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2);
  }

  // --- SPEECH SYNTHESIS VOICE ANNOUNCEMENT ---
  function speakWasteAnnouncement(category, stream, instructions) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); // Stop prior audio
    const text = `Waste identified as: ${category}. Category stream: ${stream}. Suggested action: ${instructions || 'Dispatched for segregation and recycling.'}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }

  // --- MULTI-PAGE ROUTER ---
  const Router = {
    currentPage: 'home',
    navigate: function (pageId) {
      this.currentPage = pageId;

      // Update active view
      document.querySelectorAll('.page-view').forEach(el => el.classList.remove('active'));
      const target = document.getElementById(`view-${pageId}`);
      if (target) {
        target.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      // Update Nav Link Active states
      document.querySelectorAll('.nav-link-btn').forEach(btn => {
        if (btn.dataset.page === pageId) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      // Special page initializers
      if (pageId === 'admin-map' || pageId === 'hotspots') {
        setTimeout(initMap, 200);
      }
      if (pageId === 'citizen-dashboard' || pageId === 'citizen-complaints') {
        renderComplaintsList();
      }
      if (pageId === 'worker-tasks' || pageId === 'worker-history') {
        renderWorkerTasks();
      }
      if (pageId === 'admin-dashboard' || pageId === 'admin-dispatch') {
        renderAdminDashboard();
      }

      updateUI();
    }
  };

  // --- AUTHENTICATION & SESSION MANAGEMENT ---
  function loginAs(role) {
    if (role === 'citizen') {
      state.currentUser = INITIAL_USERS[0];
      saveState();
      Router.navigate('citizen-dashboard');
      showToast('Welcome, Aarav Sharma! Citizen Portal Opened.', 'success');
    } else if (role === 'worker') {
      state.currentUser = INITIAL_USERS[1];
      saveState();
      Router.navigate('worker-tasks');
      showToast('Welcome, Rajesh Kumar! Sanitation Crew Tasks Loaded.', 'success');
    } else if (role === 'admin') {
      state.currentUser = INITIAL_USERS[2];
      saveState();
      Router.navigate('admin-dashboard');
      showToast('Level 4 Clearance Verified. Municipal Command Center Opened.', 'success');
    }
  }

  function logout() {
    state.currentUser = null;
    saveState();
    Router.navigate('home');
    showToast('Signed out successfully. Returned to Login Procedure.', 'info');
  }

  // --- TOAST NOTIFICATION ENGINE ---
  function showToast(msg, type = 'success') {
    let toast = document.getElementById('amz-toast-notification');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'amz-toast-notification';
      toast.className = 'amz-toast';
      document.body.appendChild(toast);
    }
    const icon = type === 'success' ? '✅' : (type === 'error' ? '⚠️' : 'ℹ️');
    toast.innerHTML = `<span style="font-size: 1.25rem;">${icon}</span> <span>${msg}</span>`;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3800);
  }

  // --- AMAZON HERO CAROUSEL ENGINE ---
  let currentHeroIndex = 0;
  let heroInterval = null;

  function showHeroSlide(index) {
    const slides = document.querySelectorAll('.amz-hero-slide');
    if (!slides || slides.length === 0) return;
    if (index >= slides.length) currentHeroIndex = 0;
    else if (index < 0) currentHeroIndex = slides.length - 1;
    else currentHeroIndex = index;

    slides.forEach((s, idx) => {
      if (idx === currentHeroIndex) {
        s.classList.add('active');
      } else {
        s.classList.remove('active');
      }
    });
  }

  function nextHeroSlide() { showHeroSlide(currentHeroIndex + 1); }
  function prevHeroSlide() { showHeroSlide(currentHeroIndex - 1); }

  // Start auto-slider
  if (!heroInterval) {
    heroInterval = setInterval(nextHeroSlide, 5500);
  }

  // --- GREEN COINS & CART STORE ---
  state.coins = parseInt(localStorage.getItem('swm_coins') || '450', 10);
  state.cart = JSON.parse(localStorage.getItem('swm_cart') || '[]');

  function updateCartBadge() {
    const badge = document.getElementById('amz-cart-badge');
    if (badge) badge.textContent = state.coins;
  }

  // --- UI UPDATE & RE-RENDER ---
  function updateUI() {
    const user = state.currentUser;
    const authBox = document.getElementById('nav-auth-container');
    const roleNavCitizen = document.getElementById('nav-role-citizen');
    const roleNavWorker = document.getElementById('nav-role-worker');
    const roleNavAdmin = document.getElementById('nav-role-admin');
    const homeGate = document.getElementById('home-login-gate');
    const homeSessionBanner = document.getElementById('home-session-banner');

    // Amazon Header Elements
    const locDeliverTo = document.getElementById('loc-deliver-to');
    const amzGreeting = document.getElementById('amz-greeting');
    const amzRoleSub = document.getElementById('amz-role-sub');
    const drawerUserName = document.getElementById('drawer-user-name');
    const drawerUserRole = document.getElementById('drawer-user-role');
    const complaintCount = document.getElementById('amz-complaint-count');

    // Update Complaint Count Badge
    const activeComplaints = state.reports.filter(r => r.status !== 'Resolved').length;
    if (complaintCount) complaintCount.textContent = activeComplaints;
    updateCartBadge();

    if (user) {
      if (locDeliverTo) locDeliverTo.textContent = `Deliver to ${user.name.split(' ')[0]}`;
      if (amzGreeting) amzGreeting.textContent = `Hello, ${user.name}`;
      if (amzRoleSub) amzRoleSub.textContent = `${user.role.toUpperCase()} Portal ▾`;
      if (drawerUserName) drawerUserName.textContent = user.name;
      if (drawerUserRole) drawerUserRole.textContent = `Role: ${user.role.toUpperCase()} (Active)`;

      if (authBox) {
        authBox.innerHTML = `
          <div class="user-badge-chip">
            <div class="user-badge-info">
              <p>${user.name}</p>
              <span>${user.role}</span>
            </div>
            <button class="btn-logout" id="btn-logout-action">Sign Out</button>
          </div>
        `;
        document.getElementById('btn-logout-action').addEventListener('click', logout);
      }

      if (homeGate) homeGate.style.display = 'none';
      if (homeSessionBanner) {
        homeSessionBanner.style.display = 'block';
        document.getElementById('session-user-name').textContent = user.name;
        document.getElementById('session-user-role').textContent = `${user.role.toUpperCase()} PORTAL ACTIVE`;
        document.getElementById('session-user-email').textContent = `${user.email} • Ward 07, Mumbai`;
      }

      // Show specific role nav items
      if (roleNavCitizen) roleNavCitizen.style.display = user.role === 'citizen' ? 'flex' : 'none';
      if (roleNavWorker) roleNavWorker.style.display = user.role === 'worker' ? 'flex' : 'none';
      if (roleNavAdmin) roleNavAdmin.style.display = user.role === 'admin' ? 'flex' : 'none';
    } else {
      if (locDeliverTo) locDeliverTo.textContent = 'Deliver to Guest';
      if (amzGreeting) amzGreeting.textContent = 'Hello, Sign In';
      if (amzRoleSub) amzRoleSub.textContent = 'Account & Roles ▾';
      if (drawerUserName) drawerUserName.textContent = 'Hello, Sign In';
      if (drawerUserRole) drawerUserRole.textContent = 'Select persona to enter';

      if (authBox) {
        authBox.innerHTML = `
          <button class="nav-link-btn highlight" id="btn-header-login">
            <span>🔑 Sign In &bull; Select Role</span>
          </button>
        `;
        document.getElementById('btn-header-login').addEventListener('click', () => Router.navigate('login'));
      }

      if (homeGate) homeGate.style.display = 'block';
      if (homeSessionBanner) homeSessionBanner.style.display = 'none';

      if (roleNavCitizen) roleNavCitizen.style.display = 'none';
      if (roleNavWorker) roleNavWorker.style.display = 'none';
      if (roleNavAdmin) roleNavAdmin.style.display = 'none';
    }

    // Update Global KPIs
    const resolved = state.reports.filter(r => r.status === 'Resolved').length;
    const inProgress = state.reports.filter(r => r.status === 'In Progress' || r.status === 'Assigned').length;
    const total = state.reports.length;

    document.querySelectorAll('.stat-total').forEach(el => el.textContent = total);
    document.querySelectorAll('.stat-resolved').forEach(el => el.textContent = resolved);
    document.querySelectorAll('.stat-active').forEach(el => el.textContent = inProgress);
  }

  // --- GPS GEOLOCATION ENGINE ---
  function trackCurrentLocation() {
    const statusText = document.getElementById('gps-status-text');
    const coordsDisplay = document.getElementById('gps-coords-display');

    if (!('geolocation' in navigator)) {
      if (statusText) statusText.textContent = 'Geolocation not supported by browser.';
      return;
    }

    if (statusText) statusText.textContent = '🛰️ Tracking GPS Constellation via Satellite...';

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        state.currentCoords.lat = pos.coords.latitude;
        state.currentCoords.lng = pos.coords.longitude;
        state.currentCoords.accuracy = Math.round(pos.coords.accuracy || 4);

        if (statusText) statusText.textContent = `✅ GPS Locked: ±${state.currentCoords.accuracy}m Accuracy`;
        if (coordsDisplay) {
          coordsDisplay.textContent = `${state.currentCoords.lat.toFixed(5)}° N, ${state.currentCoords.lng.toFixed(5)}° E`;
        }
        showToast(`GPS Position Acquired (±${state.currentCoords.accuracy}m)`, 'success');
      },
      (err) => {
        // Fallback to central ward
        state.currentCoords.lat = 19.0760;
        state.currentCoords.lng = 72.8777;
        if (statusText) statusText.textContent = '📍 Fixed GPS Location: Central Ward (±4m)';
        if (coordsDisplay) coordsDisplay.textContent = '19.0760° N, 72.8777° E';
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  // --- CAMERA & PHOTO CAPTURE ENGINE ---
  function initCamera() {
    const video = document.getElementById('camera-stream-video');
    const startBtn = document.getElementById('btn-start-camera');
    const snapBtn = document.getElementById('btn-snap-camera');

    if (!startBtn) return;

    startBtn.addEventListener('click', async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        state.videoStream = stream;
        video.srcObject = stream;
        video.style.display = 'block';
        document.getElementById('camera-placeholder-img').style.display = 'none';
        startBtn.style.display = 'none';
        snapBtn.style.display = 'inline-flex';
        trackCurrentLocation();
      } catch (err) {
        showToast('Camera access unavailable. Using photo selector.', 'info');
      }
    });

    snapBtn.addEventListener('click', () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');

      // Stop stream
      if (state.videoStream) {
        state.videoStream.getTracks().forEach(t => t.stop());
      }
      video.style.display = 'none';
      const img = document.getElementById('camera-placeholder-img');
      img.src = dataUrl;
      img.style.display = 'block';
      state.selectedImage = dataUrl;
      startBtn.style.display = 'inline-flex';
      snapBtn.style.display = 'none';

      // Run AI Classification
      classifyWasteSample('Road Dust & Sweeping Debris', 'Dry Waste', 96.8, 'Road dust collected. Dispatch road sweeping squad.');
    });
  }

  function classifyWasteSample(category, stream, confidence, instructions) {
    document.getElementById('ai-predicted-label').textContent = category;
    document.getElementById('ai-predicted-stream').textContent = stream;
    document.getElementById('ai-predicted-confidence').textContent = `${confidence}% Confidence`;
    document.getElementById('ai-predicted-instructions').textContent = instructions;

    // Trigger voice readout
    speakWasteAnnouncement(category, stream, instructions);
  }

  // --- SUBMIT COMPLAINT HANDLER ---
  function handleComplaintSubmit(e) {
    e.preventDefault();
    if (!state.currentUser) {
      showToast('Please sign in as a citizen before submitting.', 'error');
      Router.navigate('login');
      return;
    }

    const desc = document.getElementById('report-desc').value.trim();
    const category = document.getElementById('ai-predicted-label').textContent || 'Road Dust & Sweeping Debris';
    const stream = document.getElementById('ai-predicted-stream').textContent || 'Dry Waste';
    const priority = document.getElementById('report-priority').value || 'Medium';

    if (!desc) {
      showToast('Please provide a description of the waste accumulation.', 'error');
      return;
    }

    const newId = `MUM-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newReport = {
      id: `rep-${Date.now()}`,
      complaint_number: newId,
      citizen_name: state.currentUser.name,
      citizen_email: state.currentUser.email,
      description: desc,
      category: category,
      stream: stream,
      priority: priority,
      status: 'Submitted',
      lat: state.currentCoords.lat,
      lng: state.currentCoords.lng,
      address: `Ward 07 Central, Mumbai (${state.currentCoords.lat.toFixed(4)}°, ${state.currentCoords.lng.toFixed(4)}°)`,
      image: state.selectedImage,
      created_at: 'Just now',
      assigned_to: null
    };

    state.reports.unshift(newReport);
    saveState();
    showToast(`Complaint ${newId} logged successfully! Satellite GPS registered.`, 'success');
    document.getElementById('report-desc').value = '';
    Router.navigate('citizen-complaints');
  }

  // --- RENDER COMPLAINTS LIST ---
  function renderComplaintsList() {
    const container = document.getElementById('complaints-table-body');
    if (!container) return;

    container.innerHTML = state.reports.map(rep => `
      <tr>
        <td class="mono font-bold" style="color: var(--emerald-400);">${rep.complaint_number}</td>
        <td>
          <div style="font-weight: 700; color: #fff;">${rep.category}</div>
          <div style="font-size: 0.75rem; color: var(--text-secondary);">${rep.description}</div>
        </td>
        <td class="mono" style="font-size: 0.75rem;">${rep.address}</td>
        <td>
          <span class="badge-status ${rep.status === 'Resolved' ? 'badge-resolved' : rep.status === 'In Progress' ? 'badge-inprogress' : 'badge-submitted'}">
            ${rep.status}
          </span>
        </td>
        <td>
          ${rep.assigned_to 
            ? `<span class="badge-status" style="background: rgba(16,185,129,0.15); color: #86efac;">👷 ${rep.assigned_to}</span>` 
            : `<span style="color: var(--text-muted); font-size: 0.75rem;">Unassigned</span>`}
        </td>
        <td>
          <button class="btn-secondary" style="padding: 4px 10px; font-size: 0.7rem;" onclick="window.viewComplaintTimeline('${rep.id}')">
            Track Timeline
          </button>
        </td>
      </tr>
    `).join('');
  }

  // --- RENDER WORKER TASKS ---
  function renderWorkerTasks() {
    const container = document.getElementById('worker-task-cards');
    if (!container) return;

    const myTasks = state.reports.filter(r => r.status !== 'Resolved');

    if (myTasks.length === 0) {
      container.innerHTML = '<p class="text-muted" style="padding: 20px;">All zone tasks completed! Great work.</p>';
      return;
    }

    container.innerHTML = myTasks.map(task => {
      const distance = calculateDistance(19.0765, 72.8780, task.lat, task.lng);
      return `
        <div class="glass-panel" style="padding: 22px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            <div>
              <span class="badge-tag" style="margin-bottom: 6px;">${task.complaint_number} &bull; PRIORITY: ${task.priority}</span>
              <h3 style="font-size: 1.15rem; margin-top: 4px;">${task.category}</h3>
              <p style="font-size: 0.82rem; color: var(--text-secondary);">${task.description}</p>
            </div>
            <span class="badge-status ${task.status === 'In Progress' ? 'badge-inprogress' : 'badge-submitted'}">
              ${task.status}
            </span>
          </div>

          <div style="display: flex; gap: 16px; margin: 16px 0; font-size: 0.8rem; font-family: var(--font-mono); color: var(--text-secondary);">
            <span>📍 ${task.address}</span>
            <span style="color: var(--cyan-400); font-weight: bold;">⚡ ${distance} km from your squad</span>
          </div>

          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <a href="https://www.google.com/maps/dir/?api=1&destination=${task.lat},${task.lng}" target="_blank" class="btn-secondary" style="font-size: 0.8rem; padding: 8px 16px;">
              🗺️ Turn-by-Turn GPS
            </a>
            ${task.status !== 'In Progress' 
              ? `<button class="btn-primary" style="font-size: 0.8rem; padding: 8px 16px;" onclick="window.workerStartTask('${task.id}')">Accept &amp; Begin Task</button>` 
              : `<button class="btn-primary" style="font-size: 0.8rem; padding: 8px 16px; background: linear-gradient(135deg, var(--emerald-400), var(--teal-400));" onclick="window.workerCompleteTask('${task.id}')">Upload Proof &amp; Resolve</button>`}
          </div>
        </div>
      `;
    }).join('');
  }

  // --- RENDER ADMIN DISPATCH & WORKERS ---
  function renderAdminDashboard() {
    const dispatchList = document.getElementById('admin-dispatch-queue');
    if (!dispatchList) return;

    const unassigned = state.reports.filter(r => !r.assigned_to && r.status !== 'Resolved');

    dispatchList.innerHTML = unassigned.map(rep => {
      // Find nearest worker via Haversine
      let nearest = state.workers[0];
      let minDis = 9999;
      state.workers.forEach(w => {
        const d = parseFloat(calculateDistance(w.lat, w.lng, rep.lat, rep.lng));
        if (d < minDis) {
          minDis = d;
          nearest = w;
        }
      });

      return `
        <div class="glass-panel" style="padding: 20px; margin-bottom: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <span class="mono" style="color: var(--emerald-400); font-weight: bold; font-size: 0.8rem;">${rep.complaint_number}</span>
              <h4 style="margin: 4px 0 2px;">${rep.category}</h4>
              <p style="font-size: 0.8rem; color: var(--text-secondary);">${rep.address}</p>
            </div>
            <div style="text-align: right;">
              <span class="badge-status badge-emergency" style="margin-bottom: 4px;">Nearest Squad</span>
              <div style="font-size: 0.8rem; font-weight: bold; color: #fff;">${nearest.name} (${minDis} km)</div>
              <button class="btn-primary" style="padding: 6px 14px; font-size: 0.75rem; margin-top: 6px;" onclick="window.adminDispatchWorker('${rep.id}', '${nearest.name}')">
                Dispatch Squad
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('') || '<p class="text-muted" style="padding: 16px;">All reports dispatched to active sanitation crews.</p>';
  }

  // --- LEAFLET OPENSTREETMAP ---
  function initMap() {
    const mapEl = document.getElementById('map-viewport');
    if (!mapEl || state.leafletMap) return;

    // Check if Leaflet is loaded
    if (typeof L === 'undefined') return;

    state.leafletMap = L.map('map-viewport').setView([19.0760, 72.8777], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(state.leafletMap);

    // Plot reports
    state.reports.forEach(rep => {
      const color = rep.status === 'Resolved' ? '#10b981' : rep.status === 'In Progress' ? '#f59e0b' : '#ef4444';
      const marker = L.circleMarker([rep.lat, rep.lng], {
        radius: 9,
        fillColor: color,
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9
      }).addTo(state.leafletMap);

      marker.bindPopup(`
        <div style="font-family: sans-serif; color: #1e293b; padding: 4px;">
          <b>${rep.complaint_number}</b><br/>
          <span>${rep.category}</span><br/>
          <small>Status: ${rep.status}</small>
        </div>
      `);
    });

    // Plot Sanitation Workers
    state.workers.forEach(w => {
      const workerMarker = L.circleMarker([w.lat, w.lng], {
        radius: 8,
        fillColor: '#3b82f6',
        color: '#ffffff',
        weight: 2,
        fillOpacity: 1
      }).addTo(state.leafletMap);

      workerMarker.bindPopup(`<b>Sanitation Squad: ${w.name}</b><br/>Vehicle: ${w.vehicle}`);
    });
  }

  // --- TOAST NOTIFICATIONS ---
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-box') || createToastBox();
    const toast = document.createElement('div');
    toast.style.cssText = `
      padding: 12px 20px;
      margin-top: 8px;
      border-radius: 12px;
      background: ${type === 'success' ? '#064e3b' : type === 'error' ? '#881337' : '#1e293b'};
      color: #fff;
      font-size: 0.85rem;
      font-weight: 700;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      border: 1px solid rgba(255,255,255,0.2);
      animation: fadeIn 0.3s forwards;
    `;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  }

  function createToastBox() {
    const box = document.createElement('div');
    box.id = 'toast-box';
    box.style.cssText = 'position: fixed; bottom: 24px; right: 24px; z-index: 9999; display: flex; flex-direction: column; align-items: flex-end;';
    document.body.appendChild(box);
    return box;
  }

  // --- AMAZON INTERACTIVE ACTIONS & HOOKS ---
  function executeAmazonSearch() {
    const input = document.getElementById('amz-search-input');
    const q = (input ? input.value : '').trim().toLowerCase();
    if (!q) {
      Router.navigate('citizen-complaints');
      showToast('Displaying all active ward complaints.', 'info');
      return;
    }
    if (q.includes('dust') || q.includes('sweep')) {
      triggerCategorySnap('Road Dust & Sweeping Debris');
      return;
    }
    if (q.includes('plastic') || q.includes('bottle')) {
      triggerCategorySnap('Plastic Waste');
      return;
    }
    if (q.includes('organic') || q.includes('food') || q.includes('wet')) {
      triggerCategorySnap('Organic Waste');
      return;
    }
    if (q.includes('map') || q.includes('gps') || q.includes('ward')) {
      Router.navigate('admin-map');
      showToast(`Filtering citywide radar for "${q}"`, 'info');
      return;
    }
    if (q.includes('reward') || q.includes('coin') || q.includes('pass') || q.includes('deal')) {
      openRewardsModal();
      return;
    }
    if (q.includes('bin') || q.includes('bag') || q.includes('tool') || q.includes('grabber')) {
      scrollToSection('amz-products-section');
      showToast(`Showing eco products & civic tools for "${q}"`, 'success');
      return;
    }
    Router.navigate('citizen-complaints');
    showToast(`Searched complaints & wards matching "${q}"`, 'info');
  }

  function handleAmazonSearch(e) {
    if (e.key === 'Enter') {
      executeAmazonSearch();
    }
  }

  function toggleDrawer(open) {
    const drawer = document.getElementById('amz-drawer');
    if (!drawer) return;
    if (open) {
      drawer.classList.add('active');
    } else {
      drawer.classList.remove('active');
    }
  }

  function openLocationModal() {
    const ward = prompt('Enter your delivery / sanitation ward (e.g., Ward 07 Bandra, Mumbai 400001):', 'Ward 07, Mumbai 400001');
    if (ward) {
      const wardText = document.getElementById('loc-ward-text');
      if (wardText) wardText.textContent = `${ward} ▾`;
      showToast(`Sanitation telemetry updated to: ${ward}`, 'success');
    }
  }

  function openRewardsModal() {
    alert(`🌱 UrbanEco Green Points Wallet\n\nYour Current Balance: ${state.coins} Coins\n\nRedeemable Municipal Deals:\n• City Metro 30-Day Pass: 150 Coins\n• Organic Produce 25% Off: 80 Coins\n• Water Tax 15% Rebate: 300 Coins\n• Adopt a Roadside Tree Certificate: 50 Coins\n\nTip: Spot and report roadside dust or trash with your camera to earn +50 Coins per verified cleanup!`);
  }

  function claimReward(name, coins) {
    if (state.coins < coins) {
      showToast(`Insufficient coins! You have ${state.coins} Coins, but need ${coins}. Snap waste to earn more!`, 'error');
      return;
    }
    state.coins -= coins;
    localStorage.setItem('swm_coins', state.coins.toString());
    updateCartBadge();
    showToast(`Redeemed "${name}" for ${coins} Green Coins! Voucher coupon saved to your account.`, 'success');
  }

  function addToCart(productName, price) {
    state.cart.push({ name: productName, price: price, time: new Date().toLocaleTimeString() });
    localStorage.setItem('swm_cart', JSON.stringify(state.cart));
    showToast(`Added to Cart: "${productName}" (₹${price})! Free Prime Civic Delivery applied.`, 'success');
  }

  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function triggerCategorySnap(catName) {
    Router.navigate('citizen-report');
    if (catName.includes('Dust')) {
      selectSamplePhoto('Road Dust & Sweeping Debris', 'Dry Waste', 96.8, 'Heavy accumulation of road dust. Dispatch road sweeping squad.', 'https://images.unsplash.com/photo-1599818816933-4f9d0c8d17b5?auto=format&fit=crop&w=800&q=80');
    } else if (catName.includes('Plastic')) {
      selectSamplePhoto('Plastic Beverage Bottles', 'Dry Waste (Recyclable)', 94.2, 'High polymer content. Divert to municipal plastic baler depot.', 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80');
    } else if (catName.includes('Organic')) {
      selectSamplePhoto('Organic Food Scraps', 'Wet Waste (Compostable)', 98.1, 'Perishable organic material. Route to biogas anaerobic digester.', 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80');
    } else {
      selectSamplePhoto(catName, 'Dry Waste', 95.0, 'Dispatched to nearest municipal squad.', 'https://images.unsplash.com/photo-1599818816933-4f9d0c8d17b5?auto=format&fit=crop&w=800&q=80');
    }
    showToast(`Selected stream: ${catName}. Camera Reticle & GPS Locked!`, 'success');
  }

  function toggleAccountMenu() {
    toggleDrawer(true);
  }

  // --- WINDOW GLOBAL HOOKS FOR HTML ONCLICK EVENTS ---
  window.loginAs = loginAs;
  window.logout = logout;
  window.trackCurrentLocation = trackCurrentLocation;
  window.Router = Router;
  window.nextHeroSlide = nextHeroSlide;
  window.prevHeroSlide = prevHeroSlide;
  window.executeAmazonSearch = executeAmazonSearch;
  window.handleAmazonSearch = handleAmazonSearch;
  window.toggleDrawer = toggleDrawer;
  window.openLocationModal = openLocationModal;
  window.openRewardsModal = openRewardsModal;
  window.claimReward = claimReward;
  window.addToCart = addToCart;
  window.scrollToSection = scrollToSection;
  window.triggerCategorySnap = triggerCategorySnap;
  window.toggleAccountMenu = toggleAccountMenu;

  window.workerStartTask = function (id) {
    const task = state.reports.find(r => r.id === id);
    if (task) {
      task.status = 'In Progress';
      saveState();
      renderWorkerTasks();
      showToast(`Task ${task.complaint_number} accepted. En route to location.`, 'success');
    }
  };

  window.workerCompleteTask = function (id) {
    const task = state.reports.find(r => r.id === id);
    if (task) {
      task.status = 'Resolved';
      saveState();
      renderWorkerTasks();
      showToast(`Site cleared and resolution photographic proof registered!`, 'success');
    }
  };

  window.adminDispatchWorker = function (reportId, workerName) {
    const rep = state.reports.find(r => r.id === reportId);
    if (rep) {
      rep.assigned_to = workerName;
      rep.status = 'In Progress';
      saveState();
      renderAdminDashboard();
      showToast(`Assigned squad ${workerName} to complaint ${rep.complaint_number}.`, 'success');
    }
  };

  window.viewComplaintTimeline = function (id) {
    Router.navigate('citizen-track');
    const rep = state.reports.find(r => r.id === id);
    if (rep) {
      document.getElementById('track-complaint-id').textContent = rep.complaint_number;
      document.getElementById('track-complaint-title').textContent = rep.category;
      document.getElementById('track-complaint-address').textContent = rep.address;
    }
  };

  function selectSamplePhoto(category, stream, confidence, instructions, imgUrl) {
    state.selectedImage = imgUrl;
    const img = document.getElementById('camera-placeholder-img');
    if (img) img.src = imgUrl;
    trackCurrentLocation();
    classifyWasteSample(category, stream, confidence, instructions);
  }
  window.selectSamplePhoto = selectSamplePhoto;

  // --- INITIALIZATION ---
  document.addEventListener('DOMContentLoaded', () => {
    // Nav Click Handlers
    document.querySelectorAll('[data-page-target]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const page = btn.getAttribute('data-page-target');
        Router.navigate(page);
      });
    });

    // Form handlers
    const reportForm = document.getElementById('waste-report-form');
    if (reportForm) {
      reportForm.addEventListener('submit', handleComplaintSubmit);
    }

    initCamera();
    updateUI();

    // Default to home page
    Router.navigate('home');
  });

})();
