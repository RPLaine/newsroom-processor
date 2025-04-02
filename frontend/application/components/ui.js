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
    
    // Reinitialize collapsible sections after tab switch
    initCollapsibleSections();
    
    console.log(`Switched to tab: ${tabId}`);
}

/**
 * Initialize collapsible sections in the application using event delegation
 * Sets up a single document-level listener that handles all collapsible sections
 */
export function initCollapsibleSections() {
    // Remove existing listener if it exists (for reinitializations)
    document.removeEventListener('click', handleCollapsibleHeadingClick);
    
    // Add a single document-level event listener
    document.addEventListener('click', handleCollapsibleHeadingClick);
    
    console.log('Collapsible sections initialized with event delegation');
}

/**
 * Handle click events for collapsible headings
 * @param {Event} event - The click event
 */
function handleCollapsibleHeadingClick(event) {
    // Check if clicked element or its parent is a collapsible heading
    const heading = event.target.closest('.collapsible-heading');
    if (!heading) return;
    
    const content = heading.nextElementSibling;
    if (content && content.classList.contains('collapsible-content')) {
        content.classList.toggle('collapsed');
        
        const toggleIcon = heading.querySelector('.toggle-icon');
        if (toggleIcon) {
            toggleIcon.textContent = content.classList.contains('collapsed') ? '▶' : '▼';
        }
    }
}

/**
 * Create a collapsible section element with the specified title and content
 * @param {string} title - The section title
 * @param {string} htmlContent - HTML content for the collapsible section
 * @param {boolean} startCollapsed - Whether section should start collapsed (default: true)
 * @returns {HTMLElement} - The created section element
 */
export function createCollapsibleSection(title, htmlContent, startCollapsed = true) {
    const section = document.createElement('div');
    section.className = 'collapsible-section';
    
    const heading = document.createElement('h4');
    heading.className = 'collapsible-heading';
    heading.innerHTML = `${title} <span class="toggle-icon">${startCollapsed ? '▶' : '▼'}</span>`;
    
    const content = document.createElement('div');
    content.className = `collapsible-content ${startCollapsed ? 'collapsed' : ''}`;
    content.innerHTML = htmlContent;
    
    section.appendChild(heading);
    section.appendChild(content);
    
    // No need to attach event listener here anymore
    // The document-level event delegation will handle clicks
    
    return section;
}