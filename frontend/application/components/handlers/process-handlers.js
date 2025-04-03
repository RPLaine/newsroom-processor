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
    console.log('[Process] Setting up process tab handlers');

    // Register button handler for start-process button
    registerButtonHandler('start-process-btn', async (event, button) => {
        console.log('[Process] Start process button clicked', { button });
        console.log('[Process] Current structure:', appState.currentStructure);
        
        if (!appState.currentStructure) {
            console.log('[Process] No structure selected');
            showError('Please select a structure first');
            return;
        }
        
        try {
            console.log('[Process] Starting process flow for structure', appState.currentStructure);
            
            // Show loading message
            const loadingId = addMessageToConversation('system', 'Starting structure process flow...');
            
            // Send request to start process
            console.log('[Process] Calling API to start process');
            const response = await api.startProcess(appState.currentStructure);
            console.log('[Process] API response:', response);
            
            // Remove loading message
            removeMessage(loadingId);
            
            if (response.status === 'success' && response.data) {
                // Add system message about process start
                addMessageToConversation('system', 'Process started:');
                
                // Add first node message
                if (response.data.current_node) {
                    console.log('[Process] Current node:', response.data.current_node);
                    addMessageToConversation(
                        'assistant', 
                        `Started at node: ${response.data.current_node.name || response.data.current_node.id}`
                    );
                }
                
                // Set up polling for process updates if we have a process_id
                if (response.data.process_id) {
                    console.log('[Process] Starting polling for process', response.data.process_id);
                    startProcessPolling(response.data.process_id);
                }
                
                showNotification('Process started successfully', 'success');
            } else {
                console.error('[Process] Failed to start process:', response);
                throw new Error(response.message || 'Failed to start process');
            }
        } catch (error) {
            console.error('[Process] Error starting process:', error);
            showError('Error starting process', error);
        }
    });

    // Register form handler for prompt form
    registerFormHandler('prompt-form', async (event, form) => {
        console.log('[Process] Prompt form submitted', { form });
        console.log('[Process] Current structure:', appState.currentStructure);
        
        if (!appState.currentStructure) {
            console.log('[Process] No structure selected');
            showError('Please select a structure first');
            return;
        }
        
        try {
            const prompt = document.getElementById('user-prompt').value;
            console.log('[Process] User prompt:', prompt);
            
            if (!prompt) {
                console.log('[Process] Prompt is empty');
                showError('Prompt is required');
                return;
            }
            
            // Show user message in conversation
            addMessageToConversation('user', prompt);
            
            // Clear prompt input
            document.getElementById('user-prompt').value = '';
            
            // Show loading message
            const loadingId = addMessageToConversation('system', 'Processing your request...');
            
            console.log('[Process] Calling API to process prompt');
            const response = await api.processPrompt(prompt);
            console.log('[Process] API response:', response);
            
            // Remove loading message
            removeMessage(loadingId);
            
            if (response.status === 'success' && response.data) {
                // Add assistant response to conversation
                addMessageToConversation('assistant', response.data.assistant_response);
            } else {
                console.error('[Process] Failed to process prompt:', response);
                throw new Error(response.message || 'Processing failed');
            }
        } catch (error) {
            console.error('[Process] Error processing prompt:', error);
            showError('Error processing prompt', error);
        }
    });
    
    // Register button handler for auto-refine button
    registerButtonHandler('refine-btn', async (event, button) => {
        console.log('[Process] Auto-refine button clicked', { button });
        console.log('[Process] Current structure:', appState.currentStructure);
        
        if (!appState.currentStructure) {
            console.log('[Process] No structure selected');
            showError('Please select a structure first');
            return;
        }
        
        try {
            console.log('[Process] Running auto-refinement');
            
            // Show loading message
            const loadingId = addMessageToConversation('system', 'Automatically refining inputs...');
            
            console.log('[Process] Calling API to run auto-refinement');
            const response = await api.runAutoRefinement();
            console.log('[Process] API response:', response);
            
            // Remove loading message
            removeMessage(loadingId);
            
            if (response.status === 'success' && response.data) {
                // Add system message
                addMessageToConversation('system', 'Auto-refinement complete:');
                
                // Add assistant response
                addMessageToConversation('assistant', response.data.assistant_response);
                
                showNotification('Content refined successfully', 'success');
            } else {
                console.error('[Process] Failed to refine content:', response);
                throw new Error(response.message || 'Refinement failed');
            }
        } catch (error) {
            console.error('[Process] Error refining content:', error);
            showError('Error refining content', error);
        }
    });
    
    // Register button handler for self-reflect button
    registerButtonHandler('reflect-btn', async (event, button) => {
        console.log('[Process] Self-reflect button clicked', { button });
        console.log('[Process] Current structure:', appState.currentStructure);
        
        if (!appState.currentStructure) {
            console.log('[Process] No structure selected');
            showError('Please select a structure first');
            return;
        }
        
        try {
            console.log('[Process] Generating self-reflection');
            
            // Show loading message
            const loadingId = addMessageToConversation('system', 'Generating self-reflection...');
            
            console.log('[Process] Calling API to generate reflection');
            const response = await api.generateReflection();
            console.log('[Process] API response:', response);
            
            // Remove loading message
            removeMessage(loadingId);
            
            if (response.status === 'success' && response.data) {
                // Add system message
                addMessageToConversation('system', 'Self-reflection:');
                
                // Add assistant response
                addMessageToConversation('assistant', response.data.assistant_response);
                
                showNotification('Self-reflection generated', 'success');
            } else {
                console.error('[Process] Failed to generate self-reflection:', response);
                throw new Error(response.message || 'Self-reflection failed');
            }
        } catch (error) {
            console.error('[Process] Error generating self-reflection:', error);
            showError('Error generating self-reflection', error);
        }
    });
}

