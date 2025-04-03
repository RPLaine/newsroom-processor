import * as api from '../api.js';
import appState from '../../components/state.js';
import { showError } from '../../components/ui.js';
import { registerFormHandler, registerButtonHandler } from '../ui.js';

export function resetProcessTab() {
    const messagesArea = document.getElementById('messages-area');
    if (messagesArea) {
        if (!appState.currentStructure) {
            messagesArea.innerHTML = '<div class="empty-state">No structure selected. Please select a structure from the Structures tab before starting a process.</div>';
        } else {
            messagesArea.innerHTML = '';
        }
    }
    appState.currentProcessId = null;
    appState.messages = [];
}

export function setupProcessTabHandlers() {
    document.getElementById('process-tab')?.addEventListener('click', () => {
        updateMessagesArea(appState.messages);
    });

    registerButtonHandler('start-process-btn', async () => {
        if (!appState.currentStructure) {
            showError('Please select a structure first');
            document.getElementById('messages-area').innerHTML = '<div class="empty-state">No structure selected. Please select a structure from the Structures tab before starting a process.</div>';
            return;
        }
          
        addMessageToMessages('Starting process with structure:', appState.currentStructure.name || 'Unnamed');
        const response = await api.startProcess(appState.currentStructure);
        
        if (response.status === 'success' && response.data) {
            if (response.data.current_node) { addMessageToMessages('Started at node:', response.data.current_node.name || response.data.current_node.id); }
            if (response.data.process_id) { startProcessPolling(response.data.process_id); }
        }
    });

    registerFormHandler('prompt-form', async (event, form) => {
        if (!appState.currentStructure) {
            showError('Please select a structure first');
            document.getElementById('messages-area').innerHTML = '<div class="empty-state">No structure selected. Please select a structure from the Structures tab first.</div>';
            return;
        }
        
        try {
            const prompt = document.getElementById('user-prompt').value;
            
            if (!prompt) {
                showError('Prompt is required');
                return;
            }
            
            addMessageToMessages('user', prompt);
            
            document.getElementById('user-prompt').value = '';
            
            const loadingId = addMessageToMessages('system', 'Processing...');
            
            const response = await api.processPrompt(prompt);
            
            removeMessage(loadingId);
            
            if (response.status === 'success' && response.data) {
                addMessageToMessages('assistant', response.data.assistant_response);
            } else {
                throw new Error(response.message || 'Processing failed');
            }
        } catch (error) {
            showError('Error processing prompt', error);
        }
    });
}

export function updateMessagesArea(messages) {
    const messagesArea = document.getElementById('messages-area');
    if (!messagesArea) return;
    
    if (!appState.currentStructure || !messages || messages.length === 0) {
        let emptyStateMessage = '';
        
        if (!appState.currentStructure) {
            emptyStateMessage = 'No structure selected. Please select a structure from the Structures tab before starting a process.';
        } else {
            emptyStateMessage = 'No messages yet. Click the Start button to begin processing your structure, or type a prompt below to interact with the AI assistant.';
        }
        
        messagesArea.innerHTML = `<div class="empty-state">${emptyStateMessage}</div>`;
        return;
    }
    
    messagesArea.innerHTML = '';
    
    messages.forEach(message => {
        if (message.role && message.content) {
            addMessageToMessages(message.role, message.content);
        }
    });
    
    messagesArea.scrollTop = messagesArea.scrollHeight;
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
                    addMessageToMessages(
                        'assistant', 
                        `Moved to node: ${node.name || node.id}`
                    );
                }
                
                if (response.data.status === 'completed') {
                    addMessageToMessages('system', 'Process completed!');
                    isRunning = false;
                }
                
                if (response.data.status === 'failed') {
                    addMessageToMessages('system', `Process failed: ${response.data.error || 'Unknown error'}`);
                    isRunning = false;
                }
            } else {
                throw new Error(response.message || 'Process status check failed');
            }
        } catch (error) {
            addMessageToMessages('system', `Error checking process status: ${error.message}`);
        }
        
        pollCount++;
    }
    
    if (pollCount >= MAX_POLLS && isRunning) {
        addMessageToMessages('system', 'Process polling timed out. The process might still be running in the background.');
    }
}

export function addMessageToMessages(role, content) {
    const messagesArea = document.getElementById('messages-area');
    if (!messagesArea) return null;
    
    const emptyStateDiv = messagesArea.querySelector('.empty-state');
    if (emptyStateDiv) {
        messagesArea.innerHTML = '';
    }
    
    const messageId = `msg-${Date.now()}`;
    const timestamp = new Date();
    
    const sectionElement = document.createElement('div');
    sectionElement.className = 'collapsible-section';
    sectionElement.id = messageId;
    
    const roleName = role.charAt(0).toUpperCase() + role.slice(1);
    
    const contentPreview = content.length > 30 ? `${content.substring(0, 30)}...` : content;
    
    sectionElement.innerHTML = `
        <h4 class="collapsible-heading">
            ${roleName}: ${contentPreview} <span class="toggle-icon">▶</span>
        </h4>
        <div class="collapsible-content collapsed">
            <p>${content}</p>
            <div class="message-metadata">
                <span class="message-timestamp">${timestamp.toLocaleString()}</span>
                <span class="message-role">${roleName}</span>
            </div>
        </div>
    `;
    
    messagesArea.appendChild(sectionElement);
    
    appState.messages.push({
        id: messageId,
        role,
        content,
        timestamp: timestamp.getTime()
    });
    
    messagesArea.scrollTop = messagesArea.scrollHeight;
    
    return messageId;
}

export function removeMessage(messageId) {
    if (!messageId) return;
    
    const message = document.getElementById(messageId);
    if (message) {
        message.remove();
    }
}