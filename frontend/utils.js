import Config from './config.js';

/**
 * Sends data to the server and returns the response
 * @param {Object} request_data - The data to send to the server
 * @param {string} content_type - The content type header
 * @returns {Promise<Object>} The response data
 */
export async function FetchData(request_data, content_type = 'application/json') {
    try {
        const response = await fetch(Config.host, {
            method: 'POST',
            headers: {
                'Content-Type': content_type
            },
            body: JSON.stringify(request_data)
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return {
            error: 'Failed to fetch user data'
        };
    }
}