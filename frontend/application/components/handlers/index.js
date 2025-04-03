import { setupStructuresTabHandlers } from './structures-handlers.js';
import { setupInputsTabHandlers } from './inputs-handlers.js';
import { setupProcessTabHandlers } from './process-handlers.js';
import { setupOutputsTabHandlers } from './outputs-handlers.js';
import { setupLogoutHandler, setupJohtoButtonHandler } from './misc-handlers.js';

// Initialize the Johto button handler which also initializes the loading animation
setupJohtoButtonHandler();

export function initEventHandlers() {
    setupStructuresTabHandlers();
    setupInputsTabHandlers();
    setupProcessTabHandlers();
    setupOutputsTabHandlers();
    setupLogoutHandler();
}