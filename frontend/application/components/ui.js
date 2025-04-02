/**
 * UI utilities module
 * 
 * Provides helper functions for UI operations
 */
import appState from './state.js';

// Store handlers for button clicks and form submissions
const actionHandlers = {
    buttons: {},
    forms: {}
};

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

/**
 * Initialize button click handlers using event delegation
 * Sets up a document-level listener for handling all button clicks
 */
export function initButtonHandlers() {
    // Remove existing listener if it exists
    document.removeEventListener('click', handleButtonClick);
    
    // Add a single document-level event listener
    document.addEventListener('click', handleButtonClick);
    
    console.log('Button handlers initialized with event delegation');
}

/**
 * Handle click events for buttons using event delegation
 * @param {Event} event - The click event
 */
function handleButtonClick(event) {
    // Find the closest button element to the click target
    const button = event.target.closest('button');
    if (!button) return;
    
    // Get the button type from data-button-type attribute or class
    const buttonType = button.dataset.buttonType || 
                      Array.from(button.classList)
                      .find(cls => actionHandlers.buttons[cls]);
    
    // If we have a handler for this button type, execute it
    if (buttonType && actionHandlers.buttons[buttonType]) {
        // For buttons with data-id, pass the id to the handler
        const dataId = button.dataset.id;
        const dataItem = button.closest('[data-item]')?.dataset.item;
        
        actionHandlers.buttons[buttonType](event, button, {
            id: dataId,
            item: dataItem ? JSON.parse(dataItem) : null
        });
    }
}

/**
 * Register a button click handler
 * @param {string} buttonType - The button type (class name or data-button-type)
 * @param {Function} handler - The handler function to call when the button is clicked
 */
export function registerButtonHandler(buttonType, handler) {
    actionHandlers.buttons[buttonType] = handler;
}

/**
 * Initialize form submission handlers using event delegation
 * Sets up a document-level listener for handling all form submissions
 */
export function initFormHandlers() {
    // Remove existing listener if it exists
    document.removeEventListener('submit', handleFormSubmit, true);
    
    // Add a single document-level event listener with capture phase
    document.addEventListener('submit', handleFormSubmit, true);
    
    console.log('Form handlers initialized with event delegation');
}

/**
 * Handle submit events for forms using event delegation
 * @param {Event} event - The submit event
 */
function handleFormSubmit(event) {
    // Find the form element
    const form = event.target.closest('form');
    if (!form) return;
    
    // Get the form type from data-form-type attribute or id
    const formType = form.dataset.formType || form.id;
    
    // If we have a handler for this form type, execute it
    if (formType && actionHandlers.forms[formType]) {
        // Prevent default form submission
        event.preventDefault();
        
        // Call the registered handler
        actionHandlers.forms[formType](event, form);
    }
}

/**
 * Register a form submission handler
 * @param {string} formType - The form type (id or data-form-type)
 * @param {Function} handler - The handler function to call when the form is submitted
 */
export function registerFormHandler(formType, handler) {
    actionHandlers.forms[formType] = handler;
}