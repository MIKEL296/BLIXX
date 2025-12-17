// ==================== Video Player Functions ====================
function playVideo() {
    const videoModal = document.getElementById('videoModal');
    videoModal.classList.add('show');

    const videoPlayer = document.getElementById('videoPlayer');
    videoPlayer.play();
}

function closeVideo() {
    const videoModal = document.getElementById('videoModal');
    videoModal.classList.remove('show');

    const videoPlayer = document.getElementById('videoPlayer');
    videoPlayer.pause();
}

// ==================== Info Modal Functions ====================
function showInfo() {
    const infoModal = document.getElementById('infoModal');
    infoModal.classList.add('show');
}

function closeInfo() {
    const infoModal = document.getElementById('infoModal');
    infoModal.classList.remove('show');
}

// ==================== Show Selection ====================
function selectShow(element) {
    const title = element.querySelector('h3').textContent;
    const rating = element.querySelector('.card-rating').textContent;
    const meta = element.querySelector('.card-meta').textContent;

    console.log(`Selected: ${title} - ${rating} - ${meta}`);

    // Create and show notification
    showNotification(`Now watching: ${title}`);

    // You can add additional functionality here
}

// ==================== Demo Gmail Auth Flow ====================
function openAuthModal() {
    const m = document.getElementById('authModal');
    if (m) m.classList.add('show');
}

function closeAuthModal() {
    const m = document.getElementById('authModal');
    if (m) m.classList.remove('show');
}

function openVerifyModal() {
    const vm = document.getElementById('verifyModal');
    const pending = JSON.parse(localStorage.getItem('auth_pending') || 'null');
    const email = pending && pending.email ? pending.email : '';
    const verifyText = document.getElementById('verifyEmailText');
    if (verifyText) verifyText.textContent = email;
    if (vm) vm.classList.add('show');
}

function closeVerifyModal() {
    const vm = document.getElementById('verifyModal');
    if (vm) vm.classList.remove('show');
}

