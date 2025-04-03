import appState from '../state.js';
import { showNotification, showError, formatDate } from '../ui.js';
import LoadingAnimation from '../../../animation/loading-animation.js';

let johtoLoadingAnimation;
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
    johtoLoadingAnimation.init();
}

export function getLoadingAnimation() {
    return johtoLoadingAnimation;
}

export function addMessageToConversation(role, content) {
    const conversationArea = document.getElementById('messages-area');
    if (!conversationArea) return null;
    
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
    
    conversationArea.appendChild(sectionElement);
    
    appState.conversation.push({
        id: messageId,
        role,
        content,
        timestamp: timestamp.getTime()
    });
    
    conversationArea.scrollTop = conversationArea.scrollHeight;
    
    return messageId;
}

export function removeMessage(messageId) {
    if (!messageId) return;
    
    const message = document.getElementById(messageId);
    if (message) {
        message.remove();
    }
}

export { appState, showNotification, showError, formatDate };