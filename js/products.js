// Enhanced Products Management Module for Sweet Delights Bakery
class ProductManager {
    constructor() {
        this.products = this.getProducts();
        this.filteredProducts = [...this.products];
        this.initializeProducts();
    }

    // Get products from localStorage or initialize with bakery products
    getProducts() {
        const savedProducts = localStorage.getItem('products');
        if (savedProducts) {
            return JSON.parse(savedProducts);
        }
        
        // Default bakery and beverage products
        const defaultProducts = [
            // Breads
            {
                id: '1',
                name: 'Croissant',
                price: 8.99,
                category: 'bread',
                image: 'images/croissant.jpg',
                description: 'Traditional sourdough with a crispy crust and tangy flavor'
            },
            {
                id: '2',
                name: 'Pain au Chocolat',
                price: 6.49,
                category: 'bread',
                image: 'images/pain-au-chocolat.jpg',
                description: 'Nutritious whole wheat bread perfect for sandwiches'
            },
            {
                id: '3',
                name: 'Pain aux Raisins',
                price: 4.99,
                category: 'bread',
                image: 'images/pain aux raisins.jpg',
                description: 'Classic French baguette with a golden crust'
            },
            
            // Pastries
            {
                id: '4',
                name: 'Apple Turnover',
                price: 3.99,
                category: 'pastry',
                image: 'images/Apple-Turnover.jpg',
                description: 'Flaky pastry filled with spiced apples'
            },
            {
                id: '5',
                name: 'Cherry Cream Cheese Danish',
                price: 4.49,
                category: 'pastry',
                image: 'images/Cherry-Cream-Cheese-Danish.jpg',
                description: 'Sweet pastry filled with rich Cherry'
            },
            {
                id: '6',
                name: 'Sugar Pursuit',
                price: 3.79,
                category: 'pastry',
                image: 'images/Sugar-Pursuit.jpg',
                description: 'Flaky pastry filled with rich Sugar'
            },
            
            // Cakes
            {
                id: '7',
                name: 'Chocolate Layer Cake',
                price: 24.99,
                category: 'cake',
                image: 'images/Chocolate-Layer-Cake.jpg',
                description: 'Rich chocolate cake with creamy frosting'
            },
            {
                id: '8',
                name: 'Red Velvet Cupcakes (6-pack)',
                price: 18.99,
                category: 'cake',
                image: 'images/Red-Velvet-Cupcakes.jpg',
                description: 'Classic red velvet cupcakes with cream cheese frosting'
            },
            {
                id: '9',
                name: 'Cheesecake Slice',
                price: 6.99,
                category: 'cake',
                image: 'images/Cheesecake-Slice.jpg',
                description: 'Creamy New York style cheesecake'
            },
            
            // Beverages
            {
                id: '10',
                name: 'Premium Coffee Blend',
                price: 12.99,
                category: 'beverage',
                image: 'images/Premium-Coffee-Blend.jpg',
                description: 'Our signature coffee blend, freshly roasted'
            },
            {
                id: '11',
                name: 'Herbal Tea Selection',
                price: 8.99,
                category: 'beverage',
                image: 'images/Herbal-Tea-Selection.jpg',
                description: 'Assorted herbal teas for relaxation'
            },
            {
                id: '12',
                name: 'Fresh Orange Juice',
                price: 4.99,
                category: 'beverage',
                image: 'images/Fresh-Orange-Juice.jpg',
                description: 'Freshly squeezed orange juice'
            }
        ];
        
        this.saveProducts(defaultProducts);
        return defaultProducts;
    }

    // Save products to localStorage
    saveProducts(products) {
        localStorage.setItem('products', JSON.stringify(products));
        this.products = products;
        this.filteredProducts = [...products];
    }

    // Initialize products display and functionality
    initializeProducts() {
        if (document.getElementById('productsGrid')) {
            this.displayProducts();
            this.initializeFilters();
        }
        if (document.getElementById('popularProducts')) {
            this.displayPopularProducts();
        }
        this.initializeAddProductForm();
    }

