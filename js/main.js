document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize the application
function initializeApp() {
    initializeSwiper();
    initializeCounters();
    initializeNewsletterForm();
    updateCartBadge();
    initializeImagePreview();
    initializeScrollEffects();
    initializeCustomAnimations();
}

function initializeSwiper() {
    if (document.querySelector('.heroSwiper')) {
        const swiper = new Swiper('.heroSwiper', {
            slidesPerView: 1,
            spaceBetween: 0,
            loop: true,
            autoplay: {
                delay: 6000,
                disableOnInteraction: false,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
                dynamicBullets: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            effect: 'fade',
            fadeEffect: {
                crossFade: true
            },
            on: {
                slideChange: function () {
                    const activeSlide = this.slides[this.activeIndex];
                    const heroText = activeSlide.querySelector('.hero-text');
                    const heroImage = activeSlide.querySelector('.hero-image');
                    
                    if (heroText) {
                        heroText.style.animation = 'none';
                        setTimeout(() => {
                            heroText.style.animation = 'slideInLeft 0.8s ease-out';
                        }, 100);
                    }
                    
                    if (heroImage) {
                        heroImage.style.animation = 'none';
                        setTimeout(() => {
                            heroImage.style.animation = 'slideInRight 0.8s ease-out';
                        }, 200);
                    }
                }
            }
        });
    }
}

function initializeCustomAnimations() {
    const animatedElements = document.querySelectorAll('.animate-slide-right, .animate-slide-left, .animate-fade-up, .animate-fade-right, .animate-fade-left, .animate-scale-in');
    
    if (animatedElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('animation-triggered')) {
                    entry.target.classList.add('animation-triggered');
                }
            });
        }, { 
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        animatedElements.forEach(element => observer.observe(element));
    }
    
    const heroElements = document.querySelectorAll('.hero-section .animate-fade-right, .hero-section .animate-fade-left');
    heroElements.forEach(element => {
        setTimeout(() => {
            element.classList.add('animation-triggered');
        }, 500); 
    });
}

function initializeCounters() {
    const counters = document.querySelectorAll('.stat-number[data-count]');
    
    const animateCounter = (counter) => {
        const target = parseInt(counter.getAttribute('data-count'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };
        
        updateCounter();
    };
    
    if (counters.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                    entry.target.classList.add('animated');
                    animateCounter(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        counters.forEach(counter => observer.observe(counter));
    }
}

function initializeNewsletterForm() {
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (!email) {
                showToast('Please enter your email address', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showToast('Please enter a valid email address', 'error');
                return;
            }
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            showLoading(submitBtn, 'Subscribing...');
            
            setTimeout(() => {
                // Save to localStorage
                const subscribers = JSON.parse(localStorage.getItem('newsletter_subscribers') || '[]');
                if (!subscribers.includes(email)) {
                    subscribers.push(email);
                    localStorage.setItem('newsletter_subscribers', JSON.stringify(subscribers));
                }
                
                showToast('Thank you for subscribing to our newsletter!', 'success');
                emailInput.value = '';
                hideLoading(submitBtn, originalText);
            }, 1500);
        });
    }
}

// Initialize scroll effects
function initializeScrollEffects() {
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }
    
    // Parallax effect for hero section
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            heroSection.style.transform = `translateY(${rate}px)`;
        });
    }
    
    createScrollToTopButton();
}

