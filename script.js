let state = {
    role: 'Faculty',
    user: {
        name: localStorage.getItem('cas-name') || 'Guest User',
        points: parseInt(localStorage.getItem('cas-points')) || 0
    }
};

// ROLE MANAGEMENT
function setRole(role, btn) {
    state.role = role;
    document.querySelectorAll('.role-pill').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
}

// AUTHENTICATION
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
    syncUI();
    renderNav();
    loadView('Profile Setup');
});

function syncUI() {
    document.getElementById('u-name').innerText = state.user.name;
    document.getElementById('u-role').innerText = state.role;
    document.getElementById('u-avatar').innerText = state.user.name.charAt(0).toUpperCase();
}

// NAVIGATION BUILDER
function renderNav() {
    const nav = document.getElementById('sidebar-nav');
    const items = ['Profile Setup', 'Research Papers', 'Events/Seminars', 'Committee Work', 'Scoring Analytics'];
    nav.innerHTML = items.map(item => `
        <div class="nav-link ${item === 'Profile Setup' ? 'active' : ''}" onclick="loadView('${item}', this)">${item}</div>
    `).join('');
}

// DYNAMIC VIEW ROUTER
function loadView(view, el) {
    if(el) {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        el.classList.add('active');
    }
    document.getElementById('view-title').innerText = view;
    const viewport = document.getElementById('content-area');

    if(view === 'Profile Setup') {
        viewport.innerHTML = `
            <div class="card">
                <h3>Initial Identity Synchronization</h3>
                <p style="color:var(--text-muted); margin-bottom:32px;">Please provide your primary details for the automated CAS evaluation machine.</p>
                <div class="form-grid">
                    <div class="input-field">
                        <label>Legal Full Name</label>
                        <input type="text" id="name-in" value="${state.user.name}">
                    </div>
                    <div class="input-field">
                        <label>Employee ID</label>
                        <input type="text" placeholder="e.g. DP-FAC-1002">
                    </div>
                </div>
                <button class="btn-primary" onclick="saveName()" style="width: 200px; margin-top:16px;">Save Workspace</button>
            </div>
        `;
    } else if(view === 'Research Papers') {
        viewport.innerHTML = `
            <div class="card">
                <h3>Publication Submission</h3>
                <div class="form-grid">
                    <div class="input-field"><label>Paper Title</label><input type="text" placeholder="Journal Title"></div>
                    <div class="input-field"><label>Indexing</label><input type="text" placeholder="Scopus / SCI / UGC"></div>
                </div>
                <button class="btn-primary" onclick="addPoints(15)" style="width: 200px;">Submit Paper</button>
            </div>
        `;
    } else if(view === 'Scoring Analytics') {
        viewport.innerHTML = `
            <div class="card" style="text-align:center;">
                <h1 style="font-size:5rem; color:var(--accent); margin-bottom:10px;">${state.user.points}</h1>
                <p style="font-weight:700;">Total API Points Accumulated</p>
                <div style="width:100%; height:12px; background:#f1f5f9; border-radius:10px; margin:32px 0;">
                    <div style="width:${Math.min(state.user.points, 100)}%; background:var(--accent); height:100%; border-radius:10px; transition:1s;"></div>
                </div>
                <p style="color:var(--text-muted)">Required for Associate Professor Promotion: 100 Points</p>
            </div>
        `;
    } else {
       viewport.innerHTML = `<div class="card"><h3>${view} Module</h3><p>Manage your ${view} records here. Data synchronization is active.</p></div>`;
    }
}

// CORE LOGIC
function saveName() {
    const val = document.getElementById('name-in').value;
    if(!val) return;
    state.user.name = val;
    localStorage.setItem('cas-name', val);
    syncUI();
    alert("Profile Successfully Updated");
}

function addPoints(pts) {
    state.user.points += pts;
    localStorage.setItem('cas-points', state.user.points);
    alert("Entry Saved! You earned " + pts + " API points.");
    loadView('Scoring Analytics');
}