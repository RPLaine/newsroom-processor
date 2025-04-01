/**
 * Jobs tab event handlers
 */
import * as api from '../api.js';
import { appState, showNotification, showError } from './common.js';

/**
 * Setup event handlers for Jobs tab
 */
export function setupJobsTabHandlers() {
    // Create job form
    const createJobForm = document.getElementById('create-job-form');
    createJobForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const name = document.getElementById('job-title').value;
            
            if (!name) {
                showError('Job name is required');
                return;
            }
            
            const response = await api.createJob(name);
            
            if (response.status === 'success' && response.job_id) {
                showNotification('Job created successfully', 'success');
                
                // Store job in app state
                appState.currentJob = {
                    id: response.job_id,
                    name: name,
                    created_at: response.timestamp
                };
                
                // Clear form
                document.getElementById('job-title').value = '';
                
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
export async function loadJobs() {
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
        
        jobElement.innerHTML = `
            <div class="job-content">
                <h3>${job.name || 'Untitled Job'}</h3>
                <div class="job-meta">
                    <span>Created: ${createdDate}</span>
                </div>
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
export function selectJob(job) {
    appState.currentJob = job;
    showNotification(`Selected job: ${job.name}`, 'success');
    
    // Update UI components with job data
    updateInputsList(job.inputs || []);
    updateConversationArea(job.conversation || []);
    updateOutputsList(job.outputs || []);
    
    // Automatically switch to the Inputs tab
    const inputsTab = document.getElementById('inputs-tab');
    if (inputsTab) {
        inputsTab.click();
    }
}

// Helper functions from other files that will be imported
import { updateInputsList } from './inputs-handlers.js';
import { updateConversationArea } from './process-handlers.js';
import { updateOutputsList } from './outputs-handlers.js';
import { formatDate } from './common.js';