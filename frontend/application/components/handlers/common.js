/**
 * Common utilities for event handlers
 */
import appState from '../state.js';
import { showNotification, showError, formatDate } from '../ui.js';
import LoadingAnimation from '../../../animation/loading-animation.js';

// Loading animation instance to be shared across modules
let johtoLoadingAnimation;

/**
 * Initialize the loading animation
 */
export function initLoadingAnimation() {
    johtoLoadingAnimation = new LoadingAnimation({
        colors: ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#7B1FA2'],
        particleCount: 150,
        showText: true,
        text: 'Downloading Johto data...',
        showPercentage: false,
        speed: 1.2,
        pulseSpeed: 0.8
    });

    // Initialize the animation
    johtoLoadingAnimation.init();
}

/**
 * Get the loading animation instance
 * 
 * @returns {LoadingAnimation} The loading animation instance
 */
export function getLoadingAnimation() {
    return johtoLoadingAnimation;
}

/**
 * Add message to conversation area
 * 
 * @param {string} role - Message role (user, assistant, system)
 * @param {string} content - Message content
 * @returns {string} Message element ID
 */
export function addMessageToConversation(role, content) {
    const conversationArea = document.getElementById('conversation-area');
    if (!conversationArea) return null;
    
    const messageId = `msg-${Date.now()}`;
    const messageElement = document.createElement('div');
    messageElement.className = `message ${role}`;
    messageElement.id = messageId;
    
    messageElement.innerHTML = `<p>${content}</p>`;
    
    conversationArea.appendChild(messageElement);
    
    // Store message in appState conversation history
    appState.conversation.push({
        id: messageId,
        role,
        content,
        timestamp: Date.now()
    });
    
    // Scroll to bottom
    conversationArea.scrollTop = conversationArea.scrollHeight;
    
    return messageId;
}

/**
 * Remove message from conversation
 * 
 * @param {string} messageId - ID of message to remove
 */
export function removeMessage(messageId) {
    if (!messageId) return;
    
    const message = document.getElementById(messageId);
    if (message) {
        message.remove();
    }
}

// Export shared utilities and state
export { appState, showNotification, showError, formatDate };