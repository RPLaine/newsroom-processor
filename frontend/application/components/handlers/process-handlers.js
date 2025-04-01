/**
 * Process tab event handlers
 */
import * as api from '../api.js';
import { appState, showNotification, showError, addMessageToConversation, removeMessage } from './common.js';

/**
 * Setup event handlers for Process tab
 */
export function setupProcessTabHandlers() {
    // Prompt form
    const promptForm = document.getElementById('prompt-form');
    promptForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!appState.currentJob) {
            showError('Please select a job first');
            return;
        }
        
        try {
            const prompt = document.getElementById('user-prompt').value;
            
            if (!prompt) {
                showError('Prompt is required');
                return;
            }
            
            // Show user message in conversation
            addMessageToConversation('user', prompt);
            
            // Clear prompt input
            document.getElementById('user-prompt').value = '';
            
            // Show loading message
            const loadingId = addMessageToConversation('system', 'Processing your request...');
            
            const response = await api.processPrompt(prompt, appState.currentJob.id);
            
            // Remove loading message
            removeMessage(loadingId);
            
            if (response.status === 'success' && response.data) {
                // Update current job
                appState.currentJob = response.data.job;
                
                // Add assistant response to conversation
                addMessageToConversation('assistant', response.data.assistant_response);
            } else {
                throw new Error(response.message || 'Processing failed');
            }
        } catch (error) {
            showError('Error processing prompt', error);
        }
    });
    
    // Auto-refine button
    const refineBtn = document.getElementById('refine-btn');
    refineBtn?.addEventListener('click', async () => {
        if (!appState.currentJob) {
            showError('Please select a job first');
            return;
        }
        
        try {
            // Show loading message
            const loadingId = addMessageToConversation('system', 'Automatically refining inputs...');
            
            const response = await api.runAutoRefinement(appState.currentJob.id);
            
            // Remove loading message
            removeMessage(loadingId);
            
            if (response.status === 'success' && response.data) {
                // Update current job
                appState.currentJob = response.data.job;
                
                // Add system message
                addMessageToConversation('system', 'Auto-refinement complete:');
                
                // Add assistant response
                addMessageToConversation('assistant', response.data.assistant_response);
                
                showNotification('Content refined successfully', 'success');
            } else {
                throw new Error(response.message || 'Refinement failed');
            }
        } catch (error) {
            showError('Error refining content', error);
        }
    });
    
    // Self-reflect button
    const reflectBtn = document.getElementById('reflect-btn');
    reflectBtn?.addEventListener('click', async () => {
        if (!appState.currentJob) {
            showError('Please select a job first');
            return;
        }
        
        try {
            // Show loading message
            const loadingId = addMessageToConversation('system', 'Generating self-reflection...');
            
            const response = await api.generateReflection(appState.currentJob.id);
            
            // Remove loading message
            removeMessage(loadingId);
            
            if (response.status === 'success' && response.data) {
                // Update current job
                appState.currentJob = response.data.job;
                
                // Add system message
                addMessageToConversation('system', 'Self-reflection:');
                
                // Add assistant response
                addMessageToConversation('assistant', response.data.assistant_response);
                
                showNotification('Self-reflection generated', 'success');
            } else {
                throw new Error(response.message || 'Self-reflection failed');
            }
        } catch (error) {
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