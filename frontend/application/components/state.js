// Application state manager
const appState = {
    currentStructure: null,
    currentNode: null,
    activeTab: 'structures',      // 'structures', 'inputs', 'process', 'outputs'
    isProcessing: false,
    lastNotification: null,
    conversation: [],             // Store conversation messages directly
    currentProcessId: null        // Track current process ID
};

export default appState;