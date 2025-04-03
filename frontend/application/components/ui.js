import appState from './state.js';

const actionHandlers = {
    buttons: {},
    forms: {}
};

export function formatDate(date) {
    if (!date) return 'Unknown';
    
    return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function switchTab(tabId) {
    appState.activeTab = tabId;
    
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    document.getElementById(`${tabId}-tab`)?.classList.add('active');
    document.getElementById(`${tabId}-content`)?.classList.add('active');
    initCollapsibleSections();
}

export function initCollapsibleSections() {
    document.removeEventListener('click', handleCollapsibleHeadingClick);
    document.addEventListener('click', handleCollapsibleHeadingClick);
}

function handleCollapsibleHeadingClick(event) {
    const heading = event.target.closest('.collapsible-heading');
    if (!heading) return;
    
    const content = heading.nextElementSibling;
    if (content && content.classList.contains('collapsible-content')) {
        content.classList.toggle('collapsed');
        
        const toggleIcon = heading.querySelector('.toggle-icon');
        if (toggleIcon) {
            toggleIcon.textContent = content.classList.contains('collapsed') ? '▶' : '▼';
        }
    }
}

export function createCollapsibleSection(title, htmlContent, startCollapsed = true) {
    const section = document.createElement('div');
    section.className = 'collapsible-section';
    
    const heading = document.createElement('h4');
    heading.className = 'collapsible-heading';
    heading.innerHTML = `${title} <span class="toggle-icon">${startCollapsed ? '▶' : '▼'}</span>`;
    
    const content = document.createElement('div');
    content.className = `collapsible-content ${startCollapsed ? 'collapsed' : ''}`;
    content.innerHTML = htmlContent;
    
    section.appendChild(heading);
    section.appendChild(content);

    return section;
}

export function initButtonHandlers() {
    document.removeEventListener('click', handleButtonClick);
    document.addEventListener('click', handleButtonClick);
}

function handleButtonClick(event) {
    const button = event.target.closest('button');
    if (!button) return;
    
    const buttonType = button.dataset.buttonType || Array.from(button.classList).find(cls => actionHandlers.buttons[cls]);
    
    if (buttonType && actionHandlers.buttons[buttonType]) {
        const dataId = button.dataset.id;
        const dataItem = button.closest('[data-item]')?.dataset.item;
        
        actionHandlers.buttons[buttonType](event, button, {
            id: dataId,
            item: dataItem ? JSON.parse(dataItem) : null
        });
    }
}

export function registerButtonHandler(buttonType, handler) {
    actionHandlers.buttons[buttonType] = handler;
}

export function initFormHandlers() {
    document.removeEventListener('submit', handleFormSubmit, true);
    document.addEventListener('submit', handleFormSubmit, true);
}

function handleFormSubmit(event) {
    const form = event.target.closest('form');
    if (!form) return;

    const formType = form.dataset.formType || form.id;
    if (formType && actionHandlers.forms[formType]) {
        event.preventDefault();
        actionHandlers.forms[formType](event, form);
    }
}

export function registerFormHandler(formType, handler) {
    actionHandlers.forms[formType] = handler;
}

export function showError(message, error) {
    alert(`Error: ${message}`);
}