function sendAuthCode() {
    const emailInput = document.getElementById('authEmail');
    if (!emailInput) return showNotification('Email input not found');
    const email = (emailInput.value || '').trim().toLowerCase();
    if (!email || !email.includes('@gmail.com')) {
        return showNotification('Please enter a valid Gmail address (demo).');
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutes

    const pending = { email, code, expires };
    localStorage.setItem('auth_pending', JSON.stringify(pending));

    // In a real app: send code to user's email via backend
    // For demo: show a notification containing the code
    showNotification(`Verification code (demo): ${code}`);
    closeAuthModal();
    openVerifyModal();
}

function verifyAuthCode() {
    const input = document.getElementById('verifyCodeInput');
    if (!input) return;
    const entered = (input.value || '').trim();
    const pending = JSON.parse(localStorage.getItem('auth_pending') || 'null');
    if (!pending) return showNotification('No pending verification. Start sign-in again.');

    if (Date.now() > pending.expires) {
        localStorage.removeItem('auth_pending');
        return showNotification('Verification code expired. Please request a new code.');
    }

    if (entered === pending.code) {
        // Create user record
        const user = { email: pending.email, verifiedAt: new Date().toISOString() };
        localStorage.setItem('streamhub_user', JSON.stringify(user));
        localStorage.removeItem('auth_pending');
        closeVerifyModal();
        showNotification(`Welcome, ${user.email}`);
        updateAccountUI();
    } else {
        showNotification('Incorrect verification code.');
    }
}

// ==================== Simple Password-based Accounts (demo) ====================
function getUsers() {
    return JSON.parse(localStorage.getItem('streamhub_users') || '{}');
}

function setUsers(obj) {
    localStorage.setItem('streamhub_users', JSON.stringify(obj));
}

async function hashPassword(password) {
    try {
        const enc = new TextEncoder();
        const data = enc.encode(password);
        const hash = await crypto.subtle.digest('SHA-256', data);
        const arr = Array.from(new Uint8Array(hash));
        return arr.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
        // Fallback: do plain (insecure) return
        return password;
    }
}

async function createAccount(email, password) {
    email = (email || '').trim().toLowerCase();
    if (!email || !email.includes('@')) return { ok: false, msg: 'Enter a valid email.' };
    if (!password || password.length < 6) return { ok: false, msg: 'Password must be at least 6 characters.' };

    const users = getUsers();
    if (users[email]) return { ok: false, msg: 'Account already exists.' };

    const hash = await hashPassword(password);
    users[email] = { email, passwordHash: hash, createdAt: new Date().toISOString(), provider: 'local' };
    setUsers(users);

    // Automatically sign in
    const user = { email, provider: 'local', signedInAt: new Date().toISOString() };
    localStorage.setItem('streamhub_user', JSON.stringify(user));
    updateAccountUI();
    // Redirect back to main app if on signup page
    postAuthRedirect();
    return { ok: true, user };
}

async function signInWithPassword(email, password) {
    email = (email || '').trim().toLowerCase();
    if (!email || !password) return { ok: false, msg: 'Email and password required.' };

    const users = getUsers();
    const record = users[email];
    if (!record) return { ok: false, msg: 'No account found for that email.' };

    const hash = await hashPassword(password);
    if (hash !== record.passwordHash) return { ok: false, msg: 'Incorrect password.' };

    const user = { email, provider: 'local', signedInAt: new Date().toISOString() };
    localStorage.setItem('streamhub_user', JSON.stringify(user));
    updateAccountUI();
    // Redirect back to main app if on signup page
    postAuthRedirect();
    return { ok: true, user };
}

function updateAccountUI() {
    const user = JSON.parse(localStorage.getItem('streamhub_user') || 'null');
    const authBtn = document.getElementById('authBtn');
    const signupBtn = document.querySelector('.btn-signup'); // Select the new button
    const accountMenu = document.getElementById('accountMenu');
    // ... existing variables ...

    if (user) {
        if (authBtn) authBtn.style.display = 'none';
        if (signupBtn) signupBtn.style.display = 'none'; // Hide Sign up when logged in
        if (accountMenu) accountMenu.style.display = 'inline-block';
        // ... rest of logic ...
    } else {
        if (authBtn) authBtn.style.display = 'inline-block';
        if (signupBtn) signupBtn.style.display = 'inline-block'; // Show Sign up when logged out
        if (accountMenu) accountMenu.style.display = 'none';
    }
}


function logout() {
    localStorage.removeItem('streamhub_user');
    updateAccountUI();
    showNotification('Logged out');
}

function updateAccountUI() {
    const user = JSON.parse(localStorage.getItem('streamhub_user') || 'null');
    const authBtn = document.getElementById('authBtn');
    const accountMenu = document.getElementById('accountMenu');
    const accountEmail = document.getElementById('accountEmail');
    const accountDropdown = document.getElementById('accountDropdown');

    if (user) {
        if (authBtn) authBtn.style.display = 'none';
        if (accountMenu) accountMenu.style.display = 'inline-block';
        if (accountEmail) accountEmail.textContent = user.email + (user.provider ? ' (' + user.provider + ')' : '');

        // show/hide dropdown on click
        const accountBtn = document.getElementById('accountBtn');
        if (accountBtn) {
            accountBtn.onclick = () => {
                if (accountDropdown) accountDropdown.style.display = accountDropdown.style.display === 'none' ? 'block' : 'none';
            };
        }

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) logoutBtn.onclick = logout;
    } else {
        if (authBtn) authBtn.style.display = 'inline-block';
        if (accountMenu) accountMenu.style.display = 'none';
    }
}

// Wire auth button
document.addEventListener('DOMContentLoaded', function() {
    const authBtn = document.getElementById('authBtn');
    if (authBtn) authBtn.addEventListener('click', function() {
        openAuthModal();
    });

    // If verify modal exists, wire Enter key
    const verifyInput = document.getElementById('verifyCodeInput');
    if (verifyInput) {
        verifyInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') verifyAuthCode();
        });
    }

    updateAccountUI();
});

