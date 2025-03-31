/**
 * GameGen2 Utilities Module
 */

import Config from './config.js';

/**
 * Fetch data from the server API
 * 
 * @param {Object} request_data - Data to send to the server
 * @param {string} content_type - Content type for the request
 * @returns {Promise<Object>} Server response
 */
export async function fetchData(request_data, content_type = 'application/json') {
    console.log('Fetching data...', request_data);
    try {
        const response = await fetch(Config.host, {
            method: 'POST',
            headers: {
                'Content-Type': content_type
            },
            body: JSON.stringify(request_data)
        });
        console.log('Response status:', response.status);
        
        // Handle non-OK responses
        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Response data:', data);
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return {
            error: 'Failed to fetch data',
            message: error.message
        };
    }
}

/**
 * Format a date for display
 * 
 * @param {string|Date} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {}) {
    try {
        const dateObj = date instanceof Date ? date : new Date(date);
        
        const defaultOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        return dateObj.toLocaleDateString(undefined, { ...defaultOptions, ...options });
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid date';
    }
}

/**
 * Sanitize HTML to prevent XSS attacks
 * 
 * @param {string} html - HTML string to sanitize
 * @returns {string} Sanitized HTML
 */
export function sanitizeHTML(html) {
    if (!html) return '';
    
    const temp = document.createElement('div');
    temp.textContent = html;
    return temp.innerHTML;
}

/**
 * Generate a unique ID
 * 
 * @returns {string} Unique ID
 */
export function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Debounce a function to limit how often it can be called
 * 
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
    let timeout;
    
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export default object with all utilities
export default {
    FetchData: fetchData,
    formatDate,
    sanitizeHTML,
    generateUniqueId,
    debounce
};