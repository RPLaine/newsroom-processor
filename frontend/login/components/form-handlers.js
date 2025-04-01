/**
 * Set up login and registration form handlers
 * 
 * @param {Function} fetchData - Function for making API requests
 */
export function setupFormHandlers(fetchData) {
    setupTabSwitching();
    setupLoginForm(fetchData);
    setupRegisterForm(fetchData);
}

/**
 * Set up tab switching behavior
 */
function setupTabSwitching() {
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
}

/**
 * Set up login form submission handler
 * 
 * @param {Function} fetchData - Function for making API requests
 */
function setupLoginForm(fetchData) {
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
                submitBtn.disabled = true;
                submitBtn.textContent = 'Logging in...';
                
                // Send login request
                const data = await fetchData({
                    action: 'login',
                    data: {
                        email: loginEmail,
                        password: loginPassword
                    }
                });
                
                if (data.status === 'success') {
                    // Show success message
                    loginForm.innerHTML = '<p class="success-message">Login successful! Redirecting...</p>';
                    
                    // Give the server a moment to fully process the login and set cookies
                    setTimeout(() => {
                        // Redirect to the main app page instead of just reloading
                        window.location.href = '/';
                    }, 1000);
                } else {
                    // Login failed
                    loginError.textContent = data.message || 'Invalid email or password.';
                    
                    // Reset button
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Log In';
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
}

/**
 * Set up registration form submission handler
 * 
 * @param {Function} fetchData - Function for making API requests
 */
function setupRegisterForm(fetchData) {
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const registerEmail = document.getElementById('register-email').value.trim();
            const registerPassword = document.getElementById('register-password').value;
            const registerConfirm = document.getElementById('register-confirm').value;
            const registerError = document.getElementById('register-error');
            
            // Clear any previous error messages
            registerError.textContent = '';
            
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
                submitBtn.disabled = true;
                submitBtn.textContent = 'Registering...';
                
                // Send registration request
                const data = await fetchData({
                    action: 'register',
                    data: {
                        email: registerEmail,
                        password: registerPassword
                    }
                });
                
                if (data.status === 'success') {
                    // Registration successful
                    registerForm.innerHTML = '<p class="success-message">Registration successful! Redirecting to application...</p>';
                    
                    // If the server returned user data and set a cookie, the user is already authenticated
                    if (data.userid && data.data && data.data.user) {
                        // Redirect to the main app without requiring an additional login
                        setTimeout(() => {
                            window.location.href = '/';
                        }, 1500);
                    } else {
                        // Fall back to our previous approach if the server didn't auto-authenticate
                        // Store credentials temporarily to auto-fill login form
                        const credentials = {
                            email: registerEmail,
                            password: registerPassword
                        };
                        
                        // Switch to login tab after a delay and auto-fill the form
                        setTimeout(() => {
                            // Click the login tab to switch views
                            document.querySelector('.tab[data-tab="login"]').click();
                            
                            // Auto-fill login form with the user's credentials
                            const loginEmailField = document.getElementById('login-email');
                            const loginPasswordField = document.getElementById('login-password');
                            
                            if (loginEmailField && loginPasswordField) {
                                loginEmailField.value = credentials.email;
                                loginPasswordField.value = credentials.password;
                                
                                // Optionally, focus on the login button
                                const loginButton = document.querySelector('#login-form button[type="submit"]');
                                if (loginButton) {
                                    loginButton.focus();
                                }
                            }
                        }, 1500);
                    }
                } else {
                    // Registration failed
                    if (data.message === "Email already registered") {
                        // Specific handling for already registered email
                        registerError.textContent = 'This email is already registered. Please use a different email or try logging in.';
                        
                        // Highlight the email field to draw attention
                        const emailField = document.getElementById('register-email');
                        if (emailField) {
                            emailField.classList.add('error-field');
                            emailField.focus();
                            
                            // Remove the error highlighting after a delay or when the user changes the input
                            setTimeout(() => {
                                emailField.classList.remove('error-field');
                            }, 5000);
                            
                            emailField.addEventListener('input', () => {
                                emailField.classList.remove('error-field');
                                if (registerError.textContent.includes('already registered')) {
                                    registerError.textContent = '';
                                }
                            }, { once: true });
                        }
                    } else {
                        // Generic error message for other registration failures
                        registerError.textContent = data.message || 'Registration failed. Please try again.';
                    }
                    
                    // Reset button
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Register';
                }
            } catch (error) {
                console.error('Registration error:', error);
                registerError.textContent = 'An error occurred. Please try again.';
                
                // Reset button
                submitBtn.disabled = false;
                submitBtn.textContent = 'Register';
            }
        });
    }
}