/**
 * Update conversation area in UI
 * 
 * @param {Array} conversation - Conversation messages
 */
export function updateConversationArea(conversation) {
    const conversationArea = document.getElementById('conversation-area');
    if (!conversationArea) return;
    
    if (!conversation || conversation.length === 0) {
        conversationArea.innerHTML = '<p class="message system">Start a conversation with the AI assistant.</p>';
        return;
    }
    
    conversationArea.innerHTML = '';
    
    conversation.forEach(message => {
        if (message.role && message.content) {
            addMessageToConversation(message.role, message.content);
        }
    });
    
    // Scroll to bottom
    conversationArea.scrollTop = conversationArea.scrollHeight;
}

/**
 * Start polling for process updates
 * 
 * @param {string} processId - ID of the running process
 */
async function startProcessPolling(processId) {
    console.log('[Process] Starting poll process for ID:', processId);
    let isRunning = true;
    let pollCount = 0;
    const MAX_POLLS = 100; // Safety limit
    
    while (isRunning && pollCount < MAX_POLLS) {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Poll every 1.5 seconds
        console.log(`[Process] Poll #${pollCount + 1} for process ${processId}`);
        
        try {
            const response = await api.sendRequest({
                action: 'get_process_status',
                process_id: processId
            });
            console.log(`[Process] Poll #${pollCount + 1} response:`, response);
            
            if (response.status === 'success' && response.data) {
                // Check if we have a new node
                if (response.data.current_node) {
                    const node = response.data.current_node;
                    console.log('[Process] Current node:', node);
                    addMessageToConversation(
                        'assistant', 
                        `Moved to node: ${node.name || node.id}`
                    );
                }
                
                // Check if process has completed
                if (response.data.status === 'completed') {
                    console.log('[Process] Process completed');
                    addMessageToConversation('system', 'Process completed!');
                    isRunning = false;
                }
                
                // Check if process has failed
                if (response.data.status === 'failed') {
                    console.error('[Process] Process failed:', response.data.error);
                    addMessageToConversation('system', `Process failed: ${response.data.error || 'Unknown error'}`);
                    isRunning = false;
                }
            } else {
                console.error('[Process] Process status check failed:', response);
                throw new Error(response.message || 'Process status check failed');
            }
        } catch (error) {
            console.error(`[Process] Poll #${pollCount + 1} error:`, error);
            // Add message but continue polling
            addMessageToConversation('system', `Error checking process status: ${error.message}`);
        }
        
        pollCount++;
    }
    
    if (pollCount >= MAX_POLLS && isRunning) {
        console.log('[Process] Process polling timed out');
        addMessageToConversation('system', 'Process polling timed out. The process might still be running in the background.');
    }
}