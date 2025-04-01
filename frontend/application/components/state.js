// Application state manager
const appState = {
    currentJob: null,
    activeTab: 'jobs',      // 'jobs', 'inputs', 'process', 'outputs'
    isProcessing: false,
    lastNotification: null
};

export default appState;