function createScrollToTopButton() {
    const scrollBtn = document.createElement('button');
    scrollBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #B6885D, #73411F);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(69, 40, 21, 0.3);
    `;
    
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollBtn.style.opacity = '1';
            scrollBtn.style.visibility = 'visible';
        } else {
            scrollBtn.style.opacity = '0';
            scrollBtn.style.visibility = 'hidden';
        }
    });
    
    document.body.appendChild(scrollBtn);
}

function updateCartBadge() {
    const cartBadge = document.getElementById('cartBadge');
    if (cartBadge) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartBadge.textContent = totalItems;
        cartBadge.style.display = totalItems > 0 ? 'inline' : 'none';
        
        if (totalItems > 0) {
            cartBadge.style.animation = 'pulse 0.6s ease-in-out';
            setTimeout(() => {
                cartBadge.style.animation = '';
            }, 600);
        }
    }
}

function initializeImagePreview() {
    const imageUrlInput = document.getElementById('productImage');
    const previewContainer = document.getElementById('imagePreviewContainer');
    const previewImage = document.getElementById('imagePreview');

    if (imageUrlInput && previewContainer && previewImage) {
        imageUrlInput.addEventListener('input', debounce(function() {
            const url = this.value.trim();
            if (url && isValidImageUrl(url)) {
                previewImage.src = url;
                previewContainer.style.display = 'block';
                
                previewImage.style.opacity = '0.5';
                
                previewImage.onload = function() {
                    this.style.opacity = '1';
                };
                
                previewImage.onerror = function() {
                    previewContainer.style.display = 'none';
                    showToast('Failed to load image. Please check the URL.', 'error');
                };
            } else {
                previewContainer.style.display = 'none';
            }
        }, 500));
    }
}

function isValidImageUrl(url) {
    try {
        new URL(url);
        const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
        return imageExtensions.test(url) || 
               url.includes('pexels.com') || 
               url.includes('unsplash.com') ||
               url.includes('images.') ||
               url.includes('cdn.');
    } catch (_) {
        return false;
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function showLoading(element, text = 'Loading...') {
    const spinner = '<span class="spinner me-2"></span>';
    element.innerHTML = spinner + text;
    element.disabled = true;
}

function hideLoading(element, originalText) {
    element.innerHTML = originalText;
    element.disabled = false;
}

function showToast(message, type = 'success') {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
        background: '#fff',
        color: '#452815',
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        },
        customClass: {
            popup: 'colored-toast'
        }
    });

    const iconColors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };

    Toast.fire({
        icon: type,
        title: message,
        iconColor: iconColors[type]
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const Storage = {
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    },

    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Error writing to localStorage:', error);
        }
    },

    remove: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing from localStorage:', error);
        }
    },

    clear: () => {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Error clearing localStorage:', error);
        }
    }
};

function fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.display = 'block';
    
    let opacity = 0;
    const timer = setInterval(() => {
        opacity += 50 / duration;
        if (opacity >= 1) {
            clearInterval(timer);
            opacity = 1;
        }
        element.style.opacity = opacity;
    }, 50);
}

function fadeOut(element, duration = 300) {
    let opacity = 1;
    const timer = setInterval(() => {
        opacity -= 50 / duration;
        if (opacity <= 0) {
            clearInterval(timer);
            opacity = 0;
            element.style.display = 'none';
        }
        element.style.opacity = opacity;
    }, 50);
}

const customAnimations = `
    @keyframes slideInLeft {
        from {
            opacity: 0;
            transform: translateX(-50px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(50px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.1);
        }
    }
    
    .navbar.scrolled {
        background: rgba(255, 255, 255, 0.98) !important;
        backdrop-filter: blur(20px);
        box-shadow: 0 2px 20px rgba(69, 40, 21, 0.1);
    }
    
    .colored-toast {
        border-left: 4px solid var(--toast-color, #B6885D);
    }
    
    .image-preview-wrapper {
        max-height: 300px;
        overflow: hidden;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(69, 40, 21, 0.15);
        border: 1px solid rgba(232, 210, 184, 0.3);
    }
    
    .form-actions {
        margin-top: 2rem;
        padding-top: 2rem;
        border-top: 1px solid rgba(232, 210, 184, 0.3);
    }
    
    .scroll-to-top:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 20px rgba(69, 40, 21, 0.4);
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = customAnimations;
document.head.appendChild(styleSheet);

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

document.addEventListener('DOMContentLoaded', function() {
    document.documentElement.classList.remove('no-js');
    
    setTimeout(function() {
        const animatedElements = document.querySelectorAll('.animate-fade-right, .animate-fade-left, .animate-fade-up, .animate-scale-in');
        animatedElements.forEach(function(element) {
            if (!element.classList.contains('animation-triggered')) {
                element.classList.add('animation-triggered');
            }
        });
    }, 1000);
    
    setTimeout(function() {
        if (window.authManager) {
            window.authManager.initAdminControls();
        }
    }, 100);
});

function checkAdminAccess(event) {
    if (window.authManager && !window.authManager.isAdmin()) {
        event.preventDefault();
        Swal.fire({
            title: 'Access Denied',
            text: 'This feature is only available to administrators.',
            icon: 'warning',
            confirmButtonColor: '#B6885D',
            confirmButtonText: 'OK'
        });
        return false;
    }
    return true;
}

window.updateCartBadge = updateCartBadge;
window.showToast = showToast;
window.formatCurrency = formatCurrency;
window.generateId = generateId;
window.Storage = Storage;