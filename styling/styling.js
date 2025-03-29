fetch('/styling/theme.json')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(theme => {
        for (const [key, value] of Object.entries(theme)) {
            document.documentElement.style.setProperty(`--${key}`, value);
        }
    })
    .catch(error => console.error('Error fetching theme.json:', error));