import * as api from '../api.js';
import { appState, showNotification, showError, addMessageToConversation, removeMessage } from './common.js';
import { registerFormHandler, registerButtonHandler } from '../ui.js';

export function setupProcessTabHandlers() {
    registerButtonHandler('start-process-btn', async (event, button) => {
        if (!appState.currentStructure) {
            showError('Please select a structure first');
            document.getElementById('messages-area').innerHTML = '<p class="empty-state">No structure selected. Please select a structure from the Structures tab before starting a process.</p>';
            return;
        }
        
        try {
            const requestData = {
                action: 'start_process',
                structure_data: appState.currentStructure
            };
            
            addMessageToConversation('system', `Starting process with structure: ${appState.currentStructure.name || 'Unnamed'}`);
            
            const loadingId = addMessageToConversation('system', 'Starting process flow...');
            
            const response = await api.startProcess(appState.currentStructure);
            
            removeMessage(loadingId);
            
            if (response.status === 'success' && response.data) {
                addMessageToConversation('system', 'Process started');
                
                if (response.data.current_node) {
                    addMessageToConversation(
                        'assistant', 
                        `Started at node: ${response.data.current_node.name || response.data.current_node.id}`
                    );
                }
                
                if (response.data.process_id) {
                    startProcessPolling(response.data.process_id);
                }
                
                showNotification('Process started', 'success');
            } else {
                throw new Error(response.message || 'Failed to start process');
            }
        } catch (error) {
            showError('Error starting process', error);
        }
    });

    registerFormHandler('prompt-form', async (event, form) => {
        if (!appState.currentStructure) {
            showError('Please select a structure first');
            document.getElementById('messages-area').innerHTML = '<p class="empty-state">No structure selected. Please select a structure first.</p>';
            return;
        }
        
        try {
            const prompt = document.getElementById('user-prompt').value;
            
            if (!prompt) {
                showError('Prompt is required');
                return;
            }
            
            addMessageToConversation('user', prompt);
            
            document.getElementById('user-prompt').value = '';
            
            const loadingId = addMessageToConversation('system', 'Processing...');
            
            const response = await api.processPrompt(prompt);
            
            removeMessage(loadingId);
            
            if (response.status === 'success' && response.data) {
                addMessageToConversation('assistant', response.data.assistant_response);
            } else {
                throw new Error(response.message || 'Processing failed');
            }
        } catch (error) {
            showError('Error processing prompt', error);
        }
    });
}

export function updateConversationArea(conversation) {
    const conversationArea = document.getElementById('messages-area');
    if (!conversationArea) return;
    
    if (!conversation || conversation.length === 0) {
        conversationArea.innerHTML = `
            <div class="collapsible-section">
                <h4 class="collapsible-heading">
                    System <span class="toggle-icon">▶</span>
                </h4>
                <div class="collapsible-content collapsed">
                    <p>Start a conversation with the AI assistant.</p>
                </div>
            </div>
        `;
        return;
    }
    
    conversationArea.innerHTML = '';
    
    conversation.forEach(message => {
        if (message.role && message.content) {
            addMessageToConversation(message.role, message.content);
        }
    });
    
    conversationArea.scrollTop = conversationArea.scrollHeight;
}

async function startProcessPolling(processId) {
    let isRunning = true;
    let pollCount = 0;
    const MAX_POLLS = 100;
    
    while (isRunning && pollCount < MAX_POLLS) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        try {
            const response = await api.sendRequest({
                action: 'get_process_status',
                process_id: processId
            });
            
            if (response.status === 'success' && response.data) {
                if (response.data.current_node) {
                    const node = response.data.current_node;
                    addMessageToConversation(
                        'assistant', 
                        `Moved to node: ${node.name || node.id}`
                    );
                }
                
                if (response.data.status === 'completed') {
                    addMessageToConversation('system', 'Process completed!');
                    isRunning = false;
                }
                
                if (response.data.status === 'failed') {
                    addMessageToConversation('system', `Process failed: ${response.data.error || 'Unknown error'}`);
                    isRunning = false;
                }
            } else {
                throw new Error(response.message || 'Process status check failed');
            }
        } catch (error) {
            addMessageToConversation('system', `Error checking process status: ${error.message}`);
        }
        
        pollCount++;
    }
    
    if (pollCount >= MAX_POLLS && isRunning) {
        addMessageToConversation('system', 'Process polling timed out. The process might still be running in the background.');
    }
}