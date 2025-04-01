export async function fetchData(requestData) {
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
            throw new Error(`Server responded with status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        return {
            status: 'error',
            message: error.message || 'Failed to connect to server'
        };
    }
}

export function formatDate(date, options = {}) {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) {
        return 'Invalid date';
    }
    
    const {
        includeTime = true,
        shortFormat = false
    } = options;
    
    const dateOptions = {
        year: 'numeric',
        month: shortFormat ? 'numeric' : 'long',
        day: 'numeric'
    };
    
    if (includeTime) {
        dateOptions.hour = '2-digit';
        dateOptions.minute = '2-digit';
    }
}