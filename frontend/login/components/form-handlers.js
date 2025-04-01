/**
 * Form handlers for login and registration forms
 * Uses JSON objects with 'action' key for backend communication
 */

export function setupFormHandlers(FetchData) {
    setupLoginForm(FetchData);
    setupRegisterForm(FetchData);
    setupSwitchForms();
}

function setupLoginForm(FetchData) {
    const loginForm = document.querySelector('.login-form');
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
    const registerForm = document.querySelector('.register-form');
    if (!registerForm) return;

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        
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

function setupSwitchForms() {
    const switchToRegister = document.getElementById('switch-to-register');
    const switchToLogin = document.getElementById('switch-to-login');
    const loginForm = document.querySelector('.login-form');
    const registerForm = document.querySelector('.register-form');
    
    if (switchToRegister && switchToLogin && loginForm && registerForm) {
        switchToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
        });
        
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            registerForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
        });
    }
}

function showErrorMessage(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }
}