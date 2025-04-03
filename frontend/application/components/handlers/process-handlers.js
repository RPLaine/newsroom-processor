import * as api from '../api.js';
import appState from '../../components/state.js';
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
        refreshProcessMessages(appState.messages);
    });

    registerButtonHandler('start-process-btn', async () => {
        if (!appState.currentStructure) {
            showEmptyStateMessage('No structure selected. Please select a structure from the Structures tab before starting a process.');
            return;
        }
          
        displayMessage('system', `Starting process with structure: ${appState.currentStructure.name || 'Unnamed'}`);
        const response = await api.startProcess(appState.currentStructure);
        
        if (response.status === 'success' && response.data) {
            if (response.data.current_node) {
                const nodeName = response.data.current_node.name || response.data.current_node.id;
                displayMessage('system', `Started at node: ${nodeName}`);
            }
            
            if (response.data.process_id) {
                monitorProcessStatus(response.data.process_id);
            }
        }
    });

    registerFormHandler('prompt-form', async (event, form) => {
        if (!appState.currentStructure) {
            showEmptyStateMessage('No structure selected. Please select a structure from the Structures tab first.');
            return;
        }
        
        try {
            const promptInput = document.getElementById('user-prompt');
            const userMessage = promptInput.value;
            
            if (!userMessage) {
                return;
            }
            
            displayMessage('user', userMessage);
            promptInput.value = '';
            
            const loadingMessageId = displayMessage('system', 'Processing...');
            
            const response = await api.processPrompt(userMessage);
            
            removeMessage(loadingMessageId);
            
            if (response.status === 'success' && response.data) {
                displayMessage('assistant', response.data.assistant_response);
            } else {
                throw new Error(response.message || 'Processing failed');
            }
        } catch (error) {
            console.error('Error processing prompt:', error);
        }
    });
}

function showEmptyStateMessage(message) {
    const messagesArea = document.getElementById('messages-area');
    if (messagesArea) {
        messagesArea.innerHTML = `<div class="empty-state">${message}</div>`;
    }
}

export function refreshProcessMessages(messages) {
    const messagesArea = document.getElementById('messages-area');
    if (!messagesArea) return;
    
    if (!appState.currentStructure || !messages || messages.length === 0) {
        let emptyStateMessage = !appState.currentStructure
            ? 'No structure selected. Please select a structure from the Structures tab before starting a process.'
            : 'No messages yet. Click the Start button to begin processing your structure, or type a prompt below to interact with the AI assistant.';
        
        showEmptyStateMessage(emptyStateMessage);
        return;
    }
    
    messagesArea.innerHTML = '';
    
    messages.forEach(message => {
        if (message.role && message.content) {
            displayMessage(message.role, message.content);
        }
    });
    
    scrollToLatestMessage(messagesArea);
}

async function monitorProcessStatus(processId) {
    let isRunning = true;
    let pollCount = 0;
    const MAX_POLLS = 100;
    const POLLING_INTERVAL_MS = 1500;
    
    while (isRunning && pollCount < MAX_POLLS) {
        await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS));
        
        try {
            const response = await api.sendRequest({
                action: 'get_process_status',
                process_id: processId
            });
            
            if (response.status === 'success' && response.data) {
                if (response.data.current_node) {
                    const node = response.data.current_node;
                    const nodeName = node.name || node.id;
                    displayMessage('assistant', `Moved to node: ${nodeName}`);
                }
                
                if (response.data.status === 'completed') {
                    displayMessage('system', 'Process completed!');
                    isRunning = false;
                }
                
                if (response.data.status === 'failed') {
                    const errorMessage = response.data.error || 'Unknown error';
                    displayMessage('system', `Process failed: ${errorMessage}`);
                    isRunning = false;
                }
            } else {
                throw new Error(response.message || 'Process status check failed');
            }
        } catch (error) {
            displayMessage('system', `Error checking process status: ${error.message}`);
        }
        
        pollCount++;
    }
    
    if (pollCount >= MAX_POLLS && isRunning) {
        displayMessage('system', 'Process polling timed out. The process might still be running in the background.');
    }
}

function scrollToLatestMessage(messagesArea) {
    messagesArea.scrollTop = messagesArea.scrollHeight;
}

export function displayMessage(role, content) {
    const messagesArea = document.getElementById('messages-area');
    if (!messagesArea) return null;
    
    const emptyStateDiv = messagesArea.querySelector('.empty-state');
    if (emptyStateDiv) {
        messagesArea.innerHTML = '';
    }
    
    const messageId = `msg-${Date.now()}`;
    const timestamp = new Date();
    
    const messageElement = document.createElement('div');
    messageElement.className = 'collapsible-section';
    messageElement.id = messageId;
    
    const roleName = role.charAt(0).toUpperCase() + role.slice(1);
    const contentPreview = content.length > 30 ? `${content.substring(0, 30)}...` : content;
    
    messageElement.innerHTML = `
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
    
    messagesArea.appendChild(messageElement);
    
    appState.messages.push({
        id: messageId,
        role,
        content,
        timestamp: timestamp.getTime()
    });
    
    scrollToLatestMessage(messagesArea);
    
    return messageId;
}

export function removeMessage(messageId) {
    if (!messageId) return;
    
    const message = document.getElementById(messageId);
    if (message) {
        message.remove();
    }
}