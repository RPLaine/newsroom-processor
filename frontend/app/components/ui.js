/**
 * UI utilities module
 * 
 * Provides helper functions for UI operations
 */
import appState from './state.js';

/**
 * Show notification to user
 * 
 * @param {string} message - Message to display
 * @param {string} type - Notification type (success, error, info)
 */
export function showNotification(message, type = 'info') {
    const notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notificationContainer.appendChild(notification);
    
    // Store the last notification in state
    appState.lastNotification = {
        message,
        type,
        timestamp: Date.now()
    };
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
    }, 5000);
}

/**
 * Show error notification
 * 
 * @param {string} message - Error message 
 * @param {Error} error - Error object
 */
export function showError(message, error) {
    console.error(message, error);
    const errorMessage = error ? `${message}: ${error.message || 'Unknown error'}` : message;
    showNotification(errorMessage, 'error');
}

/**
 * Format date as readable string
 * 
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
    if (!date) return 'Unknown';
    
    return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Switch active tab
 * 
 * @param {string} tabId - Tab ID to activate
 */
export function switchTab(tabId) {
    // Update state
    appState.activeTab = tabId;
    
    // Update UI
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Activate selected tab
    document.getElementById(`${tabId}-tab`)?.classList.add('active');
    document.getElementById(`${tabId}-content`)?.classList.add('active');
    
    console.log(`Switched to tab: ${tabId}`);
}