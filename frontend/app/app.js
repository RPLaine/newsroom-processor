import { createApp } from './application/applicationBuilder.js';
import { initApp } from './application/core.js';
import { showNotification, showError, navigateToView } from './application/utils.js';
import { 
    sendActionRequest,
    createJob, continueJob, getJobs, deleteJob, 
    searchWeb, readRSS, loadFile, processData, saveOutput,
    applicationInit 
} from './application/apiMethods.js';

/**
 * Main application module for GameGen2
 * 
 * The backend server processes all requests as JSON objects with an "action" key
 * determining the operation to perform. URL paths are not used for different actions.
 * All requests are sent to the server as POST requests with JSON data.
 */

// Export the module with all accessible functions
export default {
    createApp,
    initApp,
    navigateToView,
    showNotification,
    showError,
    // Core API method for sending action-based requests
    sendActionRequest,
    // Specific API methods (all use sendActionRequest internally)
    applicationInit,
    createJob,
    continueJob,
    getJobs,
    deleteJob,
    searchWeb,
    readRSS,
    loadFile,
    processData,
    saveOutput
};