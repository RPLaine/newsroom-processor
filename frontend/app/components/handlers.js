/**
 * Event handler module
 * 
 * Sets up event handlers for all application components
 */
import appState from './state.js';
import { showNotification, showError, formatDate } from './ui.js';
import * as api from './api.js';

/**
 * Initialize all event handlers
 */
export function initEventHandlers() {
    setupJobsTabHandlers();
    setupInputsTabHandlers();
    setupProcessTabHandlers();
    setupOutputsTabHandlers();
    setupLogoutHandler();
}

/**
 * Setup event handlers for Jobs tab
 */
function setupJobsTabHandlers() {
    // Create job form
    const createJobForm = document.getElementById('create-job-form');
    createJobForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const title = document.getElementById('job-title').value;
            const description = document.getElementById('job-description').value;
            const jobType = document.getElementById('job-type').value;
            
            if (!title) {
                showError('Job title is required');
                return;
            }
            
            const response = await api.createJob({
                title,
                description,
                job_type: jobType
            });
            
            if (response.status === 'success' && response.data?.job) {
                showNotification('Job created successfully', 'success');
                
                // Store job in app state
                appState.currentJob = response.data.job;
                
                // Clear form
                document.getElementById('job-title').value = '';
                document.getElementById('job-description').value = '';
                
                // Load jobs
                loadJobs();
            } else {
                throw new Error(response.message || 'Failed to create job');
            }
        } catch (error) {
            showError('Error creating job', error);
        }
    });
    
    // Load jobs when jobs tab is clicked
    document.getElementById('jobs-tab')?.addEventListener('click', loadJobs);
    
    // Initial jobs load
    loadJobs();
}

/**
 * Load jobs from API
 */
async function loadJobs() {
    const jobsList = document.getElementById('jobs-list');
    if (!jobsList) return;
    
    try {
        jobsList.innerHTML = '<p>Loading jobs...</p>';
        
        const response = await api.getJobs();
        
        if (response.status === 'success' && response.data?.jobs) {
            updateJobsList(response.data.jobs);
        } else {
            throw new Error(response.message || 'Failed to load jobs');
        }
    } catch (error) {
        showError('Error loading jobs', error);
        jobsList.innerHTML = '<p>Error loading jobs. Please try again.</p>';
    }
}

/**
 * Update jobs list in UI
 * 
 * @param {Array} jobs - Jobs data from API
 */
function updateJobsList(jobs) {
    const jobsList = document.getElementById('jobs-list');
    if (!jobsList) return;
    
    if (!jobs || jobs.length === 0) {
        jobsList.innerHTML = '<p>No jobs found. Create your first job above!</p>';
        return;
    }
    
    jobsList.innerHTML = '';
    
    jobs.forEach(job => {
        const jobElement = document.createElement('div');
        jobElement.className = 'job-card';
        jobElement.dataset.jobId = job.id;
        
        // Format dates
        const createdDate = job.created_at ? formatDate(new Date(job.created_at * 1000)) : 'Unknown';
        const modifiedDate = job.last_modified ? formatDate(new Date(job.last_modified * 1000)) : 'Unknown';
        
        jobElement.innerHTML = `
            <h3>${job.title || 'Untitled Job'}</h3>
            <p>${job.description || 'No description'}</p>
            <div class="job-meta">
                <span>Created: ${createdDate}</span>
                <span>Modified: ${modifiedDate}</span>
            </div>
            <div class="job-actions">
                <button class="btn select-job-btn primary">Select</button>
                <button class="btn delete-job-btn">Delete</button>
            </div>
        `;
        
        jobsList.appendChild(jobElement);
    });
    
    // Add event listeners to job buttons
    document.querySelectorAll('.select-job-btn').forEach((btn, index) => {
        btn.addEventListener('click', () => {
            selectJob(jobs[index]);
        });
    });
    
    document.querySelectorAll('.delete-job-btn').forEach((btn, index) => {
        btn.addEventListener('click', async () => {
            if (!confirm('Are you sure you want to delete this job?')) {
                return;
            }
            
            try {
                const jobId = jobs[index].id;
                const response = await api.deleteJob(jobId);
                
                if (response.status === 'success') {
                    showNotification('Job deleted successfully', 'success');
                    
                    // Clear current job if it was deleted
                    if (appState.currentJob && appState.currentJob.id === jobId) {
                        appState.currentJob = null;
                    }
                    
                    // Reload jobs
                    loadJobs();
                } else {
                    throw new Error(response.message || 'Failed to delete job');
                }
            } catch (error) {
                showError('Error deleting job', error);
            }
        });
    });
}

/**
 * Select a job and load its data
 * 
 * @param {Object} job - Job data
 */
function selectJob(job) {
    appState.currentJob = job;
    showNotification(`Selected job: ${job.title}`, 'success');
    
    // Update UI components with job data
    updateInputsList(job.inputs || []);
    updateConversationArea(job.conversation || []);
    updateOutputsList(job.outputs || []);
}