// Wire password-based sign up / sign in buttons (support multiple id variants)
document.addEventListener('DOMContentLoaded', function() {
    // Sign-up / create account button
    const createButtons = [
        'signUpBtn', 'createAccountBtn', 'authCreateBtn'
    ];

    createButtons.forEach(id => {
        const btn = document.getElementById(id);
        if (!btn) return;
        btn.addEventListener('click', async function(e) {
            e.preventDefault();
            // Try common input ids
            const emailEl = document.getElementById('authEmail') || document.getElementById('signUpEmail') || document.getElementById('email');
            const passEl = document.getElementById('authPassword') || document.getElementById('signUpPassword') || document.getElementById('password');
            const passConfirmEl = document.getElementById('authConfirmPassword') || document.getElementById('signUpConfirm') || document.getElementById('confirmPassword');

            const email = emailEl ? emailEl.value : '';
            const password = passEl ? passEl.value : '';
            const confirm = passConfirmEl ? passConfirmEl.value : password;

            if (password !== confirm) return showNotification('Passwords do not match.');

            const res = await createAccount(email, password);
            if (!res.ok) return showNotification(res.msg || 'Could not create account');

            showNotification('Account created and signed in');
            closeAuthModal();
        });
    });

    // Sign-in buttons
    const signInButtons = ['signInBtn', 'signInWithPasswordBtn', 'authSignInBtn'];
    signInButtons.forEach(id => {
        const btn = document.getElementById(id);
        if (!btn) return;
        btn.addEventListener('click', async function(e) {
            e.preventDefault();
            const emailEl = document.getElementById('authEmail') || document.getElementById('signInEmail') || document.getElementById('email');
            const passEl = document.getElementById('authPassword') || document.getElementById('signInPassword') || document.getElementById('password');
            const email = emailEl ? emailEl.value : '';
            const password = passEl ? passEl.value : '';

            const res = await signInWithPassword(email, password);
            if (!res.ok) return showNotification(res.msg || 'Sign-in failed');

            showNotification(`Signed in as ${res.user.email}`);
            closeAuthModal();
        });
    });
});

// ==================== Google Identity Integration (optional production)
// Reads the meta tag `google-signin-client_id` in the document head. If set,
// the Google Identity button is rendered in the auth modal and will call
// `handleCredentialResponse` with an ID token when a user signs in.
function initGoogleIdentity() {
    try {
        const meta = document.querySelector('meta[name="google-signin-client_id"]');
        const stored = localStorage.getItem('google_signin_client_id') || '';
        let clientId = '';
        if (meta && meta.content) {
            const c = meta.content.trim();
            if (c && !c.startsWith('REPLACE_WITH')) clientId = c;
        }
        if (!clientId && stored) clientId = stored.trim();

        if (!clientId) {
            // No configured client id; nothing to initialize here
            return;
        }

        // Initialize Google Identity Services (wait if `google` not ready)
        if (!(window.google && google.accounts && google.accounts.id)) {
            // try again shortly
            setTimeout(initGoogleIdentity, 500);
            return;
        }

        try {
            google.accounts.id.initialize({
                client_id: clientId,
                callback: handleCredentialResponse,
            });

            // Render a standard Google Sign-In button
            const container = document.getElementById('googleSignInBtn');
            if (container) {
                // Clear previous contents then render
                container.innerHTML = '';
                google.accounts.id.renderButton(container, { theme: 'outline', size: 'large', width: '250' });
            }

            // Optionally show One Tap (commented out; enable if desired)
            // google.accounts.id.prompt();
        } catch (e) {
            console.warn('Google accounts init error', e);
        }
    } catch (err) {
        console.warn('Google Identity init failed:', err);
    }
}

function saveGoogleClientId() {
    const input = document.getElementById('googleClientIdInput');
    if (!input) return showNotification('Client ID input not found');
    const v = (input.value || '').trim();
    if (!v) return showNotification('Enter a valid Google Client ID');
    // Basic validation: should end with .apps.googleusercontent.com
    const re = /^[0-9A-Za-z\-\.]+\.apps\.googleusercontent\.com$/;
    if (!re.test(v)) return showNotification('Client ID looks invalid. It should end with .apps.googleusercontent.com');
    localStorage.setItem('google_signin_client_id', v);
    showNotification('Saved Google Client ID');
    // Attempt to initialize immediately
    setTimeout(() => {
        try {
            initGoogleIdentity();
            showNotification('Google sign-in initialized');
        } catch (e) {
            showNotification('Initialization failed; try reloading');
        }
    }, 500);
}

