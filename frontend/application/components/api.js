/**
 * API communication module
 * 
 * Handles all server communication using action-based JSON requests
 */

/**
 * Send JSON request to server with 'action' key
 * 
 * @param {Object} requestData - Object containing action and parameters 
 * @returns {Promise<Object>} Response from server
 */
export async function sendRequest(requestData) {
    try {
        const response = await fetch('/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API request error:', error);
        return {
            status: 'error',
            message: error.message
        };
    }
}

/**
 * Get all jobs
 * 
 * @returns {Promise<Object>} Jobs list response
 */
export async function getJobs() {
    return await sendRequest({ action: 'get_jobs' });
}

/**
 * Create new job
 * 
 * @param {string} name - Job name 
 * @returns {Promise<Object>} Job creation response
 */
export async function createJob(name) {
    return await sendRequest({ 
        action: 'create_job',
        name
    });
}

/**
 * Delete existing job
 * 
 * @param {string} jobId - ID of job to delete 
 * @returns {Promise<Object>} Job deletion response
 */
export async function deleteJob(jobId) {
    return await sendRequest({ 
        action: 'delete_job',
        job_id: jobId
    });
}

/**
 * Perform web search
 * 
 * @param {string} query - Search query 
 * @param {string} jobId - Job ID to associate search with
 * @returns {Promise<Object>} Search results
 */
export async function searchWeb(query, jobId) {
    return await sendRequest({
        action: 'search_web',
        query,
        job_id: jobId
    });
}

/**
 * Process RSS feed
 * 
 * @param {string} url - RSS feed URL 
 * @param {string} jobId - Job ID to associate feed with
 * @returns {Promise<Object>} RSS feed processing results
 */
export async function processRSS(url, jobId) {
    return await sendRequest({
        action: 'read_rss',
        rss_url: url,
        job_id: jobId
    });
}

/**
 * Process file upload
 * 
 * @param {string} fileName - Name of file
 * @param {string} fileContent - Content of file
 * @param {string} jobId - Job ID to associate file with 
 * @returns {Promise<Object>} File processing results
 */
export async function processFile(fileName, fileContent, jobId) {
    return await sendRequest({
        action: 'load_file',
        file_name: fileName,
        file_content: fileContent,
        job_id: jobId
    });
}

/**
 * Process user prompt
 * 
 * @param {string} prompt - User prompt
 * @param {string} jobId - Job ID
 * @returns {Promise<Object>} Processing results
 */
export async function processPrompt(prompt, jobId) {
    return await sendRequest({
        action: 'process_data',
        job_id: jobId,
        processing_type: 'prompt',
        prompt
    });
}

/**
 * Run auto-refinement on inputs
 * 
 * @param {string} jobId - Job ID
 * @returns {Promise<Object>} Refinement results
 */
export async function runAutoRefinement(jobId) {
    return await sendRequest({
        action: 'process_data',
        job_id: jobId,
        processing_type: 'refine'
    });
}

/**
 * Generate self-reflection
 * 
 * @param {string} jobId - Job ID
 * @returns {Promise<Object>} Self-reflection results
 */
export async function generateReflection(jobId) {
    return await sendRequest({
        action: 'process_data',
        job_id: jobId,
        processing_type: 'reflect'
    });
}

/**
 * Save output file
 * 
 * @param {string} fileName - Output file name
 * @param {string} content - Output file content
 * @param {string} jobId - Job ID
 * @returns {Promise<Object>} Save output results
 */
export async function saveOutput(fileName, content, jobId) {
    return await sendRequest({
        action: 'save_output',
        job_id: jobId,
        file_name: fileName,
        content
    });
}

/**
 * Log out current user
 * 
 * @returns {Promise<Object>} Logout response
 */
export async function logout() {
    const response = await sendRequest({ action: 'logout' });
    
    if (response.status === 'success') {
        window.location.reload();
    }
    
    return response;
}