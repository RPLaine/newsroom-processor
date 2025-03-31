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
                    // Login successful - reload page to trigger auth check
                    window.location.reload();
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