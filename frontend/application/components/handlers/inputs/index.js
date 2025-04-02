// Re-export everything from the inputs handlers
import { setupInputsTabHandlers } from './setup.js';
import { updateStructureInfo } from './structure.js';
import { updateInputsList, getInputTypeLabel } from './inputs.js';
import { selectNode, updateSelectedNodeInfo } from './node.js';

export {
    setupInputsTabHandlers,
    updateStructureInfo,
    updateInputsList,
    getInputTypeLabel,
    selectNode,
    updateSelectedNodeInfo
};