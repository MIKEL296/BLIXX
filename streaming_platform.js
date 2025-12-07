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