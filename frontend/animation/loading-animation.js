/**
 * Galaxy Particle Loading Animation
 * A beautiful, dynamic loading animation that creates a swirling galaxy of particles
 * to entertain users while content loads.
 */

class LoadingAnimation {
    constructor(options = {}) {
        this.options = {
            containerId: options.containerId || 'loading-animation-container',
            particleCount: options.particleCount || 100,
            maxRadius: options.maxRadius || 150,
            minRadius: options.minRadius || 30,
            particleSize: options.particleSize || { min: 1, max: 4 },
            colors: options.colors || ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#7B1FA2', '#00ACC1'],
            showText: options.showText !== undefined ? options.showText : true,
            text: options.text || 'Loading',
            showPercentage: options.showPercentage !== undefined ? options.showPercentage : false,
            speed: options.speed || 1,
            pulseSpeed: options.pulseSpeed || 0.5
        };
        
        this.container = null;
        this.canvas = null;
        this.ctx = null;
        this.textElement = null;
        this.percentageElement = null;
        this.particles = [];
        this.animationFrame = null;
        this.isActive = false;
        this.percentage = 0;
    }

    /**
     * Initialize the animation and create the necessary DOM elements
     */
    init() {
        // Create container if it doesn't exist
        this.container = document.getElementById(this.options.containerId);
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = this.options.containerId;
            document.body.appendChild(this.container);
        }

        // Style the container
        Object.assign(this.container.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: '9999',
            opacity: '0',
            transition: 'opacity 0.5s ease',
            pointerEvents: 'none'
        });

        // Create canvas
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);

        // Style canvas
        Object.assign(this.canvas.style, {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
        });

        // Create text element if needed
        if (this.options.showText) {
            this.textElement = document.createElement('div');
            this.textElement.textContent = this.options.text;
            this.container.appendChild(this.textElement);
            
            // Style text
            Object.assign(this.textElement.style, {
                color: 'white',
                fontFamily: 'sans-serif',
                fontSize: '24px',
                marginTop: '200px',
                textAlign: 'center',
                textShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
                transition: 'opacity 0.3s ease',
                opacity: '0'
            });
        }

        // Create percentage element if needed
        if (this.options.showPercentage) {
            this.percentageElement = document.createElement('div');
            this.percentageElement.textContent = '0%';
            this.container.appendChild(this.percentageElement);
            
            // Style percentage
            Object.assign(this.percentageElement.style, {
                color: 'white',
                fontFamily: 'sans-serif',
                fontSize: '18px',
                marginTop: '10px',
                textAlign: 'center',
                opacity: '0',
                transition: 'opacity 0.3s ease'
            });
        }

        // Initialize particles
        this.createParticles();
        
        // Set up resize handler
        window.addEventListener('resize', this.handleResize.bind(this));
        this.handleResize();
    }

    /**
     * Create the particle system
     */
    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.options.particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = this.options.minRadius + Math.random() * (this.options.maxRadius - this.options.minRadius);
            const size = this.options.particleSize.min + Math.random() * (this.options.particleSize.max - this.options.particleSize.min);
            const color = this.options.colors[Math.floor(Math.random() * this.options.colors.length)];
            const speed = (0.5 + Math.random()) * 0.001 * this.options.speed;
            const opacity = 0.3 + Math.random() * 0.7;
            
            this.particles.push({
                x: 0,
                y: 0,
                angle,
                radius,
                size,
                color,
                speed,
                opacity,
                pulse: 0,
                pulseSpeed: (0.5 + Math.random()) * 0.01 * this.options.pulseSpeed
            });
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        const { innerWidth, innerHeight } = window;
        this.canvas.width = innerWidth;
        this.canvas.height = innerHeight;
    }

    /**
     * Show the loading animation
     */
    show() {
        if (this.isActive) return;
        this.isActive = true;
        
        this.container.style.opacity = '1';
        this.container.style.pointerEvents = 'all';
        
        if (this.textElement) {
            setTimeout(() => {
                this.textElement.style.opacity = '1';
            }, 300);
        }
        
        if (this.percentageElement) {
            setTimeout(() => {
                this.percentageElement.style.opacity = '1';
            }, 400);
        }
        
        this.animate();
    }

    /**
     * Hide the loading animation
     */
    hide() {
        if (!this.isActive) return;
        this.isActive = false;
        
        if (this.textElement) {
            this.textElement.style.opacity = '0';
        }
        
        if (this.percentageElement) {
            this.percentageElement.style.opacity = '0';
        }
        
        setTimeout(() => {
            this.container.style.opacity = '0';
            this.container.style.pointerEvents = 'none';
            
            // Cancel animation after fade out
            setTimeout(() => {
                if (this.animationFrame) {
                    cancelAnimationFrame(this.animationFrame);
                    this.animationFrame = null;
                }
            }, 500);
        }, 200);
    }

    /**
     * Update the loading percentage
     * @param {number} percent - Percentage complete (0-100)
     */
    updateProgress(percent) {
        this.percentage = Math.min(Math.max(0, percent), 100);
        if (this.percentageElement) {
            this.percentageElement.textContent = `${Math.round(this.percentage)}%`;
        }
    }

    /**
     * Animate the particles
     */
    animate() {
        if (!this.isActive) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw particles
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Global pulse effect
        const globalPulse = Math.sin(Date.now() * 0.001) * 0.2 + 0.8;
        
        this.particles.forEach(particle => {
            // Update position
            particle.angle += particle.speed;
            particle.pulse += particle.pulseSpeed;
            
            // Calculate pulse multiplier
            const pulseFactor = (Math.sin(particle.pulse) * 0.2 + 0.8) * globalPulse;
            
            // Calculate position
            const x = centerX + Math.cos(particle.angle) * particle.radius * pulseFactor;
            const y = centerY + Math.sin(particle.angle) * particle.radius * pulseFactor;
            
            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(x, y, particle.size * pulseFactor, 0, Math.PI * 2);
            this.ctx.closePath();
            
            this.ctx.fillStyle = this.hexToRgba(particle.color, particle.opacity * pulseFactor);
            this.ctx.fill();
            
            // Add glow effect
            this.ctx.beginPath();
            this.ctx.arc(x, y, particle.size * 2 * pulseFactor, 0, Math.PI * 2);
            this.ctx.closePath();
            
            const gradient = this.ctx.createRadialGradient(
                x, y, particle.size * pulseFactor,
                x, y, particle.size * 2 * pulseFactor
            );
            gradient.addColorStop(0, this.hexToRgba(particle.color, 0.3 * pulseFactor));
            gradient.addColorStop(1, this.hexToRgba(particle.color, 0));
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
        });
        
        this.animationFrame = requestAnimationFrame(this.animate.bind(this));
    }

    /**
     * Convert hex color to rgba
     */
    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
}

// Export the LoadingAnimation class
export default LoadingAnimation;

// Usage example:
/*
import LoadingAnimation from './animation/loading-animation.js';

// Create and initialize the animation
const loadingAnimation = new LoadingAnimation({
    colors: ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#7B1FA2'], // Custom colors
    particleCount: 150,                                              // More particles
    showText: true,                                                  // Show loading text
    text: 'Loading your experience...',                              // Custom text
    showPercentage: true                                             // Show percentage
});

loadingAnimation.init();

// Show the animation when loading starts
loadingAnimation.show();

// Update progress (if using percentage)
loadingAnimation.updateProgress(50);

// Hide the animation when loading completes
loadingAnimation.hide();
*/