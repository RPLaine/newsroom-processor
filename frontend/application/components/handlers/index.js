import { setupJobsTabHandlers } from './jobs-handlers.js';
import { setupInputsTabHandlers } from './inputs-handlers.js';
import { setupProcessTabHandlers } from './process-handlers.js';
import { setupOutputsTabHandlers } from './outputs-handlers.js';
import { setupLogoutHandler } from './misc-handlers.js';
import { initLoadingAnimation } from './common.js';

initLoadingAnimation();

export function initEventHandlers() {
    setupJobsTabHandlers();
    setupInputsTabHandlers();
    setupProcessTabHandlers();
    setupOutputsTabHandlers();
    setupLogoutHandler();
}