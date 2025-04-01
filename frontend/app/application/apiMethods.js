/**
 * API Methods Module
 * 
 * Implements methods for communicating with the backend server.
 * The backend only processes JSON requests with an "action" key
 * to determine the operation to perform. URL paths are not used.
 */

/**
 * Core method to send action requests to the server
 * 
 * @param {string} action - The action to perform (required)
 * @param {Object} data - The data to send with the request
 * @returns {Promise<Object>} Response from the server
 */
export async function sendActionRequest(action, data = {}) {
    try {
        // Create request payload with action key
        const requestData = {
            action: action,
            data: data
        };

        // Send POST request with JSON payload
        const response = await fetch('/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Include cookies
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
 * Initialize the application
 * 
 * @returns {Promise<Object>} Application initialization data
 */
export async function applicationInit() {
    return await sendActionRequest('init');
}

/**
 * Create a new job
 * 
 * @param {Object} jobData - Job configuration
 * @returns {Promise<Object>} Job creation response
 */
export async function createJob(jobData) {
    return await sendActionRequest('createJob', jobData);
}

/**
 * Continue an existing job
 * 
 * @param {string} jobId - ID of the job to continue
 * @param {Object} additionalData - Additional data for job continuation
 * @returns {Promise<Object>} Job continuation response
 */
export async function continueJob(jobId, additionalData = {}) {
    const data = {
        jobId,
        ...additionalData
    };
    return await sendActionRequest('continueJob', data);
}

/**
 * Get user jobs
 * 
 * @returns {Promise<Object>} List of user jobs
 */
export async function getJobs() {
    return await sendActionRequest('getJobs');
}

/**
 * Delete a job
 * 
 * @param {string} jobId - ID of the job to delete
 * @returns {Promise<Object>} Job deletion response
 */
export async function deleteJob(jobId) {
    return await sendActionRequest('deleteJob', { jobId });
}

/**
 * Search the web
 * 
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @returns {Promise<Object>} Search results
 */
export async function searchWeb(query, options = {}) {
    const data = {
        query,
        ...options
    };
    return await sendActionRequest('searchWeb', data);
}

/**
 * Read RSS feed
 * 
 * @param {string} url - URL of the RSS feed
 * @param {Object} options - RSS reading options
 * @returns {Promise<Object>} RSS feed content
 */
export async function readRSS(url, options = {}) {
    const data = {
        url,
        ...options
    };
    return await sendActionRequest('readRSS', data);
}

/**
 * Load file content
 * 
 * @param {string} fileId - ID of the file to load
 * @returns {Promise<Object>} File content
 */
export async function loadFile(fileId) {
    return await sendActionRequest('loadFile', { fileId });
}

/**
 * Process data
 * 
 * @param {Object} data - Data to process
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} Processed data
 */
export async function processData(data, options = {}) {
    const requestData = {
        data,
        options
    };
    return await sendActionRequest('processData', requestData);
}

/**
 * Save output
 * 
 * @param {Object} output - Output to save
 * @param {string} format - Output format
 * @returns {Promise<Object>} Save response
 */
export async function saveOutput(output, format = 'json') {
    const data = {
        output,
        format
    };
    return await sendActionRequest('saveOutput', data);
}