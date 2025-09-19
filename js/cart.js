// Enhanced Shopping Cart Management Module for Sips & Bites
// Utility function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Utility function to show toast notifications
function showToast(message, type = 'info') {
    if (typeof Swal !== 'undefined') {
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        });

        Toast.fire({
            icon: type,
            title: message
        });
    } else {
        console.log(`${type.toUpperCase()}: ${message}`);
    }
}

class CartManager {
    constructor() {
        this.cart = this.getCart();
        this.promoCode = null;
        this.discount = 0;
        this.isUpdating = false; // Prevent multiple simultaneous updates
        this.initializeCart();
    }

    // Get cart from localStorage
    getCart() {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    }

    // Save cart to localStorage
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateCartBadge();
    }

    // Initialize cart functionality
    initializeCart() {
        if (document.getElementById('cartItems')) {
            this.displayCart();
            this.displayRecommendedProducts();
        }
    }

    // Add product to cart
    addToCart(productId, quantity = 1) {
        // Check if productManager exists, if not try to get product from localStorage
        let product = null;
        if (typeof productManager !== 'undefined' && productManager.getProductById) {
            product = productManager.getProductById(productId);
        } else {
            // Fallback: get products from localStorage
            const products = JSON.parse(localStorage.getItem('products') || '[]');
            product = products.find(p => p.id === productId);
        }
        
        if (!product) {
            showToast('Product not found!', 'error');
            return;
        }

        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                category: product.category,
                image: product.image,
                quantity: quantity
            });
        }

        this.saveCart();
        
        // Show success toast with animation
        showToast(`"${product.name}" added to cart!`, 'success');
        
        // Animate cart badge
        this.animateCartBadge();
        
        // Update display if on cart page
        if (document.getElementById('cartItems')) {
            this.displayCart();
        }
    }

    // Remove product from cart
    removeFromCart(productId) {
        const item = this.cart.find(item => item.id === productId);
        if (!item) return;

        Swal.fire({
            title: 'Remove from cart?',
            text: `Remove "${item.name}" from your cart?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#B6885D',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, remove it!',
            cancelButtonText: 'Keep it',
            background: '#fff',
            color: '#452815'
        }).then((result) => {
            if (result.isConfirmed) {
                this.cart = this.cart.filter(item => item.id !== productId);
                this.saveCart();
                this.displayCart();
                
                showToast(`"${item.name}" removed from cart`, 'success');
            }
        });
    }

    // Update item quantity
    updateQuantity(productId, newQuantity) {
        const item = this.cart.find(item => item.id === productId);
        if (!item) return;

        const quantity = parseInt(newQuantity);
        
        if (isNaN(quantity) || quantity <= 0) {
            this.removeFromCart(productId);
            return;
        }

        if (quantity > 10) {
            showToast('Maximum quantity is 10', 'warning');
            // Reset the input to the current quantity
            const itemElement = document.querySelector(`[data-item-id="${productId}"]`);
            if (itemElement) {
                const quantityInput = itemElement.querySelector('.quantity-input');
                if (quantityInput) {
                    quantityInput.value = item.quantity;
                }
            }
            return;
        }

        item.quantity = quantity;
        this.saveCart();
        
        // Update only the specific item's display instead of rebuilding everything
        this.updateItemDisplay(productId);
        this.updateCartSummary();
    }

    // Update display for a specific item
    updateItemDisplay(productId) {
        const item = this.cart.find(item => item.id === productId);
        if (!item) return;

        const itemElement = document.querySelector(`[data-item-id="${productId}"]`);
        if (itemElement) {
            // Update quantity input
            const quantityInput = itemElement.querySelector('.quantity-input');
            if (quantityInput) {
                quantityInput.value = item.quantity;
            }

            // Update total price
            const totalElement = itemElement.querySelector('.cart-item-price.fw-bold');
            if (totalElement) {
                totalElement.textContent = formatCurrency(item.price * item.quantity);
            }

            // Update quantity buttons by finding them properly
            const quantityButtons = itemElement.querySelectorAll('.quantity-btn');
            if (quantityButtons.length >= 2) {
                const minusBtn = quantityButtons[0]; // First button is minus
                const plusBtn = quantityButtons[1];  // Second button is plus
                
                // Update button states
                minusBtn.disabled = item.quantity <= 1;
                plusBtn.disabled = item.quantity >= 10; // Changed from 99 to 10 as requested
                
                // Update onclick attributes
                minusBtn.setAttribute('onclick', `cartManager.updateQuantity('${productId}', ${item.quantity - 1})`);
                plusBtn.setAttribute('onclick', `cartManager.updateQuantity('${productId}', ${item.quantity + 1})`);
            }
        }
    }

    // Display cart items
    displayCart() {
        if (this.isUpdating) {
            return;
        }
        
        this.isUpdating = true;
        
        const cartItemsContainer = document.getElementById('cartItems');
        const emptyCart = document.getElementById('emptyCart');
        const checkoutBtn = document.getElementById('checkoutBtn');
        
        if (!cartItemsContainer) {
            this.isUpdating = false;
            return;
        }


        if (this.cart.length === 0) {
            cartItemsContainer.style.display = 'none';
            if (emptyCart) emptyCart.style.display = 'block';
            if (checkoutBtn) checkoutBtn.disabled = true;
            this.updateCartSummary();
            this.isUpdating = false;
            return;
        }

        if (emptyCart) emptyCart.style.display = 'none';
        cartItemsContainer.style.display = 'block';
        if (checkoutBtn) checkoutBtn.disabled = false;

        // Clear container first
        cartItemsContainer.innerHTML = '';
        
        // Add each cart item
        this.cart.forEach((item, index) => {
            const itemHTML = this.createCartItemHTML(item, index);
            cartItemsContainer.insertAdjacentHTML('beforeend', itemHTML);
        });
        
        this.updateCartSummary();
        
        // Trigger animations after a small delay
        setTimeout(() => {
            const animatedElements = cartItemsContainer.querySelectorAll('.animate-fade-up');
            animatedElements.forEach(element => {
                element.classList.add('animation-triggered');
            });
            this.isUpdating = false;
        }, 100);
    }

    // Create cart item HTML
    createCartItemHTML(item, index) {
        const categoryLabels = {
            bread: 'Bread',
            pastry: 'Pastry',
            cake: 'Cake',
            beverage: 'Beverage'
        };

        const itemTotal = (item.price * item.quantity);
        const categoryLabel = categoryLabels[item.category] || 'Product';

        return `
            <div class="cart-item animate-fade-up" data-item-id="${item.id}" style="animation-delay: ${index * 0.1}s">
                <div class="row align-items-center">
                    <div class="col-md-2 col-sm-3 mb-3 mb-md-0">
                        <div class="cart-item-image-wrapper">
                            <img src="${item.image || 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=400'}" 
                                 alt="${item.name}" 
                                 class="cart-item-image"
                                 onerror="this.src='https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=400'">
                            <div class="item-category">${categoryLabel}</div>
                        </div>
                    </div>
                    <div class="col-md-4 col-sm-9 mb-3 mb-md-0">
                        <div class="cart-item-details">
                            <h5 class="item-title">${item.name}</h5>
                            <p class="cart-item-category">${categoryLabel}</p>
                            <p class="cart-item-price">${formatCurrency(item.price)} each</p>
                        </div>
                    </div>
                    <div class="col-md-3 col-sm-6 mb-3 mb-md-0">
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="cartManager.updateQuantity('${item.id}', ${item.quantity - 1})"
                                    ${item.quantity <= 1 ? 'disabled' : ''}>
                                <i class="fas fa-minus"></i>
                            </button>
                            <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="10"
                                   onchange="cartManager.updateQuantity('${item.id}', this.value)">
                            <button class="quantity-btn" onclick="cartManager.updateQuantity('${item.id}', ${item.quantity + 1})"
                                    ${item.quantity >= 10 ? 'disabled' : ''}>
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                    <div class="col-md-2 col-sm-4 mb-3 mb-md-0">
                        <div class="text-end">
                            <div class="cart-item-price fw-bold">${formatCurrency(itemTotal)}</div>
                        </div>
                    </div>
                    <div class="col-md-1 col-sm-2">
                        <button class="remove-btn" 
                                onclick="cartManager.removeFromCart('${item.id}')"
                                title="Remove ${item.name} from cart">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Display recommended products
    displayRecommendedProducts() {
        const recommendedContainer = document.getElementById('recommendedProducts');
        if (!recommendedContainer) return;

        // Get products from productManager or localStorage
        let allProducts = [];
        if (typeof productManager !== 'undefined' && productManager.products) {
            allProducts = productManager.products;
        } else {
            // Fallback: get products from localStorage
            allProducts = JSON.parse(localStorage.getItem('products') || '[]');
        }

        if (allProducts.length === 0) return;

        // Get 3 random products not in cart
        const cartProductIds = this.cart.map(item => item.id);
        const availableProducts = allProducts.filter(product => 
            !cartProductIds.includes(product.id)
        );
        
        const recommendedProducts = this.shuffleArray(availableProducts).slice(0, 3);
        
        recommendedContainer.innerHTML = recommendedProducts.map((product, index) => `
            <div class="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="${index * 100}">
                <div class="card product-card shadow-lg h-100 border-custom">
                    <div class="position-relative overflow-hidden">
                        <img src="${product.image}" class="card-img-top product-image" alt="${product.name}" 
                             onerror="this.src='https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=400'">
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h6 class="card-title fw-bold">${product.name}</h6>
                        <div class="mt-auto">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <span class="product-price">${formatCurrency(product.price)}</span>
                            </div>
                            <div class="d-grid">
                                <button class="btn btn-primary btn-sm" onclick="cartManager.addToCart('${product.id}')">
                                    <i class="fas fa-cart-plus me-2"></i>Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Shuffle array utility
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Update cart summary
    updateCartSummary() {
        const subtotalElement = document.getElementById('subtotal');
        const taxElement = document.getElementById('tax');
        const totalElement = document.getElementById('total');

        if (!subtotalElement) return;

        const subtotal = this.getSubtotal();
        const discountAmount = subtotal * (this.discount / 100);
        const discountedSubtotal = subtotal - discountAmount;
        const tax = discountedSubtotal * 0.08; // 8% tax
        const total = discountedSubtotal + tax;

        subtotalElement.textContent = formatCurrency(subtotal);
        taxElement.textContent = formatCurrency(tax);
        totalElement.textContent = formatCurrency(total);

        // Show discount if applied
        this.updateDiscountDisplay(discountAmount);
    }

    // Update discount display
    updateDiscountDisplay(discountAmount) {
        let discountRow = document.querySelector('.discount-row');
        
        if (this.discount > 0 && discountAmount > 0) {
            if (!discountRow) {
                const taxRow = document.querySelector('.summary-row:has(#tax)');
                discountRow = document.createElement('div');
                discountRow.className = 'summary-row discount-row';
                discountRow.innerHTML = `
                    <span class="text-success">Discount (${this.discount}%):</span>
                    <span class="text-success">-${formatCurrency(discountAmount)}</span>
                `;
                taxRow.parentNode.insertBefore(discountRow, taxRow);
            } else {
                discountRow.innerHTML = `
                    <span class="text-success">Discount (${this.discount}%):</span>
                    <span class="text-success">-${formatCurrency(discountAmount)}</span>
                `;
            }
        } else if (discountRow) {
            discountRow.remove();
        }
    }

    // Apply promo code
    applyPromoCode() {
        const promoInput = document.getElementById('promoCode');
        const code = promoInput.value.trim().toUpperCase();
        
        if (!code) {
            showToast('Please enter a promo code', 'warning');
            return;
        }

        // Valid promo codes
        const promoCodes = {
            'SWEET10': 10,
            'BAKERY15': 15,
            'NEWBIE20': 20,
            'WELCOME5': 5
        };

        if (promoCodes[code]) {
            if (this.promoCode === code) {
                showToast('This promo code is already applied', 'info');
                return;
            }

            this.promoCode = code;
            this.discount = promoCodes[code];
            this.updateCartSummary();
            
            showToast(`Promo code applied! ${this.discount}% discount`, 'success');
            promoInput.value = '';
        } else {
            showToast('Invalid promo code', 'error');
        }
    }

    // Get cart subtotal
    getSubtotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Get cart total (including tax and discount)
    getTotal() {
        const subtotal = this.getSubtotal();
        const discountAmount = subtotal * (this.discount / 100);
        const discountedSubtotal = subtotal - discountAmount;
        return discountedSubtotal + (discountedSubtotal * 0.08);
    }

    // Get total items count
    getTotalItems() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    // Update cart badge
    updateCartBadge() {
        const cartBadge = document.getElementById('cartBadge');
        if (cartBadge) {
            const totalItems = this.getTotalItems();
            cartBadge.textContent = totalItems;
            cartBadge.style.display = totalItems > 0 ? 'inline' : 'none';
        }
    }

    // Animate cart badge
    animateCartBadge() {
        const cartBadge = document.getElementById('cartBadge');
        if (cartBadge) {
            cartBadge.style.animation = 'pulse 0.6s ease-in-out';
            setTimeout(() => {
                cartBadge.style.animation = '';
            }, 600);
        }
    }

    // Clear cart
    clearCart() {
        Swal.fire({
            title: 'Clear Cart?',
            text: 'Are you sure you want to remove all items from your cart?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#B6885D',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, clear cart!',
            cancelButtonText: 'Cancel',
            background: '#fff',
            color: '#452815'
        }).then((result) => {
            if (result.isConfirmed) {
                this.cart = [];
                this.promoCode = null;
                this.discount = 0;
                this.saveCart();
                this.displayCart();
                
                showToast('Cart cleared successfully', 'success');
            }
        });
    }

    // Checkout process
    checkout() {
        if (this.cart.length === 0) {
            showToast('Your cart is empty!', 'error');
            return;
        }

        const total = this.getTotal();
        const totalItems = this.getTotalItems();
        const discountText = this.discount > 0 ? ` (${this.discount}% discount applied)` : '';

        Swal.fire({
            title: 'Complete Your Purchase',
            html: `
                <div class="checkout-summary">
                    <div class="text-start">
                        <h5 class="text-center mb-3 text-gradient">Order Summary</h5>
                        <div class="order-items mb-3">
                            ${this.cart.map(item => `
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <span>${item.name} x${item.quantity}</span>
                                    <span class="fw-bold">${formatCurrency(item.price * item.quantity)}</span>
                                </div>
                            `).join('')}
                        </div>
                        <hr>
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span><strong>Total Items:</strong></span>
                            <span><strong>${totalItems}</strong></span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <span><strong>Total Amount:</strong></span>
                            <span class="text-gradient fw-bold fs-5">${formatCurrency(total)}</span>
                        </div>
                        ${this.promoCode ? `<p class="text-success"><i class="fas fa-tag me-1"></i><strong>Promo Code Applied:</strong> ${this.promoCode} (${this.discount}% off)</p>` : ''}
                        <div class="alert alert-info mt-3">
                            <i class="fas fa-info-circle me-2"></i>
                            <small>Confirm your order to proceed with the purchase</small>
                        </div>
                    </div>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#B6885D',
            cancelButtonColor: '#6c757d',
            confirmButtonText: '<i class="fas fa-credit-card me-2"></i>Confirm Purchase',
            cancelButtonText: '<i class="fas fa-shopping-cart me-2"></i>Continue Shopping',
            reverseButtons: true,
            background: '#fff',
            color: '#452815',
            customClass: {
                popup: 'checkout-popup'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                this.processOrder();
            } else if (result.isDismissed) {
                // Show cancellation message
                Swal.fire({
                    title: 'Purchase Cancelled',
                    text: 'Your order has not been completed. You can continue shopping or modify your cart.',
                    icon: 'info',
                    confirmButtonText: 'Continue Shopping',
                    confirmButtonColor: '#B6885D',
                    background: '#fff',
                    color: '#452815',
                    timer: 3000,
                    timerProgressBar: true
                });
            }
        });
    }

    // Process order
    processOrder() {
        // Show processing animation
        Swal.fire({
            title: 'Processing Your Order...',
            html: 'Please wait while we prepare your delicious order.',
            allowOutsideClick: false,
            background: '#fff',
            color: '#452815',
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Simulate API call delay
        setTimeout(() => {
            // Generate order number
            const orderNumber = 'SD' + Date.now().toString().slice(-6);
            
            // Save order to localStorage (in real app, this would be sent to server)
            const order = {
                orderNumber: orderNumber,
                items: [...this.cart],
                subtotal: this.getSubtotal(),
                discount: this.discount,
                promoCode: this.promoCode,
                total: this.getTotal(),
                date: new Date().toISOString(),
                status: 'confirmed'
            };
            
            const orders = JSON.parse(localStorage.getItem('orders') || '[]');
            orders.push(order);
            localStorage.setItem('orders', JSON.stringify(orders));

            // Clear cart after successful order
            this.cart = [];
            this.promoCode = null;
            this.discount = 0;
            this.saveCart();
            this.displayCart();

            Swal.fire({
                title: '🎉 Order Confirmed!',
                html: `
                    <div class="order-success">
                        <div class="text-center">
                            <i class="fas fa-check-circle text-success fa-4x mb-3"></i>
                            <h4 class="text-gradient mb-3">Thank you for choosing Sips & Bites!</h4>
                            <div class="order-details">
                                <p><strong>Order Number:</strong> <span class="text-gradient">${orderNumber}</span></p>
                                <p><strong>Total Paid:</strong> <span class="text-success fw-bold">${formatCurrency(order.total)}</span></p>
                                <div class="delivery-info mt-4 p-3 bg-light rounded">
                                    <h6 class="text-gradient mb-2">
                                        <i class="fas fa-motorcycle me-2"></i>Delivery Information
                                    </h6>
                                    <p class="mb-2">
                                        <i class="fas fa-clock text-warning me-2"></i>
                                        <strong>Your order will arrive within 1 hour at most!</strong>
                                    </p>
                                    <p class="text-muted small mb-0">
                                        <i class="fas fa-heart text-danger me-1"></i>
                                        We hope you enjoy every delicious bite and sip! Thank you for supporting our café.
                                    </p>
                                </div>
                                <div class="mt-3">
                                    <p class="text-muted small">
                                        <i class="fas fa-envelope me-1"></i>
                                        Order confirmation sent to your email
                                    </p>
                                    <p class="text-muted small">
                                        <i class="fas fa-phone me-1"></i>
                                        We'll call you if we need any clarification
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                `,
                icon: 'success',
                confirmButtonText: '<i class="fas fa-shopping-bag me-2"></i>Continue Shopping',
                confirmButtonColor: '#B6885D',
                background: '#fff',
                color: '#452815',
                allowOutsideClick: false,
                customClass: {
                    popup: 'success-popup'
                }
            }).then(() => {
                window.location.href = 'products.html';
            });
        }, 2500);
    }

    // Get cart data for export
    getCartData() {
        return {
            items: this.cart,
            subtotal: this.getSubtotal(),
            discount: this.discount,
            promoCode: this.promoCode,
            tax: this.getSubtotal() * 0.08,
            total: this.getTotal(),
            totalItems: this.getTotalItems()
        };
    }
}

// Initialize cart manager after DOM is loaded
let cartManager;

document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure all scripts are loaded
    setTimeout(() => {
        cartManager = new CartManager();
        // Make it globally available
        window.cartManager = cartManager;
    }, 100);
});

// Global functions
function checkout() {
    if (cartManager) {
        cartManager.checkout();
    } else {
        console.error('Cart manager not initialized yet');
    }
}

function applyPromoCode() {
    if (cartManager) {
        cartManager.applyPromoCode();
    } else {
        console.error('Cart manager not initialized yet');
    }
}

// Make functions globally available
window.checkout = checkout;
window.applyPromoCode = applyPromoCode;

// Add custom CSS for cart styling
const cartStyles = `
    .cart-item-image-wrapper {
        position: relative;
        border-radius: 12px;
        overflow: hidden;
    }
    
    .cart-item-image {
        width: 100%;
        height: 120px;
        object-fit: cover;
        border-radius: 12px;
    }
    
    .item-category {
        position: absolute;
        top: 8px;
        left: 8px;
        background: rgba(182, 136, 93, 0.9);
        color: white;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 500;
    }
    
    .item-title {
        color: var(--darkest-brown);
        font-size: 1.1rem;
    }
    
    .item-price {
        color: var(--medium-brown);
        font-weight: 600;
    }
    
    .item-total {
        font-size: 1.2rem;
        font-weight: 700;
    }
    
    .remove-btn {
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: var(--transition-normal);
    }
    
    .remove-btn:hover {
        transform: scale(1.1);
        background-color: #dc3545;
        border-color: #dc3545;
        color: white;
    }
    
    .checkout-summary {
        background: var(--gray-light);
        padding: 1.5rem;
        border-radius: 12px;
        margin: 1rem 0;
    }
    
    .order-success .order-details {
        background: var(--gray-light);
        padding: 1.5rem;
        border-radius: 12px;
        margin-top: 1rem;
    }
    
    @media (max-width: 768px) {
        .cart-item-image {
            height: 80px;
        }
        
        .quantity-controls {
            justify-content: center;
            margin: 1rem 0;
        }
        
        .remove-btn {
            width: 35px;
            height: 35px;
        }
    }
`;

// Inject cart styles
const cartStyleSheet = document.createElement('style');
cartStyleSheet.textContent = cartStyles;
document.head.appendChild(cartStyleSheet);