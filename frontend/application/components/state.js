const appState = {
    currentStructure: null,
    currentNode: null,
    nextNodeID: null,
    activeTab: 'structures',
    isProcessing: false,
    jobs: [],
    nodeTypes: ['start', 'process'],
    workflowState: null,
    generatedFiles: []
};

export default appState;