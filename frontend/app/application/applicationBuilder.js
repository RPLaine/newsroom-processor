import appState from './state.js';
import { initApp } from './core.js';
import { initializeEventHandlersWithApi } from './eventHandlers.js';

/**
 * Create and initialize the application
 * 
 * @param {Object} data - Initial data from server
 * @param {HTMLElement} appContainer - The app container element
 * @param {Function} fetchData - The data fetching function
 * @returns {Promise<Object>} Updated data after initialization
 */
async function createApp(data, appContainer, fetchData) {
    console.log('Creating app...');
    
    // Store the user data
    appState.currentUser = data;
    
    // Clear the container
    appContainer.innerHTML = '';
    
    // Create app structure using DOM manipulation
    
    // Create header
    const header = document.createElement('header');
    header.className = 'app-header';
    
    const title = document.createElement('h1');
    title.textContent = 'GameGen2';
    header.appendChild(title);
    
    const userInfo = document.createElement('div');
    userInfo.className = 'user-info';
    
    const userName = document.createElement('span');
    userName.className = 'user-name';
    userName.textContent = data.userdata?.profile?.username || 'User';
    userInfo.appendChild(userName);
    
    const logoutBtn = document.createElement('button');
    logoutBtn.id = 'logout-btn';
    logoutBtn.className = 'btn btn-small btn-primary';
    logoutBtn.textContent = 'Logout';
    userInfo.appendChild(logoutBtn);
    
    header.appendChild(userInfo);
    appContainer.appendChild(header);
    
    // Create navigation
    const nav = document.createElement('nav');
    nav.className = 'app-nav';
    
    const navList = document.createElement('ul');
    
    const navItems = [
        { text: 'Dashboard', view: 'dashboard', active: true },
        { text: 'Create Document', view: 'create' },
        { text: 'My Documents', view: 'documents', id: 'documents-nav-link' },
        { text: 'Settings', view: 'settings' }
    ];
    
    navItems.forEach(item => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = item.text;
        a.dataset.navigate = item.view;
        
        if (item.active) {
            a.className = 'active';
        }
        
        if (item.id) {
            a.id = item.id;
        }
        
        li.appendChild(a);
        navList.appendChild(li);
    });
    
    nav.appendChild(navList);
    appContainer.appendChild(nav);
    
    // Create main content container
    const main = document.createElement('main');
    
    // Dashboard view
    const dashboardView = document.createElement('div');
    dashboardView.id = 'dashboard-view';
    dashboardView.className = 'app-view';
    
    const dashboardTitle = document.createElement('h2');
    dashboardTitle.textContent = 'Welcome to GameGen2 Document Generation';
    dashboardView.appendChild(dashboardTitle);
    
    const dashboardText = document.createElement('p');
    dashboardText.textContent = 'Create AI-assisted documents by combining various data sources and interactive prompts.';
    dashboardView.appendChild(dashboardText);
    
    const newDocBtn = document.createElement('button');
    newDocBtn.id = 'new-document-btn';
    newDocBtn.className = 'btn btn-primary';
    newDocBtn.textContent = 'Create New Document';
    dashboardView.appendChild(newDocBtn);
    
    main.appendChild(dashboardView);
    
    // Create view
    const createView = document.createElement('div');
    createView.id = 'create-view';
    createView.className = 'app-view hidden';
    
    const createTitle = document.createElement('h2');
    createTitle.textContent = 'Create New Document';
    createView.appendChild(createTitle);
    
    const createForm = document.createElement('form');
    createForm.id = 'create-document-form';
    
    // Title input group
    const titleGroup = document.createElement('div');
    titleGroup.className = 'form-group';
    
    const titleLabel = document.createElement('label');
    titleLabel.setAttribute('for', 'document-title');
    titleLabel.textContent = 'Document Title:';
    titleGroup.appendChild(titleLabel);
    
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.id = 'document-title';
    titleInput.required = true;
    titleGroup.appendChild(titleInput);
    
    createForm.appendChild(titleGroup);
    
    // Description input group
    const descGroup = document.createElement('div');
    descGroup.className = 'form-group';
    
    const descLabel = document.createElement('label');
    descLabel.setAttribute('for', 'document-description');
    descLabel.textContent = 'Description:';
    descGroup.appendChild(descLabel);
    
    const descTextarea = document.createElement('textarea');
    descTextarea.id = 'document-description';
    descTextarea.rows = 2;
    descGroup.appendChild(descTextarea);
    
    createForm.appendChild(descGroup);
    
    // Document type select group
    const typeGroup = document.createElement('div');
    typeGroup.className = 'form-group';
    
    const typeLabel = document.createElement('label');
    typeLabel.setAttribute('for', 'document-type');
    typeLabel.textContent = 'Document Type:';
    typeGroup.appendChild(typeLabel);
    
    const typeSelect = document.createElement('select');
    typeSelect.id = 'document-type';
    
    const docTypes = [
        { value: 'document', text: 'General Document' },
        { value: 'story', text: 'Creative Story' },
        { value: 'report', text: 'Research Report' },
        { value: 'summary', text: 'Content Summary' }
    ];
    
    docTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type.value;
        option.textContent = type.text;
        typeSelect.appendChild(option);
    });
    
    typeGroup.appendChild(typeSelect);
    createForm.appendChild(typeGroup);
    
    // Submit button
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'btn btn-primary';
    submitBtn.textContent = 'Create Document';
    createForm.appendChild(submitBtn);
    
    createView.appendChild(createForm);
    main.appendChild(createView);
    
    // Documents view
    const documentsView = document.createElement('div');
    documentsView.id = 'documents-view';
    documentsView.className = 'app-view hidden';
    
    const documentsTitle = document.createElement('h2');
    documentsTitle.textContent = 'My Documents';
    documentsView.appendChild(documentsTitle);
    
    const documentsList = document.createElement('div');
    documentsList.id = 'documents-list';
    documentsList.className = 'documents-list';
    
    const loadingText = document.createElement('p');
    loadingText.textContent = 'Loading documents...';
    documentsList.appendChild(loadingText);
    
    documentsView.appendChild(documentsList);
    main.appendChild(documentsView);
    
    // Document editor view
    const documentView = document.createElement('div');
    documentView.id = 'document-view';
    documentView.className = 'app-view hidden';
    
    // Document info section
    const documentInfo = document.createElement('div');
    documentInfo.id = 'document-info';
    documentInfo.className = 'document-info';
    documentView.appendChild(documentInfo);
    
    // Document tabs for different sections
    const documentTabs = document.createElement('div');
    documentTabs.className = 'document-tabs';
    
    const tabsList = document.createElement('ul');
    
    const documentTabItems = [
        { id: 'conversation-tab', text: 'Conversation', active: true },
        { id: 'inputs-tab', text: 'Data Sources' },
        { id: 'outputs-tab', text: 'Generated Outputs' }
    ];
    
    documentTabItems.forEach(item => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#';
        a.id = item.id;
        a.textContent = item.text;
        a.className = item.active ? 'active' : '';
        li.appendChild(a);
        tabsList.appendChild(li);
    });
    
    documentTabs.appendChild(tabsList);
    documentView.appendChild(documentTabs);
    
    // Document content area
    const documentContent = document.createElement('div');
    documentContent.id = 'document-content';
    
    // Conversation tab content
    const conversationTab = document.createElement('div');
    conversationTab.id = 'conversation-content';
    conversationTab.className = 'tab-content active';
    
    const conversationArea = document.createElement('div');
    conversationArea.id = 'conversation-area';
    conversationTab.appendChild(conversationArea);
    
    const promptForm = document.createElement('form');
    promptForm.id = 'prompt-form';
    
    const promptGroup = document.createElement('div');
    promptGroup.className = 'form-group';
    
    const promptLabel = document.createElement('label');
    promptLabel.setAttribute('for', 'user-prompt');
    promptLabel.textContent = 'Enter your prompt:';
    promptGroup.appendChild(promptLabel);
    
    const promptTextarea = document.createElement('textarea');
    promptTextarea.id = 'user-prompt';
    promptTextarea.rows = 3;
    promptTextarea.required = true;
    promptGroup.appendChild(promptTextarea);
    
    promptForm.appendChild(promptGroup);
    
    const promptActions = document.createElement('div');
    promptActions.className = 'form-actions';
    
    const sendBtn = document.createElement('button');
    sendBtn.type = 'submit';
    sendBtn.className = 'btn btn-primary';
    sendBtn.textContent = 'Send';
    promptActions.appendChild(sendBtn);
    
    const processButtons = document.createElement('div');
    processButtons.className = 'process-buttons';
    
    const refineBtn = document.createElement('button');
    refineBtn.type = 'button';
    refineBtn.id = 'refine-btn';
    refineBtn.className = 'btn';
    refineBtn.textContent = 'Auto-Refine';
    processButtons.appendChild(refineBtn);
    
    const reflectBtn = document.createElement('button');
    reflectBtn.type = 'button';
    reflectBtn.id = 'reflect-btn';
    reflectBtn.className = 'btn';
    reflectBtn.textContent = 'Self-Reflect';
    processButtons.appendChild(reflectBtn);
    
    promptActions.appendChild(processButtons);
    promptForm.appendChild(promptActions);
    conversationTab.appendChild(promptForm);
    
    // Inputs tab content
    const inputsTab = document.createElement('div');
    inputsTab.id = 'inputs-content';
    inputsTab.className = 'tab-content';
    
    const inputTools = document.createElement('div');
    inputTools.className = 'input-tools';
    
    const webSearchTool = document.createElement('div');
    webSearchTool.className = 'input-tool';
    
    const webSearchTitle = document.createElement('h3');
    webSearchTitle.textContent = 'Web Search';
    webSearchTool.appendChild(webSearchTitle);
    
    const webSearchForm = document.createElement('form');
    webSearchForm.id = 'web-search-form';
    
    const searchGroup = document.createElement('div');
    searchGroup.className = 'form-group';
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.id = 'search-query';
    searchInput.placeholder = 'Enter search query';
    searchInput.required = true;
    searchGroup.appendChild(searchInput);
    
    const searchBtn = document.createElement('button');
    searchBtn.type = 'submit';
    searchBtn.className = 'btn';
    searchBtn.textContent = 'Search';
    searchGroup.appendChild(searchBtn);
    
    webSearchForm.appendChild(searchGroup);
    webSearchTool.appendChild(webSearchForm);
    
    inputTools.appendChild(webSearchTool);
    
    const rssToolDiv = document.createElement('div');
    rssToolDiv.className = 'input-tool';
    
    const rssTitle = document.createElement('h3');
    rssTitle.textContent = 'RSS Feed';
    rssToolDiv.appendChild(rssTitle);
    
    const rssForm = document.createElement('form');
    rssForm.id = 'rss-form';
    
    const rssGroup = document.createElement('div');
    rssGroup.className = 'form-group';
    
    const rssInput = document.createElement('input');
    rssInput.type = 'url';
    rssInput.id = 'rss-url';
    rssInput.placeholder = 'Enter RSS feed URL';
    rssInput.required = true;
    rssGroup.appendChild(rssInput);
    
    const rssBtn = document.createElement('button');
    rssBtn.type = 'submit';
    rssBtn.className = 'btn';
    rssBtn.textContent = 'Load Feed';
    rssGroup.appendChild(rssBtn);
    
    rssForm.appendChild(rssGroup);
    rssToolDiv.appendChild(rssForm);
    
    inputTools.appendChild(rssToolDiv);
    
    const fileToolDiv = document.createElement('div');
    fileToolDiv.className = 'input-tool';
    
    const fileTitle = document.createElement('h3');
    fileTitle.textContent = 'Upload File';
    fileToolDiv.appendChild(fileTitle);
    
    const fileForm = document.createElement('form');
    fileForm.id = 'file-form';
    
    const fileGroup = document.createElement('div');
    fileGroup.className = 'form-group';
    
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'file-input';
    fileGroup.appendChild(fileInput);
    
    const uploadBtn = document.createElement('button');
    uploadBtn.type = 'submit';
    uploadBtn.className = 'btn';
    uploadBtn.textContent = 'Upload';
    fileGroup.appendChild(uploadBtn);
    
    fileForm.appendChild(fileGroup);
    fileToolDiv.appendChild(fileForm);
    
    inputTools.appendChild(fileToolDiv);
    
    const inputsList = document.createElement('div');
    inputsList.id = 'inputs-list';
    inputsList.className = 'inputs-list';
    inputsList.innerHTML = '<p>No data sources added yet.</p>';
    
    inputsTab.appendChild(inputTools);
    inputsTab.appendChild(inputsList);
    
    // Outputs tab content
    const outputsTab = document.createElement('div');
    outputsTab.id = 'outputs-content';
    outputsTab.className = 'tab-content';
    
    const createOutputForm = document.createElement('form');
    createOutputForm.id = 'create-output-form';
    
    const outputNameGroup = document.createElement('div');
    outputNameGroup.className = 'form-group';
    
    const outputNameLabel = document.createElement('label');
    outputNameLabel.setAttribute('for', 'output-name');
    outputNameLabel.textContent = 'Output Filename:';
    outputNameGroup.appendChild(outputNameLabel);
    
    const outputNameInput = document.createElement('input');
    outputNameInput.type = 'text';
    outputNameInput.id = 'output-name';
    outputNameInput.required = true;
    outputNameGroup.appendChild(outputNameInput);
    
    createOutputForm.appendChild(outputNameGroup);
    
    const outputContentGroup = document.createElement('div');
    outputContentGroup.className = 'form-group';
    
    const outputContentLabel = document.createElement('label');
    outputContentLabel.setAttribute('for', 'output-content');
    outputContentLabel.textContent = 'Content:';
    outputContentGroup.appendChild(outputContentLabel);
    
    const outputContentTextarea = document.createElement('textarea');
    outputContentTextarea.id = 'output-content';
    outputContentTextarea.rows = 10;
    outputContentTextarea.required = true;
    outputContentGroup.appendChild(outputContentTextarea);
    
    createOutputForm.appendChild(outputContentGroup);
    
    const saveOutputBtn = document.createElement('button');
    saveOutputBtn.type = 'submit';
    saveOutputBtn.className = 'btn btn-primary';
    saveOutputBtn.textContent = 'Save Output';
    createOutputForm.appendChild(saveOutputBtn);
    
    const outputsList = document.createElement('div');
    outputsList.id = 'outputs-list';
    outputsList.className = 'outputs-list';
    outputsList.innerHTML = '<p>No outputs saved yet.</p>';
    
    outputsTab.appendChild(createOutputForm);
    outputsTab.appendChild(outputsList);
    
    // Add all tab contents to document content
    documentContent.appendChild(conversationTab);
    documentContent.appendChild(inputsTab);
    documentContent.appendChild(outputsTab);
    documentView.appendChild(documentContent);
    
    main.appendChild(documentView);
    
    // Settings view
    const settingsView = document.createElement('div');
    settingsView.id = 'settings-view';
    settingsView.className = 'app-view hidden';
    
    const settingsTitle = document.createElement('h2');
    settingsTitle.textContent = 'Settings';
    settingsView.appendChild(settingsTitle);
    
    const settingsSection = document.createElement('div');
    settingsSection.className = 'settings-section';
    
    const themeTitle = document.createElement('h3');
    themeTitle.textContent = 'Theme';
    settingsSection.appendChild(themeTitle);
    
    const themeOptions = document.createElement('div');
    themeOptions.className = 'theme-options';
    
    const themes = [
        { theme: 'default', text: 'Default' },
        { theme: 'dark', text: 'Dark' },
        { theme: 'light', text: 'Light' }
    ];
    
    themes.forEach(theme => {
        const themeBtn = document.createElement('button');
        themeBtn.className = 'theme-btn';
        themeBtn.dataset.theme = theme.theme;
        themeBtn.textContent = theme.text;
        themeOptions.appendChild(themeBtn);
    });
    
    settingsSection.appendChild(themeOptions);
    
    // LLM settings section
    const llmSettingsSection = document.createElement('div');
    llmSettingsSection.className = 'settings-section';
    
    const llmTitle = document.createElement('h3');
    llmTitle.textContent = 'LLM Settings';
    llmSettingsSection.appendChild(llmTitle);
    
    const llmForm = document.createElement('form');
    llmForm.id = 'llm-settings-form';
    
    const tempGroup = document.createElement('div');
    tempGroup.className = 'form-group';
    
    const tempLabel = document.createElement('label');
    tempLabel.setAttribute('for', 'temperature');
    tempLabel.textContent = 'Temperature:';
    tempGroup.appendChild(tempLabel);
    
    const tempRange = document.createElement('input');
    tempRange.type = 'range';
    tempRange.id = 'temperature';
    tempRange.min = '0';
    tempRange.max = '1';
    tempRange.step = '0.1';
    tempRange.value = '0.7';
    tempGroup.appendChild(tempRange);
    
    const tempValue = document.createElement('span');
    tempValue.id = 'temp-value';
    tempValue.textContent = '0.7';
    tempGroup.appendChild(tempValue);
    
    llmForm.appendChild(tempGroup);
    
    const maxLengthGroup = document.createElement('div');
    maxLengthGroup.className = 'form-group';
    
    const maxLengthLabel = document.createElement('label');
    maxLengthLabel.setAttribute('for', 'max-length');
    maxLengthLabel.textContent = 'Max Response Length:';
    maxLengthGroup.appendChild(maxLengthLabel);
    
    const maxLengthInput = document.createElement('input');
    maxLengthInput.type = 'number';
    maxLengthInput.id = 'max-length';
    maxLengthInput.min = '100';
    maxLengthInput.max = '4000';
    maxLengthInput.value = '2000';
    maxLengthGroup.appendChild(maxLengthInput);
    
    llmForm.appendChild(maxLengthGroup);
    
    const saveLLMBtn = document.createElement('button');
    saveLLMBtn.type = 'submit';
    saveLLMBtn.className = 'btn';
    saveLLMBtn.textContent = 'Save LLM Settings';
    llmForm.appendChild(saveLLMBtn);
    
    llmSettingsSection.appendChild(llmForm);
    
    settingsView.appendChild(settingsSection);
    settingsView.appendChild(llmSettingsSection);
    main.appendChild(settingsView);
    
    appContainer.appendChild(main);
    
    // Create notifications container
    const notifications = document.createElement('div');
    notifications.id = 'notifications';
    notifications.className = 'notifications-container';
    appContainer.appendChild(notifications);
    
    // Initialize the app
    await initApp({
        theme: localStorage.getItem('gamegen2-theme') || 'default',
        initialView: 'dashboard',
        fetchData: fetchData
    });
    
    // Initialize event handlers that need direct access to fetchData
    initializeEventHandlersWithApi(fetchData);
    
    return data;
}

export { createApp };