/**
 * Process tab event handlers
 */
import * as api from '../api.js';
import { appState, showNotification, showError, addMessageToConversation, removeMessage } from './common.js';
import { registerFormHandler, registerButtonHandler } from '../ui.js';

/**
 * Setup event handlers for Process tab
 */
export function setupProcessTabHandlers() {
    // Register button handler for start-process button
    registerButtonHandler('start-process-btn', async (event, button) => {
        if (!appState.currentJob) {
            showError('Please select a job first');
            return;
        }
        
        if (!appState.currentStructure) {
            showError('Please select a structure first');
            return;
        }
        
        try {
            // Show loading message
            const loadingId = addMessageToConversation('system', 'Starting structure process flow...');
            
            // Send request to start process
            const response = await api.startProcess(appState.currentJob.id, appState.currentStructure);
            
            // Remove loading message
            removeMessage(loadingId);
            
            if (response.status === 'success' && response.data) {
                // Update current job
                appState.currentJob = response.data.job;
                
                // Add system message about process start
                addMessageToConversation('system', 'Process started:');
                
                // Add first node message
                if (response.data.current_node) {
                    addMessageToConversation(
                        'assistant', 
                        `Started at node: ${response.data.current_node.name || response.data.current_node.id}`
                    );
                }
                
                // Set up polling for process updates if we have a process_id
                if (response.data.process_id) {
                    startProcessPolling(response.data.process_id, appState.currentJob.id);
                }
                
                showNotification('Process started successfully', 'success');
            } else {
                throw new Error(response.message || 'Failed to start process');
            }
        } catch (error) {
            showError('Error starting process', error);
        }
    });
    
    // Register form handler for prompt form
    registerFormHandler('prompt-form', async (event, form) => {
        // ...existing code...
    });
    
    // Register button handler for auto-refine button
    registerButtonHandler('refine-btn', async (event, button) => {
        // ...existing code...
    });
    
    // Register button handler for self-reflect button
    registerButtonHandler('reflect-btn', async (event, button) => {
        // ...existing code...
    });
}

/**
 * Start polling for process updates
 * 
 * @param {string} processId - ID of the running process
 * @param {string} jobId - ID of the current job
 */
async function startProcessPolling(processId, jobId) {
    let isRunning = true;
    let pollCount = 0;
    const MAX_POLLS = 100; // Safety limit
    
    while (isRunning && pollCount < MAX_POLLS) {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Poll every 1.5 seconds
        
        try {
            const response = await api.sendRequest({
                action: 'get_process_status',
                process_id: processId,
                job_id: jobId
            });
            
            if (response.status === 'success' && response.data) {
                // Check if we have a new node
                if (response.data.current_node) {
                    const node = response.data.current_node;
                    addMessageToConversation(
                        'assistant', 
                        `Moved to node: ${node.name || node.id}`
                    );
                }
                
                // Check if process has completed
                if (response.data.status === 'completed') {
                    addMessageToConversation('system', 'Process completed!');
                    isRunning = false;
                }
                
                // Check if process has failed
                if (response.data.status === 'failed') {
                    addMessageToConversation('system', `Process failed: ${response.data.error || 'Unknown error'}`);
                    isRunning = false;
                }
            } else {
                throw new Error(response.message || 'Process status check failed');
            }
        } catch (error) {
            console.error('Error checking process status:', error);
            // Add message but continue polling
            addMessageToConversation('system', `Error checking process status: ${error.message}`);
        }
        
        pollCount++;
    }
    
    if (pollCount >= MAX_POLLS && isRunning) {
        addMessageToConversation('system', 'Process polling timed out. The process might still be running in the background.');
    }
}

/**
 * Update conversation area in UI
 * 
 * @param {Array} conversation - Conversation messages
 */
export function updateConversationArea(conversation) {
    // ...existing code...
}