function clearGoogleClientId() {
    localStorage.removeItem('google_signin_client_id');
    const input = document.getElementById('googleClientIdInput');
    if (input) input.value = '';
    // Remove rendered button if present
    const container = document.getElementById('googleSignInBtn');
    if (container) container.innerHTML = '';
    showNotification('Cleared saved Google Client ID');
}

function openGoogleClientIdHelp() {
    const url = 'https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid';
    try {
        window.open(url, '_blank');
    } catch (e) {
        showNotification('Unable to open help link.');
    }
}

// Wire client-id save input in auth modal
document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('googleClientIdInput');
    const saveBtn = document.getElementById('saveGoogleClientIdBtn');
    if (input) {
        const stored = localStorage.getItem('google_signin_client_id');
        if (stored) input.value = stored;
    }
    if (saveBtn) {
        saveBtn.addEventListener('click', function(e) {
            e.preventDefault();
            saveGoogleClientId();
        });
    }
    const clearBtn = document.getElementById('clearGoogleClientIdBtn');
    if (clearBtn) clearBtn.addEventListener('click', function(e) {
        e.preventDefault();
        clearGoogleClientId();
    });
    const helpBtn = document.getElementById('helpGoogleClientIdBtn');
    if (helpBtn) helpBtn.addEventListener('click', function(e) {
        e.preventDefault();
        openGoogleClientIdHelp();
    });
    // Wire link / trusted google buttons
    const linkBtn = document.getElementById('linkGoogleBtn');
    const trustedBtn = document.getElementById('trustedGoogleBtn');
    if (linkBtn) linkBtn.addEventListener('click', function(e) {
        e.preventDefault();
        linkGoogleToAccount();
    });
    if (trustedBtn) trustedBtn.addEventListener('click', function(e) {
        e.preventDefault();
        signInWithGoogleTrusted();
    });
});

// Pending link info stored temporarily while user confirms
let pendingGoogleLink = null;

function showLinkConfirmModalFor(email, name, credential) {
    pendingGoogleLink = { email, name, credential };
    const m = document.getElementById('linkConfirmModal');
    const txt = document.getElementById('linkConfirmText');
    if (txt) txt.innerHTML = `Link the Google account <strong>${email}</strong> to your current StreamHub account?`;
    if (m) m.classList.add('show');
}

function closeLinkConfirmModal() {
    const m = document.getElementById('linkConfirmModal');
    if (m) m.classList.remove('show');
    pendingGoogleLink = null;
}

async function confirmLink() {
    if (!pendingGoogleLink) return showNotification('Nothing to link.');
    const { email } = pendingGoogleLink;
    // perform the same linking logic as before
    const current = JSON.parse(localStorage.getItem('streamhub_user') || 'null');
    if (!current) {
        closeLinkConfirmModal();
        return showNotification('No local user signed in to link to.');
    }

    try {
        const users = getUsers();
        const localRecord = users[current.email] || { email: current.email };
        localRecord.googleEmail = email.toLowerCase();
        localRecord.googleLinkedAt = new Date().toISOString();
        localRecord.provider = localRecord.provider ? (localRecord.provider.includes('google') ? localRecord.provider : localRecord.provider + '+google') : 'local+google';
        users[current.email] = localRecord;
        setUsers(users);

        const session = JSON.parse(localStorage.getItem('streamhub_user') || 'null');
        if (session) {
            session.googleLinked = localRecord.googleEmail;
            session.provider = localRecord.provider;
            localStorage.setItem('streamhub_user', JSON.stringify(session));
        }

        updateAccountUI();
        closeLinkConfirmModal();
        showNotification(`Linked Google account: ${localRecord.googleEmail}`);
    } catch (e) {
        console.warn('confirmLink error', e);
        showNotification('Failed to link Google account.');
        closeLinkConfirmModal();
    }
}

// Wire confirm button
document.addEventListener('DOMContentLoaded', function() {
    const confirmBtn = document.getElementById('confirmLinkBtn');
    if (confirmBtn) confirmBtn.addEventListener('click', function(e) {
        e.preventDefault();
        confirmLink();
    });
});

function triggerGooglePrompt(action = 'signin') {
    // action: 'signin' | 'link' | 'trusted'
    if (!(window.google && google.accounts && google.accounts.id)) return showNotification('Google SDK not ready. Save client ID and reload if necessary.');
    try {
        localStorage.setItem('google_signin_action', action);
        // Show One Tap / account chooser
        google.accounts.id.prompt();
    } catch (e) {
        console.warn('triggerGooglePrompt error', e);
        showNotification('Unable to prompt Google sign-in.');
    }
}

