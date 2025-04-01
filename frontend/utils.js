/**
 * Utility functions for the GameGen2 application
 * Handles communication with the backend server using JSON with action keys
 */

/**
 * Send a POST request to the backend with JSON data
 * The backend expects all requests to contain an 'action' key
 * 
 * @param {Object} requestData - Object containing the action and data
 * @returns {Promise<Object>} Response from the server
 */
export async function fetchData(requestData) {
    try {
        const response = await fetch('/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        return {
            status: 'error',
            message: error.message || 'Failed to connect to server'
        };
    }
}

/**
 * Format a date object or timestamp into a readable string
 * 
 * @param {Date|number} date - Date object or timestamp to format
 * @param {Object} options - Formatting options
 * @param {boolean} options.includeTime - Whether to include time in the output
 * @param {boolean} options.shortFormat - Whether to use a shorter date format
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {}) {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) {
        return 'Invalid date';
    }
    
    const {
        includeTime = true,
        shortFormat = false
    } = options;
    
    const dateOptions = {
        year: 'numeric',
        month: shortFormat ? 'numeric' : 'long',
        day: 'numeric'
    };
    
    if (includeTime) {
        dateOptions.hour = '2-digit';
        dateOptions.minute = '2-digit';
    }
    
    return dateObj.toLocaleString(undefined, dateOptions);
}