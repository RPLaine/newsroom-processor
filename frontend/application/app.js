/**
 * Application main entry module.
 * 
 * This file serves as a façade that re-exports the core functionality
 * from the components directory. The actual implementation is in
 * ./components/app.js and other component modules.
 */
import { createApp } from './components/app.js';
import { sendRequest } from './components/api.js';
import { showError } from './components/ui.js';

export default {
    createApp,
    sendRequest,
    showError
};