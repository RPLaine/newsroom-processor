/**
 * Login and registration functionality for GameGen2
 */
document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    // Tab switching event listeners
    loginTab.addEventListener('click', function() {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
    });
    
    registerTab.addEventListener('click', function() {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
    });
    
    // Login form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const messageElement = document.getElementById('login-message');
        
        // Basic validation
        if (!email || !password) {
            showMessage(messageElement, 'Please fill in all fields', 'error');
            return;
        }
        
        // Send login request
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
                showMessage(messageElement, data.message, 'success');
                // Redirect after successful login
                setTimeout(() => {
                    window.location.href = data.redirect || '/';
                }, 1000);
            } else {
                showMessage(messageElement, data.message, 'error');
            }
        })
        .catch(error => {
            showMessage(messageElement, 'An error occurred. Please try again.', 'error');
            console.error('Login error:', error);
        });
    });
    
    // Registration form submission
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        const messageElement = document.getElementById('register-message');
        
        // Basic validation
        if (!email || !password || !confirmPassword) {
            showMessage(messageElement, 'Please fill in all fields', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showMessage(messageElement, 'Passwords do not match', 'error');
            return;
        }
        
        if (password.length < 8) {
            showMessage(messageElement, 'Password must be at least 8 characters long', 'error');
            return;
        }
        
        // Send registration request
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
                showMessage(messageElement, data.message, 'success');
                // Redirect after successful registration
                setTimeout(() => {
                    window.location.href = data.redirect || '/';
                }, 1000);
            } else {
                showMessage(messageElement, data.message, 'error');
            }
        })
        .catch(error => {
            showMessage(messageElement, 'An error occurred. Please try again.', 'error');
            console.error('Registration error:', error);
        });
    });
    
    // Function to show message in the specified element
    function showMessage(element, message, type) {
        element.textContent = message;
        element.className = 'auth-message';
        element.classList.add(type);
    }
    
    // Check if user is already logged in
    function checkAuthentication() {
        fetch('/api/check-auth')
            .then(response => response.json())
            .then(data => {
                if (data.authenticated) {
                    // If already authenticated and on the login page, redirect to home
                    window.location.href = '/';
                }
            })
            .catch(error => console.error('Auth check error:', error));
    }
    
    // Run auth check on page load
    checkAuthentication();
});