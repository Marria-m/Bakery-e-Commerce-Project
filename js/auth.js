class AuthManager {
    constructor() {
        this.users = this.getUsers();
        this.initAuth();
        this.initAuthForms();
    }

    getUsers() {
        const savedUsers = localStorage.getItem('users');
        if (savedUsers) {
            return JSON.parse(savedUsers);
        } 
        
        const defaultUsers = [
            {
                id: '1', 
                name: 'Admin User', 
                email: 'admin@sipsandbites.com', 
                password: 'password123', 
                role: 'admin', 
                createdAt: new Date().toISOString() 
            }
        ];
        
        this.saveUsers(defaultUsers);
        return defaultUsers;

    }

    saveUsers(users) {
        localStorage.setItem('users', JSON.stringify(users));
        this.users = users;
    }

    initAuth() {
        if (this.isLoggedIn()) {
            this.updateCartBadge();
            this.initAdminControls();
        } else {
            this.redirectToLogin();
        }
    }

    initAuthForms() {
        this.initSignInForm();
        this.initSignUpForm();
        this.initTabSwitching();
    }

    initSignInForm() {
        const signinForm = document.getElementById('signinForm');
        if (signinForm) {
            signinForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignIn(e.target);
            });
            const emailInput = document.getElementById('signinEmail');
            const passwordInput = document.getElementById('signinPassword');
            if (emailInput && passwordInput) {
                emailInput.value = 'admin@sipsandbites.com';
                passwordInput.value = 'password123';
            }
        }
    }
    initSignUpForm() {
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignUp(e.target);
            });
        }
    }

    initTabSwitching() {
        const authTabs = document.querySelectorAll('.auth-tab');
        authTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabType = tab.textContent.toLowerCase().replace(' ', '');
                this.switchTab(tabType);
            });
        });
    }

    handleSignIn(form) {
        const email = document.getElementById('signinEmail').value.trim();
        const password = document.getElementById('signinPassword').value.trim();

        const submitBtn = form.querySelector('button[type="submit"]');
        this.showLoading(submitBtn, 'Signing In...');

        setTimeout(() => {
            if (this.validateCredentials(email, password)) {
                const user = this.users.find(u => u.email === email);
                this.setCurrentUser(user);
                
                Swal.fire({
                    title: 'Welcome Back!',
                    text: `Hello ${user.name}, you've successfully signed in.`,
                    icon: 'success',
                    timer: 2000, 
                    showConfirmButton: false, 
                    background: '#fff', 
                    color: '#452815' 
                }).then(() => {
                    window.location.href = 'home.html';
                });
            } else {
                this.showError('Invalid email or password. Please try again.');
                this.hideLoading(submitBtn, 'Sign In');
            }
        }, 1000); 
    }

    handleSignUp(form) {
        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value.trim();
        const confirmPassword = document.getElementById('confirmPassword').value.trim();

        if (!this.validateSignUpData(name, email, password, confirmPassword)) {
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        this.showLoading(submitBtn, 'Creating Account...');

        setTimeout(() => {
            try {
                const newUser = this.createUser(name, email, password);
                this.setCurrentUser(newUser);
                
                Swal.fire({
                    title: 'Account Created!',
                    text: `Welcome to Sweet Delights, ${name}! Your account has been created successfully.`,
                    icon: 'success',
                    confirmButtonText: 'Get Started',
                    confirmButtonColor: '#B6885D',
                    background: '#fff', 
                    color: '#452815' 
                }).then(() => {
                    window.location.href = 'home.html';
                });
            } catch (error) {
                this.showError(error.message);
                this.hideLoading(submitBtn, 'Create Account');
            }
        }, 1000);
    }

    validateSignUpData(name, email, password, confirmPassword) {

        if (name.length < 2) {
            this.showError('Name must be at least 2 characters long');
            return false;
        }

        if (!this.isValidEmail(email)) {
            this.showError('Please enter a valid email address');
            return false;
        }

        if (password.length < 6) {
            this.showError('Password must be at least 6 characters long');
            return false;
        }

        if (password !== confirmPassword) {
            this.showError('Passwords do not match');
            return false;
        }

        if (this.emailExists(email)) {
            this.showError('An account with this email already exists');
            return false;
        }

        return true;
    }

    createUser(name, email, password) {
        const newUser = {
            id: this.generateId(), 
            name: name, 
            email: email, 
            password: password, 
            role: 'user', 
            createdAt: new Date().toISOString() 
        };

        this.users.push(newUser);
        this.saveUsers(this.users);
        return newUser;
    }

    emailExists(email) {
        return this.users.some(user => user.email.toLowerCase() === email.toLowerCase());
    }

    isValidEmail(email) {
        const atIndex = email.indexOf('@');
        const dotIndex = email.lastIndexOf('.');
        
        return atIndex > 0 && 
               dotIndex > atIndex + 1 && 
               dotIndex < email.length - 2; 
    }
    validateCredentials(email, password) {
        return this.users.some(user => 
            user.email.toLowerCase() === email.toLowerCase() && 
            user.password === password
        );
    }
    setCurrentUser(user) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify({
            id: user.id, 
            name: user.name, 
            email: user.email, 
            role: user.role || 'user' 
        }));
    }

    isLoggedIn() {
        return localStorage.getItem('isLoggedIn') === 'true';
    }

    getCurrentUser() {
        if (this.isLoggedIn()) {
            const userData = localStorage.getItem('currentUser');
            return userData ? JSON.parse(userData) : null;
        }
        return null;
    }

    isAdmin() {
        const currentUser = this.getCurrentUser();
        return currentUser && currentUser.role === 'admin';
    }
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

    logout() {
        Swal.fire({
            title: 'Sign Out?',
            text: 'Are you sure you want to sign out of your account?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#B6885D',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, sign out',
            cancelButtonText: 'Cancel',
            background: '#fff',
            color: '#452815'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('currentUser');
                
                Swal.fire({
                    title: 'Signed Out!',
                    text: 'You have been successfully signed out.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                    background: '#fff',
                    color: '#452815'
                }).then(() => {
                    window.location.href = 'index.html';
                });
            }
        });
    }
    redirectToLogin() {
        const currentPage = window.location.pathname;
        const currentFile = currentPage.split('/').pop() || 'index.html';
        
        const publicPages = ['index.html', ''];
        
        if (!publicPages.includes(currentFile) && !this.isLoggedIn()) {
            window.location.href = 'index.html';
        }
    }
    updateCartBadge() {
        const cartBadge = document.getElementById('cartBadge');
        if (cartBadge) {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
            cartBadge.textContent = totalItems;
            cartBadge.style.display = totalItems > 0 ? 'inline' : 'none';
        }
    }
    switchTab(tabType) {
        const tabs = document.querySelectorAll('.auth-tab');
        const forms = document.querySelectorAll('.auth-form');

        tabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.textContent.toLowerCase().replace(' ', '') === tabType) {
                tab.classList.add('active');
            }
        });

        forms.forEach(form => {
            form.classList.remove('active');
            if (form.id === `${tabType}Form`) {
                form.classList.add('active');
            }
        });
    }
    togglePassword(inputId) {
        const input = document.getElementById(inputId);
        const toggle = input.parentNode.querySelector('.password-toggle i');
        
        if (input.type === 'password') {
            input.type = 'text';
            toggle.classList.remove('fa-eye');
            toggle.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            toggle.classList.remove('fa-eye-slash');
            toggle.classList.add('fa-eye');
        }
    }
    showError(message) {
        Swal.fire({
            title: 'Error!',
            text: message,
            icon: 'error',
            confirmButtonColor: '#B6885D',
            background: '#fff',
            color: '#452815'
        });
    }
    showLoading(element, text) {
        element.disabled = true;
        element.innerHTML = `
            <span class="spinner me-2"></span>
            <span class="btn-text">${text}</span>
        `;
    }
    hideLoading(element, originalText) {
        element.disabled = false;
        element.innerHTML = `
            <span class="btn-text">${originalText}</span>
            <i class="fas fa-arrow-right"></i>
        `;
    }
    generateId() {
        const maxId = this.users.reduce((max, user) => {
            const userId = parseInt(user.id, 10);
            return userId > max ? userId : max;
        }, 0);
        
        return (maxId + 1).toString();
    }
}

const authManager = new AuthManager();

function logout() {
    authManager.logout();
}

function switchTab(tabType) {
    authManager.switchTab(tabType);
}

function togglePassword(inputId) {
    authManager.togglePassword(inputId);
}

window.authManager = authManager;