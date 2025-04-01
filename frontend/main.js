import AppContainer from './app-container/app-container.js';
import App from './application/app.js';
import Login from './login/login.js';
import { fetchData } from './utils.js';
import LoadingAnimation from './animation/loading-animation.js';

let data = {};
let loadingAnimation;

document.addEventListener('DOMContentLoaded', initializeApp);

async function initializeApp() {
    const appContainer = AppContainer.createAppContainer();
    
    // Initialize loading animation right at the start
    loadingAnimation = new LoadingAnimation({
        colors: ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#7B1FA2'],
        particleCount: 150,
        showText: true,
        text: 'Loading your structures...',
        showPercentage: false,
        speed: 1.2,
        pulseSpeed: 0.8
    });
    loadingAnimation.init();

    const request_data = {};

    data = await fetchData(request_data);
    console.log('data', data);

    if (data.userid == undefined) {
        console.log('Login required');
        data = await Login.createLogin(data, appContainer, fetchData);
    } else {
        console.log('Login successful');
        // Show loading animation as we start loading the application
        loadingAnimation.show();
        // Store the animation in window object for global access
        window.johtoLoadingAnimation = loadingAnimation;
        data = await App.createApp(data, appContainer, fetchData);
    }
}