    // Initialize search and filter functionality
    initializeFilters() {
        const searchInput = document.getElementById('searchInput');
        const categoryFilter = document.getElementById('categoryFilter');
        const sortFilter = document.getElementById('sortFilter');

        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.filterProducts();
            });
        }

        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => {
                this.filterProducts();
            });
        }

        if (sortFilter) {
            sortFilter.addEventListener('change', () => {
                this.filterProducts();
            });
        }
    }

    // Filter and sort products
    filterProducts() {
        const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
        const category = document.getElementById('categoryFilter')?.value || '';
        const sortBy = document.getElementById('sortFilter')?.value || 'name';

        // Filter products
        this.filteredProducts = this.products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                                product.description.toLowerCase().includes(searchTerm);
            const matchesCategory = !category || product.category === category;
            
            return matchesSearch && matchesCategory;
        });

        // Sort products
        this.filteredProducts.sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return a.price - b.price;
                case 'price-high':
                    return b.price - a.price;
                case 'name':
                default:
                    return a.name.localeCompare(b.name);
            }
        });

        this.displayProducts();
    }

    // Display products in grid
    displayProducts() {
        const productsGrid = document.getElementById('productsGrid');
        const emptyState = document.getElementById('emptyState');
        
        if (!productsGrid) return;

        if (this.filteredProducts.length === 0) {
            productsGrid.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';
        productsGrid.style.display = 'flex';
        
        productsGrid.innerHTML = this.filteredProducts.map((product, index) => 
            this.createProductCard(product, index)
        ).join('');
        
        // Trigger custom animations
        this.triggerProductAnimations();
    }

    // Display popular products on home page
    displayPopularProducts() {
        const popularProductsContainer = document.getElementById('popularProducts');
        if (!popularProductsContainer) return;

        // Get first 6 products as popular
        const popularProducts = this.products.slice(0, 6);
        
        popularProductsContainer.innerHTML = popularProducts.map((product, index) => 
            this.createProductCard(product, index, true)
        ).join('');
        
        // Trigger custom animations for popular products
        this.triggerProductAnimations();
    }

    // Create product card HTML
    createProductCard(product, index = 0, isPopular = false) {
        const categoryLabels = {
            bread: 'Bread',
            pastry: 'Pastry',
            cake: 'Cake',
            beverage: 'Beverage'
        };

        return `
            <div class="col-lg-4 col-md-6 mb-4 products-grid-item">
                <div class="product-card">
                    <div class="product-image">
                        <img src="${product.image}" alt="${product.name}" 
                             onerror="this.src='https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=400'">
                        <div class="product-badge">${categoryLabels[product.category] || 'Product'}</div>
                    </div>
                    <div class="product-info">
                        <div class="product-category">${categoryLabels[product.category] || 'Product'}</div>
                        <h5 class="product-name">${product.name}</h5>
                        <p class="product-description">${product.description || ''}</p>
                        <div class="product-price">EGP ${product.price.toFixed(2)}</div>
                        <div class="product-actions">
                            <button class="btn-add-cart" onclick="cartManager.addToCart('${product.id}')">
                                <i class="fas fa-cart-plus me-2"></i>Add to Cart
                            </button>
                            ${!isPopular ? `
                            <button class="btn-delete" onclick="productManager.removeProduct('${product.id}')" title="Remove Product">
                                <i class="fas fa-trash"></i>
                            </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Trigger product animations
    triggerProductAnimations() {
        setTimeout(() => {
            const productItems = document.querySelectorAll('.products-grid-item');
            productItems.forEach((item, index) => {
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, index * 100);
            });
        }, 100);
    }

    // Add new product
    addProduct(productData) {
        const newProduct = {
            id: this.generateId(),
            name: productData.name.trim(),
            price: parseFloat(productData.price),
            category: productData.category || 'bread',
            image: productData.image.trim(),
            description: productData.description?.trim() || '',
            createdAt: new Date().toISOString()
        };

        this.products.unshift(newProduct);
        this.saveProducts(this.products);
        
        return newProduct;
    }

    // Remove product with confirmation
    removeProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        Swal.fire({
            title: 'Remove Product?',
            text: `Are you sure you want to remove "${product.name}" from the menu?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, remove it!',
            cancelButtonText: 'Cancel',
            background: '#fff',
            color: '#452815'
        }).then((result) => {
            if (result.isConfirmed) {
                this.products = this.products.filter(p => p.id !== productId);
                this.saveProducts(this.products);
                this.filterProducts(); // Refresh display

                // Remove from cart if exists
                if (typeof cartManager !== 'undefined') {
                    cartManager.removeFromCart(productId);
                }

                Swal.fire({
                    title: 'Removed!',
                    text: `"${product.name}" has been removed from the menu.`,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    background: '#fff',
                    color: '#452815'
                });
            }
        });
    }

    // Get product by ID
    getProductById(productId) {
        return this.products.find(product => product.id === productId);
    }

    // Initialize add product form
    initializeAddProductForm() {
        const addProductForm = document.getElementById('addProductForm');
        if (addProductForm) {
            addProductForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddProduct(e.target);
            });
        }

        // Initialize image preview
        const imageInput = document.getElementById('productImage');
        if (imageInput) {
            imageInput.addEventListener('input', this.handleImagePreview.bind(this));
        }
    }

    // Handle image preview
    handleImagePreview(event) {
        const url = event.target.value.trim();
        const previewContainer = document.getElementById('imagePreviewContainer');
        const previewImage = document.getElementById('imagePreview');

        if (url && this.isValidImageUrl(url)) {
            if (previewImage && previewContainer) {
                previewImage.src = url;
                previewContainer.style.display = 'block';
                
                previewImage.onerror = function() {
                    previewContainer.style.display = 'none';
                };
            }
        } else {
            if (previewContainer) {
                previewContainer.style.display = 'none';
            }
        }
    }

    // Handle add product form submission
    handleAddProduct(form) {
        // Clear previous validation
        this.clearValidation(form);

        // Get form data
        const productData = {
            name: document.getElementById('productName').value,
            price: document.getElementById('productPrice').value,
            category: document.getElementById('productCategory').value,
            image: document.getElementById('productImage').value,
            description: document.getElementById('productDescription')?.value || ''
        };

        // Validate form
        if (!this.validateProductData(productData, form)) {
            return;
        }

        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        this.showLoading(submitBtn, 'Adding Product...');

        // Simulate API delay
        setTimeout(() => {
            try {
                const newProduct = this.addProduct(productData);
                
                // Show success message
                Swal.fire({
                    title: 'Product Added!',
                    text: `"${newProduct.name}" has been added to the menu successfully!`,
                    icon: 'success',
                    confirmButtonText: 'View Products',
                    showCancelButton: true,
                    cancelButtonText: 'Add Another',
                    confirmButtonColor: '#B6885D',
                    cancelButtonColor: '#6c757d',
                    background: '#fff',
                    color: '#452815'
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = 'products.html';
                    } else {
                        form.reset();
                        this.clearValidation(form);
                        const previewContainer = document.getElementById('imagePreviewContainer');
                        if (previewContainer) {
                            previewContainer.style.display = 'none';
                        }
                    }
                });

            } catch (error) {
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to add product. Please try again.',
                    icon: 'error',
                    confirmButtonColor: '#B6885D',
                    background: '#fff',
                    color: '#452815'
                });
            } finally {
                this.hideLoading(submitBtn, originalText);
            }
        }, 1000);
    }

    // Validate product data
    validateProductData(data, form) {
        let isValid = true;

        // Validate name
        if (!data.name || data.name.length < 2) {
            this.setFieldError('productName', 'Product name must be at least 2 characters long');
            isValid = false;
        }

        // Validate price
        const price = parseFloat(data.price);
        if (!data.price || isNaN(price) || price <= 0) {
            this.setFieldError('productPrice', 'Please enter a valid price greater than 0');
            isValid = false;
        }

        // Validate category
        if (!data.category) {
            this.setFieldError('productCategory', 'Please select a category');
            isValid = false;
        }

        // Validate image URL
        if (!data.image || !this.isValidImageUrl(data.image)) {
            this.setFieldError('productImage', 'Please enter a valid image URL');
            isValid = false;
        }

        return isValid;
    }

    // Set field error
    setFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.classList.add('is-invalid');
            
            // Create or update error message
            let feedback = field.parentNode.querySelector('.invalid-feedback');
            if (!feedback) {
                feedback = document.createElement('div');
                feedback.className = 'invalid-feedback';
                field.parentNode.appendChild(feedback);
            }
            feedback.textContent = message;
        }
    }

    // Clear form validation
    clearValidation(form) {
        const invalidFields = form.querySelectorAll('.is-invalid');
        const feedbacks = form.querySelectorAll('.invalid-feedback');
        
        invalidFields.forEach(field => field.classList.remove('is-invalid'));
        feedbacks.forEach(feedback => feedback.remove());
    }

    // Validate image URL
    isValidImageUrl(url) {
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

    // Show loading state
    showLoading(element, text) {
        element.disabled = true;
        element.innerHTML = `
            <span class="spinner me-2"></span>
            <span>${text}</span>
        `;
    }

    // Hide loading state
    hideLoading(element, originalText) {
        element.disabled = false;
        element.innerHTML = originalText;
    }

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Get products by category
    getProductsByCategory(category) {
        return this.products.filter(product => product.category === category);
    }

    // Search products
    searchProducts(query) {
        const searchTerm = query.toLowerCase();
        return this.products.filter(product =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm)
        );
    }
}

// Initialize product manager
const productManager = new ProductManager();

// Export for global use
window.productManager = productManager;