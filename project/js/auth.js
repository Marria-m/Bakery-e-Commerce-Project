
// Revision Done


// Enhanced Authentication Module for Sweet Delights Bakery
class AuthManager {
    // Constructor function - runs when a new AuthManager instance is created
    constructor() {
        // Initialize users by retrieving from localStorage or creating default admin
        this.users = this.getUsers();
        // Initialize authentication state (check if user is logged in)
        this.initAuth();
        // Set up authentication form event listeners
        this.initAuthForms();
    }

    // Get users from localStorage or initialize with default admin
    getUsers() {
        // Try to retrieve users from localStorage
        const savedUsers = localStorage.getItem('users');
        // If users exist in localStorage, parse and return them
        if (savedUsers) {
            return JSON.parse(savedUsers);
        } 
        
        // Default admin user (used when no users exist in localStorage)
        const defaultUsers = [
            {
                id: '1', // Unique identifier
                name: 'Admin User', // Display name
                email: 'admin@sipsandbites.com', // Login email
                password: 'password123', // Login password (stored in plain text - security risk)
                role: 'admin', // Admin role
                createdAt: new Date().toISOString() // Account creation timestamp
            }
        ];
        
        // Save default users to localStorage
        this.saveUsers(defaultUsers);
        // Return the default users array
        return defaultUsers;

    }

    // Save users to localStorage
    saveUsers(users) {
        // Convert users array to JSON string and store in localStorage
        localStorage.setItem('users', JSON.stringify(users));
        // Update the class property with the new users array
        this.users = users;
    }

    // Initialize authentication - checks if user is logged in
    initAuth() {
        // Check if user is logged in by checking localStorage flag
        if (this.isLoggedIn()) {
            // If logged in, update the cart badge with item count
            this.updateCartBadge();
            // Initialize admin controls
            this.initAdminControls();
        } else {
            // If not logged in, redirect to login page if needed
            this.redirectToLogin();
        }
    }

    // Initialize authentication forms - sets up event listeners
    initAuthForms() {
        // Set up sign in form submission handler
        this.initSignInForm();
        // Set up sign up form submission handler
        this.initSignUpForm();
        // Set up tab switching between sign in/sign up forms
        this.initTabSwitching();
    }

    // Initialize sign in form
    initSignInForm() {
        // Get reference to the sign in form element
        const signinForm = document.getElementById('signinForm');
        // Check if form exists on the page
        if (signinForm) {
            // Add submit event listener to handle form submission
            signinForm.addEventListener('submit', (e) => {
                // Prevent default form submission (page reload)
                e.preventDefault();
                // Call handleSignIn method with the form element
                this.handleSignIn(e.target);
            });
            
            // Pre-fill demo credentials for easier testing
            const emailInput = document.getElementById('signinEmail');
            const passwordInput = document.getElementById('signinPassword');
            // Check if input elements exist
            if (emailInput && passwordInput) {
                // Set demo email value
                emailInput.value = 'admin@sipsandbites.com';
                // Set demo password value
                passwordInput.value = 'password123';
            }
        }
    }

    // Initialize sign up form
    initSignUpForm() {
        // Get reference to the sign up form element
        const signupForm = document.getElementById('signupForm');
        // Check if form exists on the page
        if (signupForm) {
            // Add submit event listener to handle form submission
            signupForm.addEventListener('submit', (e) => {
                // Prevent default form submission (page reload)
                e.preventDefault();
                // Call handleSignUp method with the form element
                this.handleSignUp(e.target);
            });
        }
    }

