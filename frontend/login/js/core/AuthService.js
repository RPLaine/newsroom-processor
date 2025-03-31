/**
 * AuthService.js - Core authentication service
 * Handles all API interactions for login and registration
 */

class AuthService {
    constructor() {
        this.authState = {
            authenticated: false,
            user_id: null
        };
    }

    /**
     * Log in a user
     * @param {string} email - User's email
     * @param {string} password - User's password
     * @returns {Promise} - Resolves with response data
     */
    login(email, password) {
        // Create URL-encoded form data
        const urlEncodedData = `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
        
        // Send request to server
        return fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: urlEncodedData
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // Update auth state
                this.authState.authenticated = true;
                this.authState.user_id = email;
            }
            return data;
        });
    }
    
    /**
     * Register a new user
     * @param {string} email - User's email
     * @param {string} password - User's password
     * @returns {Promise} - Resolves with response data
     */
    register(email, password) {
        // Create URL-encoded form data
        const urlEncodedData = `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
        
        // Send request to server
        return fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: urlEncodedData
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // Update auth state
                this.authState.authenticated = true;
                this.authState.user_id = email;
            }
            return data;
        });
    }

    /**
     * Check the authentication state of the user.
     * @returns {Promise<boolean>} - Resolves to true if authenticated, false otherwise.
     */
    checkAuthentication() {
        return new Promise((resolve) => {
            // In a real implementation, this would call the server
            // For now, we'll use the local state
            setTimeout(() => {
                resolve(this.authState.authenticated);
            }, 500);
        });
    }
}

// Export a singleton instance
export const authService = new AuthService();