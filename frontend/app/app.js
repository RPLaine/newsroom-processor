/**
 * Main App Module
 * 
 * Provides interface for the application with a clean 4-tab structure
 */
import { createApp } from './components/app.js';
import { sendRequest } from './components/api.js';
import { showNotification, showError } from './components/ui.js';

// Export main functionality
export default {
    createApp,
    sendRequest,
    showNotification,
    showError
};