function linkGoogleToAccount() {
    const current = JSON.parse(localStorage.getItem('streamhub_user') || 'null');
    if (!current) return showNotification('Please sign in to your account first to link Google.');
    triggerGooglePrompt('link');
    showNotification('Completing Google sign-in will link it to your account.');
}

function signInWithGoogleTrusted() {
    triggerGooglePrompt('trusted');
    showNotification('Please complete Google sign-in to continue.');
}

// Handle the JWT credential response from Google
function handleCredentialResponse(response) {
    if (!response || !response.credential) return;
    // Decode JWT payload (base64url)
    const payload = parseJwt(response.credential);
    const email = payload.email || payload['email'];
    const name = payload.name || '';

    // Determine context: normal signin, linking, or trusted signin
    const action = localStorage.getItem('google_signin_action') || 'signin';
    localStorage.removeItem('google_signin_action');

    if (!email) {
        return showNotification('Google sign-in succeeded but no email found.');
    }

    const gEmail = email.toLowerCase();

    if (action === 'link') {
        const current = JSON.parse(localStorage.getItem('streamhub_user') || 'null');
        if (!current) return showNotification('No local user signed in to link to.');

        // Attach google info to local users record (demo: stored in streamhub_users)
        try {
            const users = getUsers();
            const localRecord = users[current.email] || { email: current.email };
            localRecord.googleEmail = gEmail;
            localRecord.googleLinkedAt = new Date().toISOString();
            localRecord.provider = localRecord.provider ? (localRecord.provider.includes('google') ? localRecord.provider : localRecord.provider + '+google') : 'local+google';
            users[current.email] = localRecord;
            setUsers(users);

            // Update current session user to reflect link
            const session = JSON.parse(localStorage.getItem('streamhub_user') || 'null');
            if (session) {
                session.googleLinked = gEmail;
                session.provider = session.provider ? (session.provider.includes('google') ? session.provider : session.provider + '+google') : 'local+google';
                localStorage.setItem('streamhub_user', JSON.stringify(session));
            }

            updateAccountUI();
            closeAuthModal();
            showNotification(`Linked Google account: ${gEmail}`);
        } catch (e) {
            console.warn('Linking google failed', e);
            showNotification('Failed to link Google account.');
        }
        return;
    }

    // For sign-in / trusted: create/update session user from Google
    const user = { email: gEmail, name, verifiedAt: new Date().toISOString(), provider: 'google' };
    localStorage.setItem('streamhub_user', JSON.stringify(user));
    updateAccountUI();
    closeAuthModal();
    showNotification(`Welcome, ${user.email}`);

    // Redirect back to main app if on signup page
    postAuthRedirect();
}

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return {};
    }
}

// Initialize Google Identity after DOM and remote script load
window.addEventListener('load', function() {
    // Wait a tick so the async Google script can attach `google`
    setTimeout(initGoogleIdentity, 500);
});

// If the user signed in on a signup page, redirect them back to the main app
function postAuthRedirect() {
    try {
        const isSignupPage = (document && document.getElementById && document.getElementById('signupPage')) || window.location.pathname.endsWith('signup.html');
        if (isSignupPage) {
            setTimeout(() => { window.location.href = 'streaming_platform.html'; }, 700);
        }
    } catch (e) {
        // ignore failures
    }
}

