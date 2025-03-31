/**
 * GameGen2 Login Module
 * 
 * This module handles user authentication including login and registration.
 * It's loaded when a user is not authenticated.
 */

/**
 * Initialize the login module
 * 
 * @param {Object} data - Initial data from server
 * @param {HTMLElement} appContainer - The app container element
 * @param {Function} fetchData - The data fetching function
 * @returns {Promise<Object>} Updated data after login
 */
async function createLogin(data, appContainer, fetchData) {
    console.log('Creating login view...');
    
    // Set the login content
    appContainer.innerHTML = await loadLoginContent();
    
    // Initialize form handlers
    setupFormHandlers(fetchData);
    
    // Initialize WebGPU background if available
    initWebGPUBackground();
    
    return data;
}

/**
 * Load the login page content
 * 
 * @returns {Promise<string>} Login page HTML content
 */
async function loadLoginContent() {
    try {
        const response = await fetch('/login/login-content.html');
        if (!response.ok) {
            throw new Error(`Failed to load login content: ${response.status} ${response.statusText}`);
        }
        return await response.text();
    } catch (error) {
        console.error('Error loading login content:', error);
        // Return basic login form as fallback
        return `
            <div class="login-container">
                <h1>GameGen2</h1>
                <div class="form-container">
                    <div class="tabs">
                        <button class="tab active" data-tab="login">Login</button>
                        <button class="tab" data-tab="register">Register</button>
                    </div>
                    <div class="tab-content active" id="login-tab">
                        <form id="login-form">
                            <div class="form-group">
                                <label for="login-email">Email</label>
                                <input type="email" id="login-email" required>
                            </div>
                            <div class="form-group">
                                <label for="login-password">Password</label>
                                <input type="password" id="login-password" required>
                            </div>
                            <button type="submit" class="btn btn-primary">Log In</button>
                            <p class="error-message" id="login-error"></p>
                        </form>
                    </div>
                    <div class="tab-content" id="register-tab">
                        <form id="register-form">
                            <div class="form-group">
                                <label for="register-email">Email</label>
                                <input type="email" id="register-email" required>
                            </div>
                            <div class="form-group">
                                <label for="register-password">Password</label>
                                <input type="password" id="register-password" required>
                            </div>
                            <div class="form-group">
                                <label for="register-confirm">Confirm Password</label>
                                <input type="password" id="register-confirm" required>
                            </div>
                            <button type="submit" class="btn btn-primary">Register</button>
                            <p class="error-message" id="register-error"></p>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }
}

/**
 * Set up login and registration form handlers
 * @param {Function} fetchData - Function for making API requests
 */
function setupFormHandlers(fetchData) {
    // Tab switching
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to selected tab and content
            tab.classList.add('active');
            document.getElementById(`${tab.dataset.tab}-tab`).classList.add('active');
        });
    });
    
    // Login form submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const loginEmail = document.getElementById('login-email').value.trim();
            const loginPassword = document.getElementById('login-password').value;
            const loginError = document.getElementById('login-error');
            
            if (!loginEmail || !loginPassword) {
                loginError.textContent = 'Please enter both email and password.';
                return;
            }
            
            try {
                // Show loading state
                const submitBtn = loginForm.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.textContent;
                submitBtn.disabled = true;
                submitBtn.textContent = 'Logging in...';
                
                // Send login request using the fetchData function
                const data = await fetchData({
                    action: 'login',
                    data: {
                        email: loginEmail,
                        password: loginPassword
                    }
                });
                
                if (data.status === 'success') {
                    // Login successful - reload page to trigger auth check
                    loginError.textContent = '';
                    window.location.reload();
                } else {
                    // Login failed
                    loginError.textContent = data.message || 'Invalid email or password.';
                    
                    // Reset button
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                }
            } catch (error) {
                console.error('Login error:', error);
                loginError.textContent = 'An error occurred. Please try again.';
                
                // Reset button
                const submitBtn = loginForm.querySelector('button[type="submit"]');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Log In';
            }
        });
    }
    
    // Registration form submission
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const registerEmail = document.getElementById('register-email').value.trim();
            const registerPassword = document.getElementById('register-password').value;
            const registerConfirm = document.getElementById('register-confirm').value;
            const registerError = document.getElementById('register-error');
            
            if (!registerEmail || !registerPassword || !registerConfirm) {
                registerError.textContent = 'Please fill in all fields.';
                return;
            }
            
            if (registerPassword !== registerConfirm) {
                registerError.textContent = 'Passwords do not match.';
                return;
            }
            
            if (registerPassword.length < 8) {
                registerError.textContent = 'Password must be at least 8 characters long.';
                return;
            }
            
            try {
                // Show loading state
                const submitBtn = registerForm.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.textContent;
                submitBtn.disabled = true;
                submitBtn.textContent = 'Registering...';
                
                // Send registration request
                const response = await fetch('/api/post', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        action: 'register',
                        data: {
                            email: registerEmail,
                            password: registerPassword
                        }
                    })
                });
                
                const data = await response.json();
                
                if (data.status === 'success') {
                    // Registration successful
                    registerError.textContent = '';
                    
                    // Show success message and switch to login tab
                    registerForm.innerHTML = '<p class="success-message">Registration successful! You can now log in.</p>';
                    
                    // Switch to login tab after a delay
                    setTimeout(() => {
                        document.querySelector('.tab[data-tab="login"]').click();
                    }, 1500);
                } else {
                    // Registration failed
                    registerError.textContent = data.message || 'Registration failed. Try a different email.';
                    
                    // Reset button
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                }
            } catch (error) {
                console.error('Registration error:', error);
                registerError.textContent = 'An error occurred. Please try again.';
                
                // Reset button
                const submitBtn = registerForm.querySelector('button[type="submit"]');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Register';
            }
        });
    }
}

/**
 * Initialize WebGPU background effects if supported
 */
function initWebGPUBackground() {
    if (typeof initWebGPUBackgroundEffect === 'function') {
        try {
            initWebGPUBackgroundEffect();
        } catch (error) {
            console.warn('WebGPU background not supported or failed to initialize:', error);
            // Fallback to CSS-based background
            document.body.classList.add('gradient-background');
        }
    } else {
        // Fallback to CSS-based background if WebGPU module not loaded
        document.body.classList.add('gradient-background');
    }
}

/**
 * Show the login view
 * 
 * @param {HTMLElement} container - Container element to render the view in
 */
function showLoginView(container) {
    // Load login content into container
    loadLoginContent().then(content => {
        container.innerHTML = content;
        setupFormHandlers();
        initWebGPUBackground();
    }).catch(error => {
        console.error('Error showing login view:', error);
        container.innerHTML = '<p>Error loading login page. Please refresh to try again.</p>';
    });
}

// Export the functionality
export default {
    createLogin,
    loadLoginContent,
    setupFormHandlers,
    initWebGPUBackground,
    showLoginView
};