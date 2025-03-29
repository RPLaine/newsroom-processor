/**
 * Enhanced login and registration functionality for GameGen2
 * Focused on immersive storytelling experience
 */
class AuthManager {
    constructor() {
        this.initialized = false;
        this.authState = {
            authenticated: false,
            user_id: null
        };
        this.storyPrompts = [
            "What if you could reshape reality with your thoughts?",
            "In a world where dreams become tangible...",
            "When ancient magic meets modern technology...",
            "Discover universes beyond imagination...",
            "Every choice creates a new timeline...",
            "What lies beyond the veil of perception?",
            "Your story is waiting to be written..."
        ];
        this.isAnimating = false; // Track animation state to prevent multiple clicks during transition
    }

    /**
     * Initialize the login UI components with enhanced storytelling elements
     */
    initialize() {
        if (this.initialized) return;
        
        // Create login container content if it doesn't exist
        const loginContainer = document.getElementById('login-container');
        if (!loginContainer) return;
        
        // Initialize storytelling elements
        this.initializeStorytellingElements();
        
        // Tab switching functionality
        const loginTab = document.getElementById('login-tab');
        const registerTab = document.getElementById('register-tab');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        
        if (loginTab && registerTab) {
            // Tab switching event listeners with enhanced animation transitions
            loginTab.addEventListener('click', () => {
                if (this.isAnimating || loginTab.classList.contains('active')) return;
                this.isAnimating = true;
                
                // Update active tab styling
                loginTab.classList.add('active');
                registerTab.classList.remove('active');
                
                // Add transform effects for smooth sliding transition
                registerForm.style.transform = 'translateX(20px)';
                registerForm.style.opacity = '0';
                
                // Wait for the exit animation to complete
                setTimeout(() => {
                    // Hide register form and prepare login form for entrance
                    loginForm.style.transform = 'translateX(-20px)';
                    loginForm.style.opacity = '0';
                    loginForm.classList.add('active');
                    registerForm.classList.remove('active');
                    
                    // Trigger reflow to ensure the transform takes effect
                    void loginForm.offsetWidth;
                    
                    // Bring in the login form with entrance animation
                    setTimeout(() => {
                        loginForm.style.transform = 'translateX(0)';
                        loginForm.style.opacity = '1';
                        
                        // Animation complete
                        setTimeout(() => {
                            this.isAnimating = false;
                        }, 300);
                    }, 50);
                }, 300);
            });
            
            registerTab.addEventListener('click', () => {
                if (this.isAnimating || registerTab.classList.contains('active')) return;
                this.isAnimating = true;
                
                // Update active tab styling
                registerTab.classList.add('active');
                loginTab.classList.remove('active');
                
                // Add transform effects for smooth sliding transition
                loginForm.style.transform = 'translateX(-20px)';
                loginForm.style.opacity = '0';
                
                // Wait for the exit animation to complete
                setTimeout(() => {
                    // Hide login form and prepare register form for entrance
                    registerForm.style.transform = 'translateX(20px)';
                    registerForm.style.opacity = '0';
                    registerForm.classList.add('active');
                    loginForm.classList.remove('active');
                    
                    // Trigger reflow to ensure the transform takes effect
                    void registerForm.offsetWidth;
                    
                    // Bring in the register form with entrance animation
                    setTimeout(() => {
                        registerForm.style.transform = 'translateX(0)';
                        registerForm.style.opacity = '1';
                        
                        // Animation complete
                        setTimeout(() => {
                            this.isAnimating = false;
                        }, 300);
                    }, 50);
                }, 300);
            });
        }
        
        // Login form submission with enhanced feedback
        const loginFormElement = document.getElementById('login-form');
        if (loginFormElement) {
            loginFormElement.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;
                const messageElement = document.getElementById('login-message');
                const submitButton = loginFormElement.querySelector('.auth-button');
                
                // Basic validation
                if (!email || !password) {
                    this.showMessage(messageElement, 'Please fill in all fields', 'error');
                    this.shakeElement(messageElement);
                    return;
                }
                
                // Update button to show loading state
                this.setButtonLoading(submitButton, true);
                
                // Send login request
                this.login(email, password, messageElement, submitButton);
            });
        }
        
        // Registration form submission with enhanced feedback
        const registerFormElement = document.getElementById('register-form');
        if (registerFormElement) {
            registerFormElement.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('register-email').value;
                const password = document.getElementById('register-password').value;
                const confirmPassword = document.getElementById('register-confirm-password').value;
                const messageElement = document.getElementById('register-message');
                const submitButton = registerFormElement.querySelector('.auth-button');
                
                // Basic validation with improved feedback
                if (!email || !password || !confirmPassword) {
                    this.showMessage(messageElement, 'Please fill in all fields', 'error');
                    this.shakeElement(messageElement);
                    return;
                }
                
                if (password !== confirmPassword) {
                    this.showMessage(messageElement, 'Passwords do not match', 'error');
                    this.shakeElement(messageElement);
                    this.highlightInputError('register-confirm-password');
                    return;
                }
                
                if (password.length < 8) {
                    this.showMessage(messageElement, 'Password must be at least 8 characters long', 'error');
                    this.shakeElement(messageElement);
                    this.highlightInputError('register-password');
                    return;
                }
                
                // Update button to show loading state
                this.setButtonLoading(submitButton, true);
                
                // Send registration request
                this.register(email, password, messageElement, submitButton);
            });
        }
        
        // Initialize forms with proper transitions
        if (loginForm && loginForm.classList.contains('active')) {
            loginForm.style.opacity = '1';
            loginForm.style.transform = 'translateX(0)';
        }
        if (registerForm) {
            registerForm.style.opacity = registerForm.classList.contains('active') ? '1' : '0';
            registerForm.style.transform = registerForm.classList.contains('active') ? 'translateX(0)' : 'translateX(20px)';
        }
        
        this.initialized = true;
    }
    
    /**
     * Initialize storytelling elements that enhance the login experience
     */
    initializeStorytellingElements() {
        // Dynamically update the storytelling text periodically
        this.cycleStoryPrompts();
    }
    
    /**
     * Show or hide the login container with enhanced transitions
     * @param {boolean} show - Whether to show or hide
     */
    showLoginContainer(show = true) {
        const loginContainer = document.getElementById('login-container');
        const gameContainer = document.getElementById('game-container');
        const userInfo = document.getElementById('user-info');
        
        if (show) {
            // Transitioning to login screen
            this.initialize();
            
            // Animate game container out
            if (!gameContainer.classList.contains('hidden')) {
                gameContainer.classList.add('fade-out-down');
                
                // Wait for animation to complete before hiding
                setTimeout(() => {
                    gameContainer.classList.add('hidden');
                    gameContainer.classList.remove('fade-out-down');
                    
                    // Animate login container in
                    loginContainer.classList.remove('hidden');
                    loginContainer.style.opacity = '0';
                    loginContainer.style.transform = 'translateY(-20px)';
                    
                    // Trigger reflow to ensure the transform takes effect
                    void loginContainer.offsetWidth;
                    
                    // Apply animation
                    loginContainer.classList.add('fade-in-down');
                    
                    // Clean up animation classes after completion
                    setTimeout(() => {
                        loginContainer.classList.remove('fade-in-down');
                        loginContainer.style.opacity = '';
                        loginContainer.style.transform = '';
                    }, 800);
                    
                }, 700); // Match this with CSS animation duration
                
                // Hide user info with animation
                if (userInfo && !userInfo.classList.contains('hidden')) {
                    userInfo.classList.add('hidden');
                }
            } else {
                // Direct show without transition if game container is already hidden
                gameContainer.classList.add('hidden');
                loginContainer.classList.remove('hidden');
                
                if (userInfo) {
                    userInfo.classList.add('hidden');
                }
            }
        } else {
            // Transitioning to game screen
            
            // Animate login container out
            loginContainer.classList.add('fade-out-up');
            
            // Wait for animation to complete before hiding
            setTimeout(() => {
                loginContainer.classList.add('hidden');
                loginContainer.classList.remove('fade-out-up');
                
                // Animate game container in
                gameContainer.classList.remove('hidden');
                gameContainer.style.opacity = '0';
                gameContainer.style.transform = 'translateY(20px)';
                
                // Trigger reflow to ensure the transform takes effect
                void gameContainer.offsetWidth;
                
                // Apply animation
                gameContainer.classList.add('fade-in-up');
                
                // Clean up animation classes after completion
                setTimeout(() => {
                    gameContainer.classList.remove('fade-in-up');
                    gameContainer.style.opacity = '';
                    gameContainer.style.transform = '';
                }, 800);
                
                // Show user info with animation
                if (userInfo) {
                    userInfo.classList.remove('hidden');
                    userInfo.classList.add('visible');
                    
                    // Remove animation class after completion
                    setTimeout(() => {
                        userInfo.classList.remove('visible');
                    }, 500);
                }
            }, 700); // Match this with CSS animation duration
        }
    }
    
    /**
     * Login with email and password with enhanced feedback
     * @param {string} email - User email
     * @param {string} password - User password
     * @param {HTMLElement} messageElement - Element to show messages
     * @param {HTMLElement} submitButton - Submit button element
     */
    login(email, password, messageElement, submitButton) {
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
            this.setButtonLoading(submitButton, false);
            
            if (data.status === 'success') {
                this.showMessage(messageElement, 'Welcome back! Preparing your stories...', 'success');
                
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
                this.shakeElement(messageElement);
            }
        })
        .catch(error => {
            this.setButtonLoading(submitButton, false);
            this.showMessage(messageElement, 'Connection error. Please try again.', 'error');
            this.shakeElement(messageElement);
            console.error('Login error:', error);
        });
    }
    
    /**
     * Register a new user with enhanced feedback
     * @param {string} email - User email
     * @param {string} password - User password
     * @param {HTMLElement} messageElement - Element to show messages
     * @param {HTMLElement} submitButton - Submit button element
     */
    register(email, password, messageElement, submitButton) {
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
            this.setButtonLoading(submitButton, false);
            
            if (data.status === 'success') {
                this.showMessage(messageElement, 'Account created! Your storytelling journey begins...', 'success');
                
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
                this.shakeElement(messageElement);
            }
        })
        .catch(error => {
            this.setButtonLoading(submitButton, false);
            this.showMessage(messageElement, 'Connection error. Please try again.', 'error');
            this.shakeElement(messageElement);
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
     * Show a message in the specified element with enhanced styling
     * @param {HTMLElement} element - Element to show message in
     * @param {string} message - Message text
     * @param {string} type - Message type (error, success)
     */
    showMessage(element, message, type) {
        if (!element) return;
        
        // Hide the element first to trigger re-animation
        element.style.display = 'none';
        
        // Set content and classes
        element.textContent = message;
        element.className = 'auth-message';
        element.classList.add(type);
        
        // Show with animation
        setTimeout(() => {
            element.style.display = 'block';
        }, 10);
    }
    
    /**
     * Apply shake animation to an element for error feedback
     * @param {HTMLElement} element - Element to animate
     */
    shakeElement(element) {
        if (!element) return;
        element.classList.remove('error-shake');
        // Trigger reflow to restart animation
        void element.offsetWidth;
        element.classList.add('error-shake');
    }
    
    /**
     * Highlight input field with error state
     * @param {string} inputId - ID of input to highlight
     */
    highlightInputError(inputId) {
        const input = document.getElementById(inputId);
        if (!input) return;
        
        input.style.borderColor = 'var(--error-border)';
        input.style.backgroundColor = 'rgba(58, 5, 5, 0.2)';
        
        // Clear error styling when input changes
        const clearError = () => {
            input.style.borderColor = '';
            input.style.backgroundColor = '';
            input.removeEventListener('input', clearError);
        };
        
        input.addEventListener('input', clearError);
    }
    
    /**
     * Set loading state on a button
     * @param {HTMLElement} button - Button element
     * @param {boolean} isLoading - Whether button is in loading state
     */
    setButtonLoading(button, isLoading) {
        if (!button) return;
        
        if (isLoading) {
            button.originalText = button.textContent;
            button.disabled = true;
            button.textContent = "Loading...";
            button.style.opacity = "0.8";
        } else {
            button.disabled = false;
            button.textContent = button.originalText || button.textContent;
            button.style.opacity = "";
        }
    }
    
    /**
     * Cycle through story prompts in the storytelling text
     */
    cycleStoryPrompts() {
        const storyPromptElement = document.querySelector('.storytelling-text p');
        if (!storyPromptElement) return;
        
        let currentIndex = 0;
        
        // Cycle prompts every 8 seconds
        setInterval(() => {
            // Fade out
            storyPromptElement.style.opacity = 0;
            
            // Change text after fade out
            setTimeout(() => {
                currentIndex = (currentIndex + 1) % this.storyPrompts.length;
                storyPromptElement.textContent = this.storyPrompts[currentIndex];
                
                // Fade in
                storyPromptElement.style.opacity = 1;
            }, 500);
        }, 8000);
    }
}

// Create global auth manager instance
const authManager = new AuthManager();

// Initialize auth on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication state on page load
    authManager.checkAuthentication();
});