/**
 * Setup event handlers for Inputs tab
 */
function setupInputsTabHandlers() {
    // Web search form
    const webSearchForm = document.getElementById('web-search-form');
    webSearchForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!appState.currentJob) {
            showError('Please select a job first');
            return;
        }
        
        try {
            const query = document.getElementById('search-query').value;
            
            if (!query) {
                showError('Search query is required');
                return;
            }
            
            const response = await api.searchWeb(query, appState.currentJob.id);
            
            if (response.status === 'success' && response.data) {
                showNotification('Web search completed', 'success');
                
                // Update current job
                appState.currentJob = response.data.job;
                
                // Update inputs list
                updateInputsList(appState.currentJob.inputs);
                
                // Clear form
                document.getElementById('search-query').value = '';
            } else {
                throw new Error(response.message || 'Web search failed');
            }
        } catch (error) {
            showError('Error performing web search', error);
        }
    });
    
    // RSS form
    const rssForm = document.getElementById('rss-form');
    rssForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!appState.currentJob) {
            showError('Please select a job first');
            return;
        }
        
        try {
            const url = document.getElementById('rss-url').value;
            
            if (!url) {
                showError('RSS URL is required');
                return;
            }
            
            const response = await api.processRSS(url, appState.currentJob.id);
            
            if (response.status === 'success' && response.data) {
                showNotification('RSS feed processed', 'success');
                
                // Update current job
                appState.currentJob = response.data.job;
                
                // Update inputs list
                updateInputsList(appState.currentJob.inputs);
                
                // Clear form
                document.getElementById('rss-url').value = '';
            } else {
                throw new Error(response.message || 'RSS processing failed');
            }
        } catch (error) {
            showError('Error processing RSS feed', error);
        }
    });
    
    // File upload form
    const fileForm = document.getElementById('file-form');
    fileForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!appState.currentJob) {
            showError('Please select a job first');
            return;
        }
        
        try {
            const fileInput = document.getElementById('file-input');
            
            if (!fileInput.files || !fileInput.files[0]) {
                showError('Please select a file');
                return;
            }
            
            const file = fileInput.files[0];
            
            // Read file content
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const fileContent = event.target.result;
                    
                    const response = await api.processFile(
                        file.name,
                        fileContent,
                        appState.currentJob.id
                    );
                    
                    if (response.status === 'success' && response.data) {
                        showNotification('File uploaded successfully', 'success');
                        
                        // Update current job
                        appState.currentJob = response.data.job;
                        
                        // Update inputs list
                        updateInputsList(appState.currentJob.inputs);
                        
                        // Clear form
                        fileInput.value = '';
                    } else {
                        throw new Error(response.message || 'File upload failed');
                    }
                } catch (error) {
                    showError('Error processing file', error);
                }
            };
            
            reader.readAsText(file);
        } catch (error) {
            showError('Error reading file', error);
        }
    });
}

/**
 * Update inputs list in UI
 * 
 * @param {Array} inputs - Inputs data
 */
function updateInputsList(inputs) {
    const inputsList = document.getElementById('inputs-list');
    if (!inputsList) return;
    
    if (!inputs || inputs.length === 0) {
        inputsList.innerHTML = '<p>No inputs added yet.</p>';
        return;
    }
    
    inputsList.innerHTML = '';
    
    inputs.forEach(input => {
        const inputElement = document.createElement('div');
        inputElement.className = 'input-item';
        
        // Format date
        const date = input.timestamp ? formatDate(new Date(input.timestamp * 1000)) : 'Unknown';
        
        let contentPreview = '';
        
        if (input.type === 'web_search') {
            contentPreview = `<strong>Query:</strong> ${input.query || 'Unknown'}<br>`;
            if (input.results && input.results.length > 0) {
                contentPreview += `<strong>Results:</strong><br>`;
                input.results.forEach(result => {
                    contentPreview += `• ${result.title || 'Unknown'}<br>`;
                });
            }
        } else if (input.type === 'rss_feed') {
            contentPreview = `<strong>Source:</strong> ${input.url || 'Unknown'}<br>`;
            if (input.items && input.items.length > 0) {
                contentPreview += `<strong>Items:</strong><br>`;
                input.items.forEach(item => {
                    contentPreview += `• ${item.title || 'Unknown'}<br>`;
                });
            }
        } else if (input.type === 'file') {
            contentPreview = `<strong>File:</strong> ${input.name || 'Unknown'}<br>`;
            const contentSample = input.content ? input.content.substring(0, 100) + '...' : 'No content';
            contentPreview += `<strong>Preview:</strong> ${contentSample}`;
        }
        
        inputElement.innerHTML = `
            <h3>${getInputTypeLabel(input.type)}</h3>
            <div class="input-content">${contentPreview}</div>
            <div class="input-meta">Added: ${date}</div>
        `;
        
        inputsList.appendChild(inputElement);
    });
}

