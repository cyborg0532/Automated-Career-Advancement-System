// ==================== API CONFIGURATION ====================
// Automatically detect if running locally or in production
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'  // Local development
    : 'https://your-backend-app.onrender.com/api';  // Production - UPDATE THIS after deploying backend

// ==================== STATE MANAGEMENT ====================
const state = {
    currentUser: {
        isLoggedIn: false,
        profileComplete: 0,
        name: '',
        email: '',
        role: ''
    },
    currentView: 'dashboard'
};

// ==================== PAGE ELEMENTS ====================
const pages = {
    signup: document.getElementById('signupPage'),
    login: document.getElementById('loginPage'),
    profileSetup: document.getElementById('profileSetupPage'),
    mainApp: document.getElementById('mainApp')
};

// ==================== NAVIGATION FUNCTIONS ====================
function showPage(pageName) {
    // Hide all pages
    Object.values(pages).forEach(page => page.classList.add('hidden'));

    // Show requested page
    if (pages[pageName]) {
        pages[pageName].classList.remove('hidden');
    }
}

function showAlert(elementId, message, type = 'error') {
    const alertDiv = document.getElementById(elementId);
    alertDiv.innerHTML = `
        <div class="alert ${type}">
            <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    setTimeout(() => {
        alertDiv.innerHTML = '';
    }, 5000);
}

// ==================== SIGN UP LOGIC ====================
document.getElementById('signupForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    const role = document.getElementById('signupRole').value;

    if (!name || !email || !password || !confirmPassword || !role) {
        showAlert('signupAlert', 'Please fill in all fields', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showAlert('signupAlert', 'Passwords do not match', 'error');
        return;
    }

    if (password.length < 6) {
        showAlert('signupAlert', 'Password must be at least 6 characters', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role })
        });

        const data = await response.json();

        if (response.ok) {
            showAlert('signupAlert', 'Account created successfully! Redirecting to login...', 'success');
            setTimeout(() => {
                showPage('login');
                document.getElementById('signupForm').reset();
            }, 1500);
        } else {
            showAlert('signupAlert', data.message || 'Signup failed', 'error');
        }
    } catch (error) {
        console.error('Signup Error:', error);
        showAlert('signupAlert', 'Server error. Please try again.', 'error');
    }
});

// ==================== LOGIN LOGIC ====================
document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Update state
            state.currentUser.isLoggedIn = true;
            state.currentUser.name = data.name;
            state.currentUser.email = data.email;
            state.currentUser.role = data.role;
            state.currentUser.profileComplete = data.profileComplete;

            // Save token
            localStorage.setItem('cas_token', data.token);

            showAlert('loginAlert', 'Login successful!', 'success');

            setTimeout(() => {
                if (data.profileComplete < 80) {
                    showPage('profileSetup');
                    // Populate profile form if data exists
                    if (data.profileData) {
                        Object.keys(data.profileData).forEach(key => {
                            const el = document.getElementById('profile' + key.charAt(0).toUpperCase() + key.slice(1));
                            if (el) el.value = data.profileData[key];
                        });
                    }
                    updateProfileProgress();
                } else {
                    initializeDashboard();
                    showPage('mainApp');
                }
                document.getElementById('loginForm').reset();
            }, 1000);
        } else {
            showAlert('loginAlert', data.message || 'Invalid email or password', 'error');
        }
    } catch (error) {
        console.error('Login Error:', error);
        showAlert('loginAlert', 'Server connection failed', 'error');
    }
});

// ==================== PROFILE SETUP LOGIC ====================
const profileFields = [
    'profilePhone',
    'profileDepartment',
    'profileExperience',
    'profileSpecialization',
    'profileQualification',
    'profileEmployeeId',
    'profileBio'
];

function updateProfileProgress() {
    let filledFields = 0;
    const totalFields = profileFields.length;

    profileFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && field.value.trim()) {
            filledFields++;
        }
    });

    const progress = Math.round((filledFields / totalFields) * 100);
    state.currentUser.profileComplete = progress;

    const progressBar = document.getElementById('profileProgressBar');
    const progressText = document.getElementById('profileProgressText');

    if (progressBar) progressBar.style.width = progress + '%';
    if (progressText) progressText.textContent = progress + '%';

    return progress;
}

// Update progress on input
profileFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    field.addEventListener('input', updateProfileProgress);
});

document.getElementById('profileSetupForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const profileData = {};

    // Explicit mapping to match User.js schema
    const fieldMapping = {
        'profilePhone': 'phone',
        'profileDepartment': 'department',
        'profileExperience': 'experience',
        'profileSpecialization': 'specialization',
        'profileQualification': 'qualification',
        'profileEmployeeId': 'employeeId',
        'profileBio': 'bio'
    };

    profileFields.forEach(fieldId => {
        const val = document.getElementById(fieldId).value.trim();
        const schemaKey = fieldMapping[fieldId];

        if (val && schemaKey) {
            profileData[schemaKey] = val;
        }
    });

    const progress = updateProfileProgress(); // Logic reused for UI feedback

    const token = localStorage.getItem('cas_token');
    if (!token) return showPage('login');

    try {
        const response = await fetch(`${API_BASE_URL}/profile/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                profileData,
                profileComplete: progress
            })
        });

        if (response.ok) {
            if (progress < 80) {
                alert('Profile saved. Please complete at least 80% to continue.');
                return;
            }

            state.currentUser.profileComplete = progress;

            // Initialize and show dashboard
            initializeDashboard();
            showPage('mainApp');
        } else {
            alert('Failed to update profile');
        }
    } catch (err) {
        console.error('Profile update error', err);
        alert('Error updating profile');
    }
});

