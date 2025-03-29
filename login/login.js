/**
 * Login and registration functionality for GameGen2
 */
class AuthManager {
    constructor() {
        this.initialized = false;
        this.authState = {
            authenticated: false,
            user_id: null
        };
    }

    /**
     * Initialize the login UI components
     */
    initialize() {
        if (this.initialized) return;
        
        // Create login container content
        const loginContainer = document.getElementById('login-container');
        if (!loginContainer) return;
        
        loginContainer.innerHTML = `
            <section class="auth-container">
                <div class="auth-form-container">
                    <div class="auth-tabs">
                        <button id="login-tab" class="auth-tab active">Login</button>
                        <button id="register-tab" class="auth-tab">Register</button>
                    </div>
                    
                    <form id="login-form" class="auth-form active">
                        <h2>Login to Your Account</h2>
                        <div class="form-group">
                            <label for="login-email">Email</label>
                            <input type="email" id="login-email" name="email" required autocomplete="username">
                        </div>
                        <div class="form-group">
                            <label for="login-password">Password</label>
                            <input type="password" id="login-password" name="password" required autocomplete="current-password">
                        </div>
                        <div id="login-message" class="auth-message"></div>
                        <button type="submit" class="auth-button">Login</button>
                    </form>

                    <form id="register-form" class="auth-form">
                        <h2>Create a New Account</h2>
                        <div class="form-group">
                            <label for="register-email">Email</label>
                            <input type="email" id="register-email" name="email" required autocomplete="username">
                        </div>
                        <div class="form-group">
                            <label for="register-password">Password</label>
                            <input type="password" id="register-password" name="password" required minlength="8" autocomplete="new-password">
                        </div>
                        <div class="form-group">
                            <label for="register-confirm-password">Confirm Password</label>
                            <input type="password" id="register-confirm-password" name="confirm-password" required minlength="8" autocomplete="new-password">
                        </div>
                        <div id="register-message" class="auth-message"></div>
                        <button type="submit" class="auth-button">Register</button>
                    </form>
                </div>
            </section>
        `;
        
        // Tab switching functionality
        const loginTab = document.getElementById('login-tab');
        const registerTab = document.getElementById('register-tab');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        
        if (loginTab && registerTab) {
            // Tab switching event listeners
            loginTab.addEventListener('click', () => {
                loginTab.classList.add('active');
                registerTab.classList.remove('active');
                loginForm.classList.add('active');
                registerForm.classList.remove('active');
            });
            
            registerTab.addEventListener('click', () => {
                registerTab.classList.add('active');
                loginTab.classList.remove('active');
                registerForm.classList.add('active');
                loginForm.classList.remove('active');
            });
        }
        
        // Login form submission
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;
                const messageElement = document.getElementById('login-message');
                
                // Basic validation
                if (!email || !password) {
                    this.showMessage(messageElement, 'Please fill in all fields', 'error');
                    return;
                }
                
                // Send login request
                this.login(email, password, messageElement);
            });
        }
        
        // Registration form submission
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('register-email').value;
                const password = document.getElementById('register-password').value;
                const confirmPassword = document.getElementById('register-confirm-password').value;
                const messageElement = document.getElementById('register-message');
                
                // Basic validation
                if (!email || !password || !confirmPassword) {
                    this.showMessage(messageElement, 'Please fill in all fields', 'error');
                    return;
                }
                
                if (password !== confirmPassword) {
                    this.showMessage(messageElement, 'Passwords do not match', 'error');
                    return;
                }
                
                if (password.length < 8) {
                    this.showMessage(messageElement, 'Password must be at least 8 characters long', 'error');
                    return;
                }
                
                // Send registration request
                this.register(email, password, messageElement);
            });
        }
        
        this.initialized = true;
    }
    
    /**
     * Show or hide the login container
     * @param {boolean} show - Whether to show or hide
     */
    showLoginContainer(show = true) {
        const loginContainer = document.getElementById('login-container');
        const gameContainer = document.getElementById('game-container');
        
        if (show) {
            this.initialize();
            loginContainer.classList.remove('hidden');
            gameContainer.classList.add('hidden');
        } else {
            loginContainer.classList.add('hidden');
            gameContainer.classList.remove('hidden');
        }
    }
    
    /**
     * Login with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @param {HTMLElement} messageElement - Element to show messages
     */
    login(email, password, messageElement) {
        const formData = new URLSearchParams();
        formData.append('email', email);
        formData.append('password', password);
        
        fetch('/api/login', {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                this.showMessage(messageElement, data.message, 'success');
                // Update auth state and UI
                this.checkAuthentication().then(() => {
                    if (this.authState.authenticated) {
                        this.showLoginContainer(false);
                        // Trigger app state update event
                        document.dispatchEvent(new CustomEvent('auth-change', { 
                            detail: { authenticated: true, user_id: this.authState.user_id }
                        }));
                    }
                });
            } else {
                this.showMessage(messageElement, data.message, 'error');
            }
        })
        .catch(error => {
            this.showMessage(messageElement, 'An error occurred. Please try again.', 'error');
            console.error('Login error:', error);
        });
    }
    
    /**
     * Register a new user
     * @param {string} email - User email
     * @param {string} password - User password
     * @param {HTMLElement} messageElement - Element to show messages
     */
    register(email, password, messageElement) {
        const formData = new URLSearchParams();
        formData.append('email', email);
        formData.append('password', password);
        
        fetch('/api/register', {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                this.showMessage(messageElement, data.message, 'success');
                // Update auth state and UI
                this.checkAuthentication().then(() => {
                    if (this.authState.authenticated) {
                        this.showLoginContainer(false);
                        // Trigger app state update event
                        document.dispatchEvent(new CustomEvent('auth-change', { 
                            detail: { authenticated: true, user_id: this.authState.user_id }
                        }));
                    }
                });
            } else {
                this.showMessage(messageElement, data.message, 'error');
            }
        })
        .catch(error => {
            this.showMessage(messageElement, 'An error occurred. Please try again.', 'error');
            console.error('Registration error:', error);
        });
    }
    
    /**
     * Logout the current user
     */
    logout() {
        fetch('/api/logout')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    // Update auth state
                    this.authState = {
                        authenticated: false,
                        user_id: null
                    };
                    
                    // Show login container
                    this.showLoginContainer(true);
                    
                    // Trigger app state update event
                    document.dispatchEvent(new CustomEvent('auth-change', { 
                        detail: { authenticated: false }
                    }));
                } else {
                    console.error('Logout error:', data.message);
                }
            })
            .catch(error => {
                console.error('Logout error:', error);
            });
    }
    
    /**
     * Check if the user is authenticated
     * @returns {Promise<boolean>} Promise resolving to authentication state
     */
    checkAuthentication() {
        return fetch('/api/check-auth')
            .then(response => response.json())
            .then(data => {
                this.authState.authenticated = data.authenticated;
                this.authState.user_id = data.user_id || null;
                
                if (data.authenticated) {
                    this.showLoginContainer(false);
                } else {
                    this.showLoginContainer(true);
                }
                
                return this.authState.authenticated;
            })
            .catch(error => {
                console.error('Auth check error:', error);
                this.showLoginContainer(true);
                return false;
            });
    }
    
    /**
     * Show message in the specified element
     * @param {HTMLElement} element - Element to show message in
     * @param {string} message - Message text
     * @param {string} type - Message type (error, success)
     */
    showMessage(element, message, type) {
        if (!element) return;
        
        element.textContent = message;
        element.className = 'auth-message';
        element.classList.add(type);
    }
}

// Create global auth manager instance
const authManager = new AuthManager();

// Initialize auth on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication state on page load
    authManager.checkAuthentication();
});