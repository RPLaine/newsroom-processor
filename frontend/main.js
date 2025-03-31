import AppContainer from './app-container/app-container.js';
import App from './app/app.js';
import Login from './login/login.js';
import { FetchData } from './utils.js';

document.addEventListener('DOMContentLoaded', initializeApp);

async function initializeApp() {
    console.log('Initializing application...');

    const appContainer = AppContainer.createAppContainer();

    const request_data = {
        action: 'application_init'
    };

    let data = await FetchData(request_data);

    if (data.userid) {
        data = await App.createApp(data, appContainer, FetchData);
    } else {
        data = await Login.createLogin(data, appContainer, FetchData);
    }
}

// async function FetchData(request_data, content_type = 'application/json') {
//     console.log('Fetching data...');
//     try {
//         const response = await fetch(Config.host, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': content_type
//             },
//             body: JSON.stringify(request_data)
//         });
//         console.log('Response status:', response.status);
//         const data = await response.json();
//         console.log('Response data:', data);
//         return data;
//     } catch (error) {
//         console.error('Error fetching data:', error);
//         return {
//             error: 'Failed to fetch user data'
//         };
//     }
// }