// ==================== Notifications ====================
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #e50914;
        color: white;
        padding: 15px 25px;
        border-radius: 5px;
        font-weight: 600;
        z-index: 2000;
        animation: slideInNotification 0.3s ease;
        box-shadow: 0 4px 20px rgba(229, 9, 20, 0.4);
    `;

    document.body.appendChild(notification);

    // Auto-remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutNotification 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInNotification {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutNotification {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);

// ==================== Navigation Functionality ====================
document.addEventListener('DOMContentLoaded', function() {
    // Active nav link on scroll
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));

            // Add active class to clicked link
            this.classList.add('active');

            // Get the target section
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            // Scroll to target
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Update active nav link on page scroll
    window.addEventListener('scroll', function() {
        updateActiveNavLink();
    });
});

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;

        if (scrollY >= sectionTop - sectionHeight / 3) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
}

// ==================== Close Modals on Outside Click ====================
window.addEventListener('click', function(event) {
    const videoModal = document.getElementById('videoModal');
    const infoModal = document.getElementById('infoModal');

    if (event.target === videoModal) {
        closeVideo();
    }

    if (event.target === infoModal) {
        closeInfo();
    }
});

// ==================== Keyboard Shortcuts ====================
document.addEventListener('keydown', function(event) {
    // Close modals with Escape key
    if (event.key === 'Escape') {
        const videoModal = document.getElementById('videoModal');
        const infoModal = document.getElementById('infoModal');

        if (videoModal.classList.contains('show')) {
            closeVideo();
        }

        if (infoModal.classList.contains('show')) {
            closeInfo();
        }
    }
});

// ==================== Search Functionality ====================
const searchBox = document.querySelector('.search-box');

searchBox.addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const contentCards = document.querySelectorAll('.content-card');

    contentCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();

        if (title.includes(searchTerm)) {
            card.style.display = 'block';
            card.style.animation = 'fadeIn 0.3s ease';
        } else {
            card.style.display = 'none';
        }
    });
});

// ==================== Watchlist Functionality ====================
const watchlistBtn = document.querySelector('a[href="#watchlist"]');
let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

watchlistBtn.addEventListener('click', function(e) {
    e.preventDefault();
    showWatchlistModal();
});

function addToWatchlist(title) {
    if (!watchlist.includes(title)) {
        watchlist.push(title);
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
        showNotification(`Added to My List: ${title}`);
    }
}

function showWatchlistModal() {
    let watchlistContent = '<h2>My Watchlist</h2>';

    if (watchlist.length === 0) {
        watchlistContent += '<p>Your watchlist is empty</p>';
    } else {
        watchlistContent += '<ul style="list-style: none;">';
        watchlist.forEach(item => {
            watchlistContent += `<li style="padding: 10px; color: #fff; border-bottom: 1px solid rgba(255,255,255,0.1);">${item}</li>`;
        });
        watchlistContent += '</ul>';
    }

    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content info-modal">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            ${watchlistContent}
        </div>
    `;

    document.body.appendChild(modal);

    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// ==================== Dark Mode Toggle ====================
function toggleDarkMode() {
    document.body.classList.toggle('light-mode');
    const isDarkMode = !document.body.classList.contains('light-mode');
    localStorage.setItem('darkMode', isDarkMode);
}

// Load saved dark mode preference
document.addEventListener('DOMContentLoaded', function() {
    const isDarkMode = JSON.parse(localStorage.getItem('darkMode')) !== false;
    if (!isDarkMode) {
        document.body.classList.add('light-mode');
    }
});

// ==================== Lazy Loading for Images ====================
const imageElements = document.querySelectorAll('[style*="background"]');

if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                // Add loaded state
                element.style.opacity = '1';
                observer.unobserve(element);
            }
        });
    });

    imageElements.forEach(img => imageObserver.observe(img));
}

// ==================== Analytics (Simple Tracking) ====================
function trackView(contentTitle) {
    const viewData = {
        content: contentTitle,
        timestamp: new Date().toISOString(),
        duration: 0
    };

    console.log('View tracked:', viewData);

    // Send to backend (example)
    // fetch('/api/track-view', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(viewData)
    // });
}

// ==================== User Interaction Events ====================
document.querySelectorAll('.content-card, .trending-item').forEach(element => {
    element.addEventListener('mouseenter', function() {
        const title = this.querySelector('h3').textContent;
        // You can add hover effects or preload content here
    });
});

// ==================== Responsive Menu Toggle ====================
function createMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    const navRight = document.querySelector('.nav-right');

    if (window.innerWidth < 1024) {
        navMenu.style.display = 'none';
    } else {
        navMenu.style.display = 'flex';
    }
}

window.addEventListener('resize', createMobileMenu);
window.addEventListener('load', createMobileMenu);

// ==================== Smooth Scrolling ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ==================== Page Load Animation ====================
window.addEventListener('load', function() {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.animation = 'fadeIn 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

console.log('StreamHub loaded successfully!');