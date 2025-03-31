/**
 * FormValidator.js - Handles form validation logic
 * Provides methods to validate login and registration forms
 */

export class FormValidator {
    /**
     * Validate login form fields
     * @param {string} email - Email value
     * @param {string} password - Password value
     * @param {HTMLElement} messageElement - Element to display error messages
     * @returns {boolean} - True if valid, false otherwise
     */
    validateLoginForm(email, password, messageElement) {
        // Check for empty fields
        if (!email || !password) {
            this._showError(messageElement, 'Please fill in all fields');
            return false;
        }
        
        // Basic email validation
        if (!this._isValidEmail(email)) {
            this._showError(messageElement, 'Please enter a valid email address');
            return false;
        }
        
        return true;
    }
    
    /**
     * Validate registration form fields
     * @param {string} email - Email value
     * @param {string} password - Password value
     * @param {string} confirmPassword - Confirm password value
     * @param {HTMLElement} messageElement - Element to display error messages
     * @returns {boolean} - True if valid, false otherwise
     */
    validateRegisterForm(email, password, confirmPassword, messageElement) {
        // Check for empty fields
        if (!email || !password || !confirmPassword) {
            this._showError(messageElement, 'Please fill in all fields');
            return false;
        }
        
        // Basic email validation
        if (!this._isValidEmail(email)) {
            this._showError(messageElement, 'Please enter a valid email address');
            return false;
        }
        
        // Password match validation
        if (password !== confirmPassword) {
            this._showError(messageElement, 'Passwords do not match');
            return false;
        }
        
        // Password length validation
        if (password.length < 8) {
            this._showError(messageElement, 'Password must be at least 8 characters long');
            return false;
        }
        
        // Password strength validation
        if (!this._isStrongPassword(password)) {
            this._showError(messageElement, 'Password should include at least one number and one special character');
            return false;
        }
        
        return true;
    }
    
    /**
     * Check if email is valid
     * @param {string} email - Email to validate
     * @returns {boolean} - True if valid, false otherwise
     * @private
     */
    _isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    /**
     * Check if password is strong enough
     * @param {string} password - Password to validate
     * @returns {boolean} - True if strong enough, false otherwise
     * @private
     */
    _isStrongPassword(password) {
        // Check for at least one number and one special character
        const hasNumber = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        return hasNumber && hasSpecial;
    }
    
    /**
     * Show error message
     * @param {HTMLElement} element - Element to show error in
     * @param {string} message - Error message
     * @private
     */
    _showError(element, message) {
        if (!element) return;
        
        element.textContent = message;
        element.className = 'auth-message error';
    }
}