// ==================== DASHBOARD INITIALIZATION ====================
async function initializeDashboard() {
    const token = localStorage.getItem('cas_token');
    if (!token) return showPage('login');

    try {
        // Fetch Profile
        const profileRes = await fetch(`${API_BASE_URL}/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        // Fetch Dashboard Stats
        const statsRes = await fetch(`${API_BASE_URL}/dashboard`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (profileRes.ok && statsRes.ok) {
            const profileData = await profileRes.json();
            const statsData = await statsRes.json();

            // Update UI
            document.getElementById('userName').textContent = profileData.name || 'User';
            document.getElementById('userRole').textContent = profileData.role || 'Member';
            document.getElementById('userAvatar').textContent = (profileData.name || 'U').charAt(0).toUpperCase();

            state.currentUser = { ...state.currentUser, ...profileData };

            // Initialize charts with dynamic data
            initializeCharts(statsData);
        } else {
            localStorage.removeItem('cas_token');
            showPage('login');
        }
    } catch (error) {
        console.error('Error fetching dashboard data', error);
    }
}

// ==================== NAVIGATION BETWEEN PAGES ====================
document.getElementById('goToLogin').addEventListener('click', function (e) {
    e.preventDefault();
    showPage('login');
});

document.getElementById('goToSignup').addEventListener('click', function (e) {
    e.preventDefault();
    showPage('signup');
});

// ==================== USER DROPDOWN MENU ====================
const userMenuBtn = document.getElementById('userMenuBtn');
const userDropdown = document.getElementById('userDropdown');
const dropdownProfile = document.getElementById('dropdownProfile');
const dropdownSettings = document.getElementById('dropdownSettings');
const dropdownLogout = document.getElementById('dropdownLogout');

// Toggle dropdown
if (userMenuBtn) {
    userMenuBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        userDropdown.classList.toggle('show');
        userMenuBtn.classList.toggle('active');
    });
}

// Close dropdown when clicking outside
document.addEventListener('click', function (e) {
    if (userDropdown && !userDropdown.contains(e.target) && e.target !== userMenuBtn) {
        userDropdown.classList.remove('show');
        userMenuBtn.classList.remove('active');
    }
});

// Dropdown menu actions
if (dropdownProfile) {
    dropdownProfile.addEventListener('click', function () {
        userDropdown.classList.remove('show');
        userMenuBtn.classList.remove('active');
        showProfileModal();
    });
}

if (dropdownSettings) {
    dropdownSettings.addEventListener('click', function () {
        userDropdown.classList.remove('show');
        userMenuBtn.classList.remove('active');
        // Navigate to settings view
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        document.querySelector('[data-view="settings"]').classList.add('active');
        document.querySelectorAll('.view-section').forEach(view => view.classList.remove('active'));
        document.getElementById('settingsView').classList.add('active');
    });
}

if (dropdownLogout) {
    dropdownLogout.addEventListener('click', function () {
        userDropdown.classList.remove('show');
        userMenuBtn.classList.remove('active');
        if (confirm('Are you sure you want to logout?')) {
            state.currentUser.isLoggedIn = false;
            state.currentUser.profileComplete = 0;
            localStorage.removeItem('cas_token');
            showPage('login');
        }
    });
}


// ==================== PROFILE MODAL ====================
const profileModal = document.getElementById('profileModal');
const userProfileBtn = document.getElementById('userProfileBtn');
const closeProfileModal = document.getElementById('closeProfileModal');
const closeProfileModalBtn = document.getElementById('closeProfileModalBtn');
const profileModalOverlay = document.getElementById('profileModalOverlay');
const editProfileBtn = document.getElementById('editProfileBtn');

// Function to populate and show profile modal
async function showProfileModal() {
    const token = localStorage.getItem('cas_token');
    if (!token) return;

    try {
        const response = await fetch(`${API_BASE_URL}/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const profileData = await response.json();

            // Populate modal fields
            document.getElementById('profileModalName').textContent = profileData.name || '-';
            document.getElementById('profileModalEmail').textContent = profileData.email || '-';
            document.getElementById('profileModalRole').textContent = profileData.role || '-';
            document.getElementById('profileModalPhone').textContent = profileData.profileData?.phone || '-';
            document.getElementById('profileModalDepartment').textContent = profileData.profileData?.department || '-';
            document.getElementById('profileModalExperience').textContent = profileData.profileData?.experience ? `${profileData.profileData.experience} years` : '-';
            document.getElementById('profileModalQualification').textContent = profileData.profileData?.qualification || '-';
            document.getElementById('profileModalEmployeeId').textContent = profileData.profileData?.employeeId || '-';
            document.getElementById('profileModalSpecialization').textContent = profileData.profileData?.specialization || '-';
            document.getElementById('profileModalBio').textContent = profileData.profileData?.bio || '-';

            // Update progress bar
            const progress = profileData.profileComplete || 0;
            document.getElementById('profileModalProgress').style.width = progress + '%';
            document.getElementById('profileModalProgressText').textContent = progress + '%';

            // Show modal
            profileModal.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error fetching profile data:', error);
    }
}

// Event listeners for opening modal
if (userProfileBtn) {
    userProfileBtn.addEventListener('click', showProfileModal);
}

// Event listeners for closing modal
function closeModal() {
    profileModal.classList.add('hidden');
}

if (closeProfileModal) {
    closeProfileModal.addEventListener('click', closeModal);
}

if (closeProfileModalBtn) {
    closeProfileModalBtn.addEventListener('click', closeModal);
}

if (profileModalOverlay) {
    profileModalOverlay.addEventListener('click', closeModal);
}

// Edit profile button - navigate to profile setup page
if (editProfileBtn) {
    editProfileBtn.addEventListener('click', function () {
        closeModal();
        showPage('profileSetup');
        // Populate the profile setup form with current data
        const token = localStorage.getItem('cas_token');
        if (token) {
            fetch(`${API_BASE_URL}/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.profileData) {
                        document.getElementById('profilePhone').value = data.profileData.phone || '';
                        document.getElementById('profileDepartment').value = data.profileData.department || '';
                        document.getElementById('profileExperience').value = data.profileData.experience || '';
                        document.getElementById('profileSpecialization').value = data.profileData.specialization || '';
                        document.getElementById('profileQualification').value = data.profileData.qualification || '';
                        document.getElementById('profileEmployeeId').value = data.profileData.employeeId || '';
                        document.getElementById('profileBio').value = data.profileData.bio || '';
                        updateProfileProgress();
                    }
                });
        }
    });
}

// Close modal on Escape key
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !profileModal.classList.contains('hidden')) {
        closeModal();
    }
});


// ==================== VIEW SWITCHING ====================
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function () {
        const viewName = this.dataset.view;

        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');

        // Show corresponding view
        document.querySelectorAll('.view-section').forEach(view => view.classList.remove('active'));
        document.getElementById(viewName + 'View').classList.add('active');

        state.currentView = viewName;

        // Close mobile sidebar if open
        if (window.innerWidth <= 768) {
            document.querySelector('.sidebar').classList.remove('mobile-show');
            document.getElementById('sidebarOverlay').classList.remove('show');
        }
    });
});

// ==================== MOBILE MENU TOGGLE ====================
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const sidebar = document.querySelector('.sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', function () {
        sidebar.classList.toggle('mobile-show');
        sidebarOverlay.classList.toggle('show');
    });
}

if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', function () {
        sidebar.classList.remove('mobile-show');
        sidebarOverlay.classList.remove('show');
    });
}


// ==================== CHARTS INITIALIZATION ====================
function initializeCharts(stats) {
    // Default fallbacks if stats are missing (e.g. new user without generated stats)
    // In a real app, backend ensures these exist.
    const s = stats || {
        performance: { labels: [], data: [] },
        grades: { labels: [], data: [] },
        subjects: { labels: [], data: [] },
        assessments: { labels: [], data: [] }
    };

    // Performance Trends Chart
    const perfCtx = document.getElementById('performanceChart');
    if (perfCtx) {
        // Destroy existing chart if it exists to allow updates
        if (window.perfChartInstance) window.perfChartInstance.destroy();

        window.perfChartInstance = new Chart(perfCtx, {
            type: 'line',
            data: {
                labels: s.performance.labels,
                datasets: [{
                    label: 'Average Score',
                    data: s.performance.data,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: false, min: 0 } }
            }
        });
    }

    // Grade Distribution Chart
    const gradeCtx = document.getElementById('gradeChart');
    if (gradeCtx) {
        if (window.gradeChartInstance) window.gradeChartInstance.destroy();

        window.gradeChartInstance = new Chart(gradeCtx, {
            type: 'doughnut',
            data: {
                labels: s.grades.labels,
                datasets: [{
                    data: s.grades.data,
                    backgroundColor: ['#059669', '#2563eb', '#d97706', '#dc2626', '#6b7280']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    }

    // Subject Performance Chart
    const subjectCtx = document.getElementById('subjectChart');
    if (subjectCtx) {
        if (window.subjectChartInstance) window.subjectChartInstance.destroy();

        window.subjectChartInstance = new Chart(subjectCtx, {
            type: 'bar',
            data: {
                labels: s.subjects.labels,
                datasets: [{
                    label: 'Average Score',
                    data: s.subjects.data,
                    backgroundColor: '#2563eb'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, max: 100 } }
            }
        });
    }

    // Assessment Type Chart
    const assessmentCtx = document.getElementById('assessmentTypeChart');
    if (assessmentCtx) {
        if (window.assessmentChartInstance) window.assessmentChartInstance.destroy();

        window.assessmentChartInstance = new Chart(assessmentCtx, {
            type: 'pie',
            data: {
                labels: s.assessments.labels,
                datasets: [{
                    data: s.assessments.data,
                    backgroundColor: ['#2563eb', '#059669', '#d97706', '#dc2626']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    }
}

// ==================== INITIALIZATION ====================
window.addEventListener('DOMContentLoaded', async function () {
    // Check if user is already logged in
    const token = localStorage.getItem('cas_token');

    if (token) {
        // validate token by fetching profile
        try {
            const response = await fetch(`${API_BASE_URL}/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                state.currentUser.isLoggedIn = true;
                state.currentUser.name = data.name;
                state.currentUser.email = data.email;
                state.currentUser.role = data.role;
                state.currentUser.profileComplete = data.profileComplete;

                // If profile is incomplete (<80%), redirect to setup
                if (data.profileComplete < 80) {
                    showPage('profileSetup');
                    updateProfileProgress();
                } else {
                    initializeDashboard();
                    showPage('mainApp');
                }
            } else {
                localStorage.removeItem('cas_token');
                showPage('login');
            }
        } catch (e) {
            // Start fresh
            showPage('login');
        }
    } else {
        // New user - show signup or login
        // Code originally showed signup first?
        showPage('signup');
    }
});

// ==================== CHATBOT INTEGRATION ====================
// Hugging Face API Configuration

async function getAIResponse(userMessage) {
    try {
        // Use our own backend proxy
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                inputs: userMessage,
                parameters: {
                    max_new_tokens: 250,
                    temperature: 0.7,
                    top_p: 0.9,
                    return_full_text: false
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            throw new Error(`API error (${response.status}): ${errorText}`);
        }

        const data = await response.json();

        if (data && data[0] && data[0].generated_text) {
            return data[0].generated_text.trim();
        } else if (data && data.error) {
            throw new Error(data.error);
        } else {
            // Some models return just the text or different format
            if (data.generated_text) return data.generated_text;
            // Fallback check
            if (Array.isArray(data) && data.length > 0) return JSON.stringify(data[0]);
            return "I couldn't understand the response.";
        }
    } catch (error) {
        console.error('Full error:', error);
        throw new Error(`Failed to get AI response: ${error.message}`);
    }
}



// Chatbot UI Initialization
function initializeChatbot() {
    const chatbotHTML = `
        <!-- Floating Chatbot Button -->
        <button id="chatbotBtn" style="
            position: fixed; bottom: 24px; right: 24px; z-index: 1000;
            width: 64px; height: 64px; border-radius: 50%;
            background: var(--accent-primary);
            color: white; border: none; cursor: pointer;
            box-shadow: var(--shadow-xl);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex; align-items: center; justify-content: center;
            font-size: 28px;
        ">
            <i class="fas fa-comments"></i>
        </button>

        <!-- Chat Window -->
        <div id="chatWindow" style="
            position: fixed; bottom: 100px; right: 24px; z-index: 999;
            width: 420px; height: 600px; border-radius: 24px;
            background: white; box-shadow: var(--shadow-xl);
            border: 1px solid var(--border-color);
            display: none; flex-direction: column;
            animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            backdrop-filter: blur(20px);
        ">
            <!-- Chat Header -->
            <div style="
                padding: 20px; background: var(--accent-primary);
                color: white; border-radius: 24px 24px 0 0;
                display: flex; justify-content: space-between; align-items: center;
            ">
                <div>
                    <h3 style="margin: 0; font-size: 16px; font-weight: 700;">Automated CAS Assistant</h3>
                    <p style="margin: 2px 0 0 0; font-size: 12px; opacity: 0.9;">Online - Always here to help</p>
                </div>
                <button id="closeChat" style="
                    background: rgba(255,255,255,0.2); border: none;
                    color: white; font-size: 20px; cursor: pointer;
                    width: 32px; height: 32px; border-radius: 8px;
                    transition: all 0.3s ease;
                ">✕</button>
            </div>

            <!-- Messages Area -->
            <div id="chatMessages" style="
                flex: 1; overflow-y: auto; padding: 20px;
                display: flex; flex-direction: column; gap: 12px;
            "></div>

            <!-- Input Area -->
            <div style="
                padding: 16px; border-top: 1px solid var(--border-color);
                display: flex; gap: 8px;
            ">
                <input type="text" id="chatInput" placeholder="Ask me anything..." style="
                    flex: 1; padding: 12px 16px;
                    background: var(--bg-secondary); border: 1px solid var(--border-color);
                    border-radius: 12px; outline: none;
                    font-family: 'Inter', sans-serif; font-size: 14px;
                    transition: all 0.3s ease;
                ">
                <button id="sendBtn" style="
                    padding: 12px 16px; background: var(--accent-primary);
                    color: white; border: none; border-radius: 12px;
                    cursor: pointer; font-weight: 600; transition: all 0.3s ease;
                ">Send</button>
            </div>
        </div>
    `;

    // Add Chatbot to Page
    document.body.insertAdjacentHTML('beforeend', chatbotHTML);

    // Event Listeners
    const chatbotBtn = document.getElementById('chatbotBtn');
    const chatWindow = document.getElementById('chatWindow');
    const closeChat = document.getElementById('closeChat');
    const sendBtn = document.getElementById('sendBtn');
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');

    // Toggle Chat Window
    chatbotBtn.addEventListener('click', () => {
        chatWindow.style.display = chatWindow.style.display === 'none' ? 'flex' : 'none';
        if (chatWindow.style.display === 'flex') {
            chatInput.focus();
            // Add welcome message if empty
            if (chatMessages.children.length === 0) {
                addBotMessage("👋 Welcome to Automated CAS! How can I assist you today?");
            }
        }
    });

    closeChat.addEventListener('click', () => {
        chatWindow.style.display = 'none';
    });

    // Add message function
    function addMessage(text, isUser) {
        const msgDiv = document.createElement('div');
        msgDiv.style.cssText = `
            display: flex; justify-content: ${isUser ? 'flex-end' : 'flex-start'};
            animation: fadeInUp 0.3s ease;
        `;

        const bubble = document.createElement('div');
        bubble.style.cssText = `
            max-width: 80%; padding: 12px 16px; border-radius: 16px;
            word-wrap: break-word; font-size: 14px; line-height: 1.4;
            background: ${isUser ? 'var(--accent-primary)' : 'var(--bg-secondary)'};
            color: ${isUser ? 'white' : 'var(--text-primary)'};
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            white-space: pre-wrap;
        `;
        bubble.textContent = text;
        msgDiv.appendChild(bubble);
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addBotMessage(text) {
        addMessage(text, false);
    }

    // Loading indicator
    function addLoadingIndicator() {
        const msgDiv = document.createElement('div');
        msgDiv.id = 'chatLoading';
        msgDiv.style.cssText = 'display: flex; justify-content: flex-start; animation: fadeInUp 0.3s ease;';
        const bubble = document.createElement('div');
        bubble.style.cssText = `
            padding: 12px 20px; border-radius: 16px;
            background: var(--bg-secondary); color: var(--text-secondary);
            font-size: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        `;
        bubble.textContent = 'AI is thinking...';
        bubble.style.animation = 'pulse 1.2s ease-in-out infinite';
        msgDiv.appendChild(bubble);
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function removeLoadingIndicator() {
        const loader = document.getElementById('chatLoading');
        if (loader) loader.remove();
    }

    // Send Message (async - calls Hugging Face API)
    let isSending = false;
    async function sendMessage() {
        const text = chatInput.value.trim();
        if (!text || isSending) return;

        isSending = true;
        addMessage(text, true);
        chatInput.value = '';
        sendBtn.disabled = true;
        sendBtn.style.opacity = '0.6';
        addLoadingIndicator();

        try {
            const reply = await getAIResponse(text);
            removeLoadingIndicator();
            addBotMessage(reply);
        } catch (err) {
            removeLoadingIndicator();
            console.error('Chatbot API error:', err);
            addBotMessage('Error: ' + err.message + '\n\nTip: Open browser console (F12) for details. If you see a CORS or network error, make sure you are running this via a local server (e.g. Live Server in VS Code), not opening the file directly.');
        } finally {
            isSending = false;
            sendBtn.disabled = false;
            sendBtn.style.opacity = '1';
        }
    }

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Add hover effect to chat button
    chatbotBtn.addEventListener('mouseover', () => {
        chatbotBtn.style.transform = 'scale(1.1)';
        chatbotBtn.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.2)';
    });

    chatbotBtn.addEventListener('mouseout', () => {
        chatbotBtn.style.transform = 'scale(1)';
        chatbotBtn.style.boxShadow = 'var(--shadow-xl)';
    });

    // Add input focus effect
    chatInput.addEventListener('focus', function () {
        this.style.borderColor = 'var(--accent-primary)';
        this.style.background = 'white';
        this.style.boxShadow = '0 0 0 3px rgba(15, 23, 42, 0.1)';
    });

    chatInput.addEventListener('blur', function () {
        this.style.borderColor = 'var(--border-color)';
        this.style.background = 'var(--bg-secondary)';
        this.style.boxShadow = 'none';
    });
}

// Initialize chatbot when dashboard loads
initializeChatbot();
