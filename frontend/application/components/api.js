export async function sendRequest(requestData) {
    console.log('[API] Sending request:', requestData);
    try {
        const response = await fetch('/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(requestData)
        });

        console.log('[API] Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const jsonResponse = await response.json();
        console.log('[API] Response data:', jsonResponse);
        return jsonResponse;
    } catch (error) {
        console.error('[API] Request error:', error);
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

export async function loadJohtoData() {
    return await sendRequest({
        action: 'load_johto_data'
    });
}

export async function startProcess(structureData) {
    console.log('[API] Starting process with structure data:', structureData);
    const response = await sendRequest({
        action: 'start_process',
        structure_data: structureData
    });
    console.log('[API] Start process response:', response);
    return response;
}

export async function logout() {
    const response = await sendRequest({ action: 'logout' });
    
    if (response.status === 'success') {
        window.location.reload();
    }
    
    return response;
}