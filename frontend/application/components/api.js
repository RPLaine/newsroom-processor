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

        const jsonResponse = await response.json();
        return jsonResponse;
    } catch (error) {        
        return {
            status: 'error',
            message: error.message
        };
    }
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

export async function processPrompt(prompt) {
    return await sendRequest({
        action: 'process_data',
        processing_type: 'prompt',
        prompt
    });
}

export async function loadJohtoData() {
    return await sendRequest({
        action: 'load_johto_data'
    });
}

export async function logout() {
    const response = await sendRequest({ action: 'logout' });
    
    if (response.status === 'success') {
        window.location.reload();
    }
    
    return response;
}