    // Initialize tab switching between sign in and sign up forms
    initTabSwitching() {
        // Get all tab elements
        const authTabs = document.querySelectorAll('.auth-tab');
        // Add click event listener to each tab
        authTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Extract tab type from button text (convert to lowercase, remove spaces)
                const tabType = tab.textContent.toLowerCase().replace(' ', '');
                // Switch to the selected tab
                this.switchTab(tabType);
            });
        });
    }

    // Handle sign in form submission
    handleSignIn(form) {
        // Get and trim email input value
        const email = document.getElementById('signinEmail').value.trim();
        // Get and trim password input value
        const password = document.getElementById('signinPassword').value.trim();

        // Show loading state on the submit button
        const submitBtn = form.querySelector('button[type="submit"]');
        this.showLoading(submitBtn, 'Signing In...');

        // Simulate API delay with setTimeout (1000ms = 1 second)
        setTimeout(() => {
            // Validate credentials against stored users
            if (this.validateCredentials(email, password)) {
                // Find user object for the authenticated user
                const user = this.users.find(u => u.email === email);
                // Set current user in localStorage
                this.setCurrentUser(user);
                
                // Show success message using SweetAlert
                Swal.fire({
                    title: 'Welcome Back!',
                    text: `Hello ${user.name}, you've successfully signed in.`,
                    icon: 'success',
                    timer: 2000, // Auto-close after 2 seconds
                    showConfirmButton: false, // Hide OK button
                    background: '#fff', // Custom styling
                    color: '#452815' // Custom styling
                }).then(() => {
                    // Redirect to home page after successful login
                    window.location.href = 'home.html';
                });
            } else {
                // Show error message if credentials are invalid
                this.showError('Invalid email or password. Please try again.');
                // Restore normal button state
                this.hideLoading(submitBtn, 'Sign In');
            }
        }, 1000); // 1 second delay 
    }

    // Handle sign up form submission
    handleSignUp(form) {
        // Get and trim form input values
        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value.trim();
        const confirmPassword = document.getElementById('confirmPassword').value.trim();

        // Validate sign up data
        if (!this.validateSignUpData(name, email, password, confirmPassword)) {
            // Exit if validation fails (error shown in validateSignUpData)
            return;
        }

        // Show loading state on the submit button
        const submitBtn = form.querySelector('button[type="submit"]');
        this.showLoading(submitBtn, 'Creating Account...');

        // Simulate API delay with setTimeout
        setTimeout(() => {
            try {
                // Create new user account
                const newUser = this.createUser(name, email, password);
                // Set current user in localStorage
                this.setCurrentUser(newUser);
                
                // Show success message using SweetAlert
                Swal.fire({
                    title: 'Account Created!',
                    text: `Welcome to Sweet Delights, ${name}! Your account has been created successfully.`,
                    icon: 'success',
                    confirmButtonText: 'Get Started',
                    confirmButtonColor: '#B6885D',
                    background: '#fff', // Custom styling
                    color: '#452815' // Custom styling
                }).then(() => {
                    // Redirect to home page after successful registration
                    window.location.href = 'home.html';
                });
            } catch (error) {
                // Show error message if account creation fails
                this.showError(error.message);
                // Restore normal button state
                this.hideLoading(submitBtn, 'Create Account');
            }
        }, 1000); // 1 second delay
    }

    // Validate sign up data
    validateSignUpData(name, email, password, confirmPassword) {

        // Validate name length (at least 2 characters)
        if (name.length < 2) {
            this.showError('Name must be at least 2 characters long');
            return false;
        }

        // Validate email format using regex
        if (!this.isValidEmail(email)) {
            this.showError('Please enter a valid email address');
            return false;
        }

        // Validate password length (at least 6 characters)
        if (password.length < 6) {
            this.showError('Password must be at least 6 characters long');
            return false;
        }

        // Check if password and confirmation match
        if (password !== confirmPassword) {
            this.showError('Passwords do not match');
            return false;
        }

        // Check if email already exists in the system
        if (this.emailExists(email)) {
            this.showError('An account with this email already exists');
            return false;
        }

        // Return true if all validations pass
        return true;
    }

    // Create new user
    createUser(name, email, password) {
        // Create new user object with generated ID and timestamp
        const newUser = {
            id: this.generateId(), // Generate unique ID
            name: name, // User's full name
            email: email, // User's email
            password: password, // User's password (stored in plain text - security risk)
            role: 'user', // Default role for new users
            createdAt: new Date().toISOString() // Account creation timestamp
        };

        // Add new user to users array
        this.users.push(newUser);
        // Save updated users array to localStorage
        this.saveUsers(this.users);
        // Return the new user object
        return newUser;
    }

    // Check if email exists in the system
    emailExists(email) {
        // Check if any user has the provided email (case-insensitive comparison)
        return this.users.some(user => user.email.toLowerCase() === email.toLowerCase());
    }

    // Validate email format using regular expression
    isValidEmail(email) {
        // Check if email contains @ and at least one dot after the @
        const atIndex = email.indexOf('@');
        const dotIndex = email.lastIndexOf('.');
        
        return atIndex > 0 &&                    // @ exists and is not the first character
               dotIndex > atIndex + 1 &&         // . exists after @ with at least one character between
               dotIndex < email.length - 2;      // . is not at the end and has at least 2 characters after
    }

    // Validate login credentials
    validateCredentials(email, password) {
        // Check if any user matches the provided email and password
        return this.users.some(user => 
            // Case-insensitive email comparison
            user.email.toLowerCase() === email.toLowerCase() && 
            // Password comparison (in plain text - security risk)
            user.password === password
        );
    }

    // Set current user in localStorage
    setCurrentUser(user) {
        // Set flag indicating user is logged in
        localStorage.setItem('isLoggedIn', 'true');
        // Store user data (excluding password) in localStorage
        localStorage.setItem('currentUser', JSON.stringify({
            id: user.id, // User ID
            name: user.name, // User's name
            email: user.email, // User's email
            role: user.role || 'user' // User's role (default to 'user' if not set)
        }));
    }

    // Check if user is logged in
    isLoggedIn() {
        // Check if the isLoggedIn flag is set to 'true' in localStorage
        return localStorage.getItem('isLoggedIn') === 'true';
    }

    // Get current user data
    getCurrentUser() {
        if (this.isLoggedIn()) {
            const userData = localStorage.getItem('currentUser');
            return userData ? JSON.parse(userData) : null;
        }
        return null;
    }

    // Check if current user is admin
    isAdmin() {
        const currentUser = this.getCurrentUser();
        return currentUser && currentUser.role === 'admin';
    }

    // Initialize admin controls on page load
    initAdminControls() {
        if (this.isLoggedIn()) {
            const body = document.body;
            if (this.isAdmin()) {
                body.classList.add('admin-user');
            } else {
                body.classList.remove('admin-user');
            }
        }
    }

    // Logout function
    logout() {
        // Show confirmation dialog using SweetAlert
        Swal.fire({
            title: 'Sign Out?',
            text: 'Are you sure you want to sign out of your account?',
            icon: 'question',
            showCancelButton: true, // Show cancel option
            confirmButtonColor: '#B6885D', // Custom button color
            cancelButtonColor: '#6c757d', // Custom button color
            confirmButtonText: 'Yes, sign out', // Custom button text
            cancelButtonText: 'Cancel', // Custom button text
            background: '#fff', // Custom styling
            color: '#452815' // Custom styling
        }).then((result) => {
            // Check if user confirmed logout
            if (result.isConfirmed) {
                // Remove login flag from localStorage
                localStorage.removeItem('isLoggedIn');
                // Remove user data from localStorage
                localStorage.removeItem('currentUser');
                
                // Show success message
                Swal.fire({
                    title: 'Signed Out!',
                    text: 'You have been successfully signed out.',
                    icon: 'success',
                    timer: 1500, // Auto-close after 1.5 seconds
                    showConfirmButton: false, // Hide OK button
                    background: '#fff', // Custom styling
                    color: '#452815' // Custom styling
                }).then(() => {
                    // Redirect to login page after logout
                    window.location.href = 'index.html';
                });
            }
        });
    }

    // Redirect to login if not authenticated
    redirectToLogin() {
        // Get current page path and filename
        const currentPage = window.location.pathname;
        const currentFile = currentPage.split('/').pop() || 'index.html';
        
        // Define pages that don't require authentication
        const publicPages = ['index.html', ''];
        
        // Check if current page is not a public page and user is not logged in
        if (!publicPages.includes(currentFile) && !this.isLoggedIn()) {
            // Redirect to login page
            window.location.href = 'index.html';
        }
    }

    // Update cart badge with item count
    updateCartBadge() {
        // Get reference to cart badge element
        const cartBadge = document.getElementById('cartBadge');
        // Check if cart badge exists
        if (cartBadge) {
            // Get cart data from localStorage or empty array if none exists
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            // Calculate total number of items in cart
            const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
            // Update badge text with item count
            cartBadge.textContent = totalItems;
            // Show or hide badge based on whether cart has items
            cartBadge.style.display = totalItems > 0 ? 'inline' : 'none';
        }
    }

    // Switch between sign in and sign up tabs
    switchTab(tabType) {
        // Get all tab elements
        const tabs = document.querySelectorAll('.auth-tab');
        // Get all form elements
        const forms = document.querySelectorAll('.auth-form');

        // Update active state for tabs
        tabs.forEach(tab => {
            // Remove active class from all tabs
            tab.classList.remove('active');
            // Add active class to the selected tab
            if (tab.textContent.toLowerCase().replace(' ', '') === tabType) {
                tab.classList.add('active');
            }
        });

        // Update visibility for forms
        forms.forEach(form => {
            // Hide all forms
            form.classList.remove('active');
            // Show the form corresponding to the selected tab
            if (form.id === `${tabType}Form`) {
                form.classList.add('active');
            }
        });
    }

    // Toggle password visibility
    togglePassword(inputId) {
        // Get reference to password input element
        const input = document.getElementById(inputId);
        // Get reference to the eye icon element
        const toggle = input.parentNode.querySelector('.password-toggle i');
        
        // Check if password is currently hidden
        if (input.type === 'password') {
            // Change input type to show password text
            input.type = 'text';
            // Update icon to "eye slash" (visible)
            toggle.classList.remove('fa-eye');
            toggle.classList.add('fa-eye-slash');
        } else {
            // Change input type to hide password text
            input.type = 'password';
            // Update icon to "eye" (hidden)
            toggle.classList.remove('fa-eye-slash');
            toggle.classList.add('fa-eye');
        }
    }

    // Show error message using SweetAlert
    showError(message) {
        Swal.fire({
            title: 'Error!', // Dialog title
            text: message, // Error message content
            icon: 'error', // Error icon
            confirmButtonColor: '#B6885D', // Custom button color
            background: '#fff', // Custom styling
            color: '#452815' // Custom styling
        });
    }

    // Show loading state on a button
    showLoading(element, text) {
        // Disable button to prevent multiple clicks
        element.disabled = true;
        // Replace button content with spinner and loading text
        element.innerHTML = `
            <span class="spinner me-2"></span>
            <span class="btn-text">${text}</span>
        `;
    }

    // Hide loading state on a button
    hideLoading(element, originalText) {
        // Re-enable button
        element.disabled = false;
        // Restore original button content
        element.innerHTML = `
            <span class="btn-text">${originalText}</span>
            <i class="fas fa-arrow-right"></i>
        `;
    }

    // Generate unique ID
    generateId() {
        // Find the highest existing ID
        const maxId = this.users.reduce((max, user) => {
            // Parse the ID as a number
            const userId = parseInt(user.id, 10);
            // Return the maximum value
            return userId > max ? userId : max;
        }, 0); // Start with 0
        
        // Return the next ID
        return (maxId + 1).toString();
    }
}

// Initialize authentication manager (creates instance of AuthManager)
const authManager = new AuthManager();

// Global logout function (accessible from HTML)
function logout() {
    // Call logout method on the authManager instance
    authManager.logout();
}

// Global tab switching function (accessible from HTML)
function switchTab(tabType) {
    // Call switchTab method on the authManager instance
    authManager.switchTab(tabType);
}

// Global password visibility toggle function (accessible from HTML)
function togglePassword(inputId) {
    // Call togglePassword method on the authManager instance
    authManager.togglePassword(inputId);
}

// Export for global use (make authManager available on window object)
window.authManager = authManager;