import LoadingAnimation from '../../animation/loading-animation.js';

export function setupFormHandlers(FetchData) {
    setupLoginForm(FetchData);
    setupRegisterForm(FetchData);
    setupTabHandlers();
}

function setupLoginForm(FetchData) {
    const loginForm = document.getElementById('login-form');
    
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        if (!email || !password) {
            showError('Please fill in all fields');
            return;
        }
        
        try {
            const response = await FetchData({
                action: 'login',
                data: {
                    email,
                    password
                }
            });
            
            if (response.status === 'success') {
                // Set a flag in localStorage to indicate we need to show loading animation after reload
                localStorage.setItem('showLoadingAnimation', 'true');
                
                // Reload the page to load the main application
                window.location.reload();
            } else {
                showError(response.message || 'Login failed');
            }
        } catch (error) {
            showError('Connection error. Please try again.');
        }
    });
}

function setupRegisterForm(FetchData) {
    const registerForm = document.getElementById('register-form');
    
    if (!registerForm) return;
    
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        
        if (!name || !email || !password || !confirmPassword) {
            showError('Please fill in all fields');
            return;
        }
        
        if (password !== confirmPassword) {
            showError('Passwords do not match');
            return;
        }
        
        try {
            const response = await FetchData({
                action: 'register',
                data: {
                    name,
                    email,
                    password
                }
            });
            
            if (response.status === 'success') {
                showSuccess('Registration successful! You can now log in.');
                switchTab('login');
                
                // Auto-fill the login email field with the registered email
                const loginEmailField = document.getElementById('login-email');
                if (loginEmailField) {
                    loginEmailField.value = email;
                }
            } else {
                showError(response.message || 'Registration failed');
            }
        } catch (error) {
            showError('Connection error. Please try again.');
        }
    });
}

function setupTabHandlers() {
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    
    if (!loginTab || !registerTab) return;
    
    loginTab.addEventListener('click', () => switchTab('login'));
    registerTab.addEventListener('click', () => switchTab('register'));
}

function switchTab(tabName) {
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginContent = document.getElementById('login-content');
    const registerContent = document.getElementById('register-content');
    
    if (tabName === 'login') {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginContent.classList.add('active');
        registerContent.classList.remove('active');
    } else {
        loginTab.classList.remove('active');
        registerTab.classList.add('active');
        loginContent.classList.remove('active');
        registerContent.classList.add('active');
    }
}

function showError(message) {
    const errorElement = getOrCreateMessageElement('error-message', 'error');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 5000);
}

function showSuccess(message) {
    const successElement = getOrCreateMessageElement('success-message', 'success');
    successElement.textContent = message;
    successElement.style.display = 'block';
    
    setTimeout(() => {
        successElement.style.display = 'none';
    }, 5000);
}

function getOrCreateMessageElement(id, className) {
    let element = document.getElementById(id);
    
    if (!element) {
        element = document.createElement('div');
        element.id = id;
        element.className = className + '-message';
        element.style.display = 'none';
        
        const formContainer = document.querySelector('.form-container');
        formContainer.insertBefore(element, formContainer.firstChild);
    }
    
    return element;
}