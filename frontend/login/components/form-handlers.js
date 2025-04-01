/**
 * Form handlers for login and registration forms
 * Uses JSON objects with 'action' key for backend communication
 */

export function setupFormHandlers(FetchData) {
    setupLoginForm(FetchData);
    setupRegisterForm(FetchData);
    setupTabSwitching(); // Added tab switching setup
}

function setupLoginForm(FetchData) {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        const request = {
            action: 'login',
            data: {
                email: email,
                password: password
            }
        };
        
        try {
            const response = await FetchData(request);
            
            if (response.status === 'success') {
                window.location.reload();
            } else {
                showErrorMessage('login-error', response.message || 'Login failed');
            }
        } catch (error) {
            showErrorMessage('login-error', 'Error connecting to server');
            console.error(error);
        }
    });
}

function setupRegisterForm(FetchData) {
    const registerForm = document.getElementById('register-form');
    if (!registerForm) return;

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm').value;
        
        if (password !== confirmPassword) {
            showErrorMessage('register-error', 'Passwords do not match');
            return;
        }
        
        const request = {
            action: 'register',
            data: {
                email: email,
                password: password
            }
        };
        
        try {
            const response = await FetchData(request);
            
            if (response.status === 'success') {
                window.location.reload();
            } else {
                showErrorMessage('register-error', response.message || 'Registration failed');
            }
        } catch (error) {
            showErrorMessage('register-error', 'Error connecting to server');
            console.error(error);
        }
    });
}

/**
 * Setup tab switching functionality
 * This function adds event listeners to the tab buttons to switch between login and register forms
 */
function setupTabSwitching() {
    const tabs = document.querySelectorAll('.tab');
    if (!tabs.length) {
        console.error('No tab elements found');
        return;
    }
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Get the tab identifier from the data-tab attribute
            const tabId = tab.dataset.tab;
            
            // Remove active class from all tabs
            document.querySelectorAll('.tab').forEach(t => {
                t.classList.remove('active');
            });
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Hide all tab content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Show the selected tab content
            const activeContent = document.getElementById(`${tabId}-tab`);
            if (activeContent) {
                activeContent.classList.add('active');
            } else {
                console.error(`Tab content #${tabId}-tab not found`);
            }
        });
    });
    
    console.log('Tab switching functionality initialized');
}

function showErrorMessage(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }
}