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

export async function getJobs() {
    return await sendRequest({ action: 'get_jobs' });
}

export async function createJob(name) {
    return await sendRequest({ 
        action: 'create_job',
        name
    });
}

export async function deleteJob(jobId) {
    return await sendRequest({ 
        action: 'delete_job',
        job_id: jobId
    });
}

export async function searchWeb(query, jobId) {
    return await sendRequest({
        action: 'search_web',
        query,
        job_id: jobId
    });
}

export async function processRSS(url, jobId) {
    return await sendRequest({
        action: 'read_rss',
        rss_url: url,
        job_id: jobId
    });
}

export async function processFile(fileName, fileContent, jobId) {
    return await sendRequest({
        action: 'load_file',
        file_name: fileName,
        file_content: fileContent,
        job_id: jobId
    });
}

export async function processPrompt(prompt, jobId) {
    return await sendRequest({
        action: 'process_data',
        job_id: jobId,
        processing_type: 'prompt',
        prompt
    });
}

export async function runAutoRefinement(jobId) {
    return await sendRequest({
        action: 'process_data',
        job_id: jobId,
        processing_type: 'refine'
    });
}

export async function generateReflection(jobId) {
    return await sendRequest({
        action: 'process_data',
        job_id: jobId,
        processing_type: 'reflect'
    });
}

export async function saveOutput(fileName, content, jobId) {
    return await sendRequest({
        action: 'save_output',
        job_id: jobId,
        file_name: fileName,
        content
    });
}

export async function logout() {
    const response = await sendRequest({ action: 'logout' });
    
    if (response.status === 'success') {
        window.location.reload();
    }
    
    return response;
}