/**
 * Get display label for input type
 * 
 * @param {string} type - Input type
 * @returns {string} Display label
 */
function getInputTypeLabel(type) {
    switch (type) {
        case 'web_search': return 'Web Search';
        case 'rss_feed': return 'RSS Feed';
        case 'file': return 'File Upload';
        default: return 'Input';
    }
}

/**
 * Setup event handlers for Process tab
 */
function setupProcessTabHandlers() {
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
function updateConversationArea(conversation) {
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
 * Add message to conversation area
 * 
 * @param {string} role - Message role (user, assistant, system)
 * @param {string} content - Message content
 * @returns {string} Message element ID
 */
function addMessageToConversation(role, content) {
    const conversationArea = document.getElementById('conversation-area');
    if (!conversationArea) return null;
    
    const messageId = `msg-${Date.now()}`;
    const messageElement = document.createElement('div');
    messageElement.className = `message ${role}`;
    messageElement.id = messageId;
    
    messageElement.innerHTML = `<p>${content}</p>`;
    
    conversationArea.appendChild(messageElement);
    
    // Scroll to bottom
    conversationArea.scrollTop = conversationArea.scrollHeight;
    
    return messageId;
}

/**
 * Remove message from conversation
 * 
 * @param {string} messageId - ID of message to remove
 */
function removeMessage(messageId) {
    if (!messageId) return;
    
    const message = document.getElementById(messageId);
    if (message) {
        message.remove();
    }
}

/**
 * Setup event handlers for Outputs tab
 */
function setupOutputsTabHandlers() {
    // Create output form
    const outputForm = document.getElementById('create-output-form');
    outputForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!appState.currentJob) {
            showError('Please select a job first');
            return;
        }
        
        try {
            const fileName = document.getElementById('output-name').value;
            const content = document.getElementById('output-content').value;
            
            if (!fileName) {
                showError('File name is required');
                return;
            }
            
            if (!content) {
                showError('Content is required');
                return;
            }
            
            const response = await api.saveOutput(
                fileName,
                content,
                appState.currentJob.id
            );
            
            if (response.status === 'success' && response.data) {
                showNotification('Output saved successfully', 'success');
                
                // Update current job
                appState.currentJob = response.data.job;
                
                // Update outputs list
                updateOutputsList(appState.currentJob.outputs);
                
                // Clear form
                document.getElementById('output-name').value = '';
                document.getElementById('output-content').value = '';
            } else {
                throw new Error(response.message || 'Save failed');
            }
        } catch (error) {
            showError('Error saving output', error);
        }
    });
}

/**
 * Update outputs list in UI
 * 
 * @param {Array} outputs - Outputs data
 */
function updateOutputsList(outputs) {
    const outputsList = document.getElementById('outputs-list');
    if (!outputsList) return;
    
    if (!outputs || outputs.length === 0) {
        outputsList.innerHTML = '<p>No outputs saved yet.</p>';
        return;
    }
    
    outputsList.innerHTML = '';
    
    outputs.forEach(output => {
        const outputElement = document.createElement('div');
        outputElement.className = 'output-item';
        
        // Format date
        const date = output.timestamp ? formatDate(new Date(output.timestamp * 1000)) : 'Unknown';
        
        // Truncate preview
        const contentPreview = output.content?.length > 200 
            ? output.content.substring(0, 200) + '...' 
            : output.content;
            
        outputElement.innerHTML = `
            <h3>${output.file_name || 'Untitled'}</h3>
            <div class="output-preview">
                <pre>${contentPreview || 'No content'}</pre>
            </div>
            <div class="output-meta">
                <span>Created: ${date}</span>
                <button class="btn view-output-btn">View</button>
                <button class="btn edit-output-btn">Edit</button>
            </div>
        `;
        
        outputsList.appendChild(outputElement);
    });
    
    // Add event listeners to output buttons
    document.querySelectorAll('.view-output-btn').forEach((btn, index) => {
        btn.addEventListener('click', () => {
            if (outputs[index]) {
                viewOutput(outputs[index]);
            }
        });
    });
    
    document.querySelectorAll('.edit-output-btn').forEach((btn, index) => {
        btn.addEventListener('click', () => {
            if (outputs[index]) {
                editOutput(outputs[index]);
            }
        });
    });
}

/**
 * View output in form
 * 
 * @param {Object} output - Output data
 */
function viewOutput(output) {
    document.getElementById('output-name').value = output.file_name || '';
    document.getElementById('output-content').value = output.content || '';
}

/**
 * Edit output in form
 * 
 * @param {Object} output - Output data
 */
function editOutput(output) {
    // Same functionality as view currently
    viewOutput(output);
}

/**
 * Setup logout handler
 */
function setupLogoutHandler() {
    const logoutButton = document.querySelector('.logout-btn');
    logoutButton?.addEventListener('click', async () => {
        try {
            await api.logout();
        } catch (error) {
            showError('Error logging out', error);
        }
    });
}