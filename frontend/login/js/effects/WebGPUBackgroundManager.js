/**
 * WebGPUBackgroundManager.js - Manages WebGPU background animation
 * Wraps the existing WebGPUBackground class for better integration
 * with the modular architecture
 */

export class WebGPUBackgroundManager {
    constructor() {
        this.backgroundAnimation = null;
    }

    /**
     * Initialize the WebGPU background animation
     * @param {string} canvasId - The ID of the canvas element to render on
     * @returns {Promise<boolean>} - Whether initialization was successful
     */
    async initialize(canvasId) {
        // Import the WebGPUBackground class
        // We're using dynamic import to maintain compatibility with browsers
        // that don't support WebGPU
        try {
            const WebGPUBackground = (await import('../../../webgpu-background.js')).default;
            this.backgroundAnimation = new WebGPUBackground();
            
            const success = await this.backgroundAnimation.init(canvasId);
            return success;
        } catch (error) {
            console.error('Failed to initialize WebGPU background:', error);
            return false;
        }
    }

    /**
     * Clean up resources used by the background animation
     */
    destroy() {
        if (this.backgroundAnimation) {
            this.backgroundAnimation.destroy();
            this.backgroundAnimation = null;
        }
    }
}