// Immersive WebGPU background animation for GameGen2
// This creates a dynamic particle system animation that represents infinite storytelling possibilities

class WebGPUBackground {
    constructor() {
        console.log('🌌 WebGPUBackground: Creating instance');
        this.canvas = null;
        this.adapter = null;
        this.device = null;
        this.context = null;
        this.animationId = null;
        this.initialized = false;
        this.gpuTier = 'low'; // Default to low tier
        this.destinyPaths = []; // For destiny path particles
        this.destinyAnimationActive = false;
        this.cosmicResonanceActive = false; // For cosmic resonance effect
        console.log('🌌 WebGPUBackground: Instance created');
    }

    async init(canvasId) {
        console.log(`🌌 WebGPUBackground: Initializing with canvas ID: ${canvasId}`);
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error(`❌ WebGPUBackground: Canvas element with ID "${canvasId}" not found`);
            return false;
        }
        console.log(`✅ WebGPUBackground: Canvas found, dimensions: ${this.canvas.width}x${this.canvas.height}`);

        // Resize canvas to full screen
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        console.log('🔄 WebGPUBackground: Added resize listener');

        // Detect GPU capabilities
        await this.detectGPUCapabilities();
        console.log(`🎮 WebGPUBackground: GPU Tier detected: ${this.gpuTier}`);

        // Check if WebGPU is supported
        if (!navigator.gpu) {
            console.log("⚠️ WebGPUBackground: WebGPU not supported. Falling back to Canvas animation.");
            this.initCanvasFallback();
            return false;
        }

        try {
            // Request adapter and device
            console.log('🔍 WebGPUBackground: Requesting WebGPU adapter');
            this.adapter = await navigator.gpu.requestAdapter();
            if (!this.adapter) {
                console.log("⚠️ WebGPUBackground: Couldn't request WebGPU adapter. Falling back to Canvas animation.");
                this.initCanvasFallback();
                return false;
            }
            console.log('✅ WebGPUBackground: WebGPU adapter obtained');

            console.log('🔍 WebGPUBackground: Requesting WebGPU device');
            this.device = await this.adapter.requestDevice();
            console.log('✅ WebGPUBackground: WebGPU device obtained');
            
            this.context = this.canvas.getContext('webgpu');
            if (!this.context) {
                console.error('❌ WebGPUBackground: Failed to get WebGPU context');
                this.initCanvasFallback();
                return false;
            }
            console.log('✅ WebGPUBackground: WebGPU context obtained');
            
            const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
            console.log(`🎨 WebGPUBackground: Using preferred format: ${presentationFormat}`);
            
            this.context.configure({
                device: this.device,
                format: presentationFormat,
                alphaMode: 'premultiplied'
            });
            console.log('✅ WebGPUBackground: Context configured');

            // Set up the render pipeline and resources here
            // This is a simplified version for compatibility
            console.log('🎬 WebGPUBackground: Setup complete, starting animation');

            this.initialized = true;
            this.animate();
            
            // Add enhanced visual elements
            console.log('✨ WebGPUBackground: Adding visual elements');
            this.addProfoundElements();
            
            // Find register button and add destiny path
            console.log('🔍 WebGPUBackground: Setting up destiny path for register button');
            setTimeout(() => {
                const registerButton = document.querySelector('#register-form .auth-button');
                if (registerButton) {
                    console.log('✅ WebGPUBackground: Register button found, adding destiny path');
                    this.addDestinyPath(registerButton);
                } else {
                    console.warn('⚠️ WebGPUBackground: Register button not found, cannot add destiny path');
                }
            }, 1000); // Delay to ensure DOM is ready
            
            return true;
        } catch (error) {
            console.error("❌ WebGPUBackground: Initialization failed:", error);
            this.initCanvasFallback();
            return false;
        }
    }
    
    /**
     * Detect GPU capabilities to optimize visual effects
     */
    async detectGPUCapabilities() {
        console.log('🔍 WebGPUBackground: Detecting GPU capabilities');
        // Try to detect GPU capabilities to optimize effects
        if (navigator.gpu) {
            try {
                const adapter = await navigator.gpu.requestAdapter();
                if (adapter) {
                    const info = await adapter.requestAdapterInfo();
                    console.log('🎮 WebGPUBackground: Got adapter info:', info);
                    
                    // Check if we have a device name or vendor
                    if (info.device || info.vendor) {
                        // Use GPU info to determine tier
                        const deviceStr = (info.device || '').toLowerCase();
                        const vendorStr = (info.vendor || '').toLowerCase();
                        console.log(`🎮 WebGPUBackground: Device: ${deviceStr}, Vendor: ${vendorStr}`);
                        
                        // High-end GPUs typically have keywords like RTX, Radeon RX, etc.
                        const highEndKeywords = ['rtx', 'geforce', 'radeon rx', 'radeon pro', 'quadro'];
                        // Mid-range GPUs typically have keywords like GTX, Radeon, etc.
                        const midRangeKeywords = ['gtx', 'radeon', 'intel iris', 'adreno', 'mali-g'];
                        
                        // Check for high-end GPU
                        if (highEndKeywords.some(keyword => deviceStr.includes(keyword) || vendorStr.includes(keyword))) {
                            this.gpuTier = 'high';
                            console.log('🎮 WebGPUBackground: Detected high-end GPU');
                        }
                        // Check for mid-range GPU
                        else if (midRangeKeywords.some(keyword => deviceStr.includes(keyword) || vendorStr.includes(keyword))) {
                            this.gpuTier = 'medium';
                            console.log('🎮 WebGPUBackground: Detected medium-range GPU');
                        }
                        // Otherwise assume low-end
                        else {
                            this.gpuTier = 'low';
                            console.log('🎮 WebGPUBackground: Detected low-end GPU');
                        }
                    } else {
                        console.log('🎮 WebGPUBackground: No device/vendor info, using memory detection');
                        // Fallback detection based on device memory (if available)
                        if (navigator.deviceMemory) {
                            if (navigator.deviceMemory >= 8) {
                                this.gpuTier = 'high';
                                console.log(`🎮 WebGPUBackground: High tier based on memory: ${navigator.deviceMemory}GB`);
                            } else if (navigator.deviceMemory >= 4) {
                                this.gpuTier = 'medium';
                                console.log(`🎮 WebGPUBackground: Medium tier based on memory: ${navigator.deviceMemory}GB`);
                            } else {
                                this.gpuTier = 'low';
                                console.log(`🎮 WebGPUBackground: Low tier based on memory: ${navigator.deviceMemory}GB`);
                            }
                        }
                    }
                }
            } catch (e) {
                console.warn("⚠️ WebGPUBackground: GPU capability detection failed:", e);
                // Use hardware concurrency as a fallback
                const cores = navigator.hardwareConcurrency || 2;
                console.log(`🎮 WebGPUBackground: Falling back to CPU cores detection: ${cores} cores`);
                if (cores >= 8) {
                    this.gpuTier = 'high';
                    console.log('🎮 WebGPUBackground: High tier based on CPU cores');
                } else if (cores >= 4) {
                    this.gpuTier = 'medium';
                    console.log('🎮 WebGPUBackground: Medium tier based on CPU cores');
                }
            }
        } else {
            console.log('🎮 WebGPUBackground: WebGPU not available, using alternate metrics');
            // No WebGPU, try to use other metrics
            // Use devicePixelRatio as a hint about device capability
            console.log(`🎮 WebGPUBackground: Device pixel ratio: ${window.devicePixelRatio}`);
            if (window.devicePixelRatio >= 2) {
                // Higher pixel ratio often indicates better hardware
                const cores = navigator.hardwareConcurrency || 2;
                if (cores >= 4) {
                    this.gpuTier = 'medium';
                    console.log('🎮 WebGPUBackground: Medium tier based on pixel ratio and cores');
                }
            }
        }
        
        // Set animation complexity based on detected tier
        this.setAnimationComplexity();
    }

    /**
     * Configure animation complexity based on GPU tier
     */
    setAnimationComplexity() {
        console.log(`🎨 WebGPUBackground: Setting animation complexity for ${this.gpuTier} tier`);
        switch(this.gpuTier) {
            case 'high':
                this.particleCount = 150;
                this.connectDistance = 120;
                this.particleSpeed = 1.0;
                this.useGlow = true;
                this.useBlur = true;
                this.useCosmicResonance = true; // New cosmic effect for high-end GPUs
                break;
            case 'medium':
                this.particleCount = 100;
                this.connectDistance = 100;
                this.particleSpeed = 0.8;
                this.useGlow = true;
                this.useBlur = false;
                this.useCosmicResonance = false;
                break;
            case 'low':
            default:
                this.particleCount = 50;
                this.connectDistance = 80;
                this.particleSpeed = 0.6;
                this.useGlow = false;
                this.useBlur = false;
                this.useCosmicResonance = false;
                break;
        }
        console.log(`🎨 WebGPUBackground: Animation settings - particles: ${this.particleCount}, speed: ${this.particleSpeed}`);
    }

    initCanvasFallback() {
        console.log('🎨 WebGPUBackground: Initializing Canvas fallback mode');
        // Fallback to Canvas 2D animation for browsers without WebGPU support
        const ctx = this.canvas.getContext('2d');
        if (!ctx) {
            console.error('❌ WebGPUBackground: Failed to get 2D canvas context');
            return;
        }
        console.log('✅ WebGPUBackground: 2D canvas context obtained');

        // Particles for the animation
        const particles = [];
        
        // Use count based on detected GPU tier
        console.log(`🎨 WebGPUBackground: Creating ${this.particleCount} particles`);
        for (let i = 0; i < this.particleCount; i++) {
            particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 3 + 1,
                color: ['#ffcc00', '#ff9900', '#4b6584', '#3c526d', '#ffaa00'][Math.floor(Math.random() * 5)],
                velocity: {
                    x: (Math.random() - 0.5) * this.particleSpeed * 1.5,
                    y: (Math.random() - 0.5) * this.particleSpeed * 1.5
                }
            });
        }

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw radial gradient background
            const gradient = ctx.createRadialGradient(
                this.canvas.width / 2, 
                this.canvas.height / 2, 
                0, 
                this.canvas.width / 2, 
                this.canvas.height / 2, 
                this.canvas.width
            );
            gradient.addColorStop(0, '#1a1a1a');
            gradient.addColorStop(1, '#0a0a0a');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Update and draw particles
            for (const particle of particles) {
                // Move particles
                particle.x += particle.velocity.x;
                particle.y += particle.velocity.y;

                // Wrap around edges
                if (particle.x < 0) particle.x = this.canvas.width;
                if (particle.x > this.canvas.width) particle.x = 0;
                if (particle.y < 0) particle.y = this.canvas.height;
                if (particle.y > this.canvas.height) particle.y = 0;

                // Draw particle
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                ctx.fillStyle = particle.color;
                ctx.fill();
                
                // Add glow for medium/high GPU tiers
                if (this.useGlow) {
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.radius * 2, 0, Math.PI * 2);
                    const glow = ctx.createRadialGradient(
                        particle.x, particle.y, particle.radius * 0.5,
                        particle.x, particle.y, particle.radius * 3
                    );
                    glow.addColorStop(0, particle.color.replace(')', ', 0.3)').replace('#', 'rgba('));
                    glow.addColorStop(1, particle.color.replace(')', ', 0)').replace('#', 'rgba('));
                    ctx.fillStyle = glow;
                    ctx.fill();
                }
            }

            // Draw connecting lines between nearby particles
            ctx.strokeStyle = 'rgba(255, 204, 0, 0.1)';
            ctx.lineWidth = 0.5;
            
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < this.connectDistance) {
                        // Adjust opacity based on distance
                        const opacity = 0.1 * (1 - distance / this.connectDistance);
                        ctx.strokeStyle = `rgba(255, 204, 0, ${opacity})`;
                        
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            this.animationId = requestAnimationFrame(animate);
        };

        animate();
        console.log('✅ WebGPUBackground: Canvas fallback animation started');
        
        // Add profound visual elements for enhanced UX
        console.log('✨ WebGPUBackground: Adding visual elements to fallback mode');
        this.addProfoundElements();
        
        // Find register button and add destiny path
        console.log('🔍 WebGPUBackground: Setting up destiny path for register button in fallback mode');
        setTimeout(() => {
            const registerForm = document.getElementById('register-form');
            const registerButton = registerForm?.querySelector('.auth-button');
            if (registerButton) {
                console.log('✅ WebGPUBackground: Register button found in fallback, adding destiny path');
                this.addDestinyPath(registerButton);
                
                // Add event listener to create destiny path when register tab is clicked
                const registerTab = document.getElementById('register-tab');
                if (registerTab) {
                    registerTab.addEventListener('click', () => {
                        console.log('👆 WebGPUBackground: Register tab clicked, refreshing destiny path');
                        setTimeout(() => this.addDestinyPath(registerButton), 500);
                    });
                }
            } else {
                console.warn('⚠️ WebGPUBackground: Register button not found in fallback mode');
            }
        }, 2000);
    }

    resizeCanvas() {
        if (!this.canvas) return;
        
        const oldWidth = this.canvas.width;
        const oldHeight = this.canvas.height;
        
        // Make canvas full screen
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        console.log(`📐 WebGPUBackground: Canvas resized from ${oldWidth}x${oldHeight} to ${this.canvas.width}x${this.canvas.height}`);
    }

    animate() {
        if (!this.initialized) {
            console.warn('⚠️ WebGPUBackground: Tried to animate before initialization');
            return;
        }
        
        // WebGPU animation would go here
        // For simplicity, we're using the Canvas fallback for most browsers
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    destroy() {
        console.log('🧹 WebGPUBackground: Cleaning up resources');
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            console.log('🛑 WebGPUBackground: Animation stopped');
        }
    }
    
    /**
     * Add profound visual elements to enhance the user experience
     * based on the user's GPU capabilities
     */
    addProfoundElements() {
        // Get the canvas context for drawing
        const ctx = this.canvas.getContext('2d');
        if (!ctx) return;
        
        // Create the glowing aura that suggests destiny and importance
        if (this.gpuTier !== 'low') {
            this.createGlowingAuras(ctx);
        }
        
        // Add subtle perspective shifting effect for medium/high tier GPUs
        if (this.gpuTier !== 'low') {
            this.addPerspectiveEffect();
        }
        
        // Listen for form tab changes to add visual emphasis
        const loginTab = document.getElementById('login-tab');
        const registerTab = document.getElementById('register-tab');
        
        if (loginTab && registerTab) {
            registerTab.addEventListener('click', () => {
                this.emphasizeRegisterForm();
            });
        }
        
        // Add mouse trail particles for high-end GPUs
        if (this.gpuTier === 'high') {
            this.addMouseTrailEffect();
        }
        
        // Add floating inspirational quotes for medium/high GPUs
        if (this.gpuTier !== 'low') {
            this.addInspirationMessages();
        }
        
        // Add cosmic resonance effect for high-end GPUs
        if (this.gpuTier === 'high' && this.useCosmicResonance) {
            this.addCosmicResonanceEffect();
        }
        
        // Add time-slowing effect on button hover
        this.addTimeSlowingEffect();
    }
    
    /**
     * Create glowing auras in the background that suggest infinity and possibility
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    createGlowingAuras(ctx) {
        // Only proceed if we have a valid context
        if (!ctx) return;
        
        // Create 3 subtle auras at strategic positions
        const auraPositions = [
            // Center-right aura (destiny)
            {
                x: this.canvas.width * 0.7,
                y: this.canvas.height * 0.4,
                radius: Math.min(this.canvas.width, this.canvas.height) * 0.3,
                color: 'rgba(255, 204, 0, 0.03)'
            },
            // Bottom-left aura (grounding)
            {
                x: this.canvas.width * 0.2,
                y: this.canvas.height * 0.8,
                radius: Math.min(this.canvas.width, this.canvas.height) * 0.25,
                color: 'rgba(75, 101, 132, 0.04)'
            },
            // Top-center aura (aspiration)
            {
                x: this.canvas.width * 0.5,
                y: this.canvas.height * 0.15,
                radius: Math.min(this.canvas.width, this.canvas.height) * 0.2,
                color: 'rgba(255, 147, 0, 0.02)'
            }
        ];
        
        // Draw each aura
        for (const aura of auraPositions) {
            const gradient = ctx.createRadialGradient(
                aura.x, aura.y, 0,
                aura.x, aura.y, aura.radius
            );
            
            gradient.addColorStop(0, aura.color.replace(')', ', 0.15)').replace('rgba', 'rgba'));
            gradient.addColorStop(0.7, aura.color);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(aura.x, aura.y, aura.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    /**
     * Add subtle perspective effect that responds to mouse movement
     * Creating a sense of depth and immersion
     */
    addPerspectiveEffect() {
        // Only for medium and high GPU tiers
        if (this.gpuTier === 'low') return;
        
        // Get container elements
        const container = document.querySelector('.storytelling-container');
        const authForm = document.querySelector('.auth-form-container');
        
        if (!container || !authForm) return;
        
        // Add subtle transform on mouse move
        document.addEventListener('mousemove', (e) => {
            // Calculate mouse position relative to center
            const mouseX = e.clientX / window.innerWidth - 0.5;
            const mouseY = e.clientY / window.innerHeight - 0.5;
            
            // Apply subtle transform to auth container (more pronounced for high-end GPUs)
            const rotateIntensity = this.gpuTier === 'high' ? 1.5 : 1;
            
            // Apply transform with a subtle ease for smoothness
            authForm.style.transition = 'transform 0.2s ease-out';
            authForm.style.transform = `
                perspective(1200px) 
                rotateY(${mouseX * 2 * rotateIntensity}deg) 
                rotateX(${-mouseY * 2 * rotateIntensity}deg)
                translateZ(10px)
            `;
            
            // Subtle parallax effect on background
            if (container) {
                container.style.backgroundPosition = `
                    ${50 + mouseX * 5}% ${50 + mouseY * 5}%`
                ;
            }
        });
    }
    
    /**
     * Add visual emphasis to the register form to highlight
     * it as the path to creative destiny
     */
    emphasizeRegisterForm() {
        // Only for medium and high GPU tiers
        if (this.gpuTier === 'low') return;
        
        const registerForm = document.getElementById('register-form');
        const registerButton = registerForm?.querySelector('.auth-button');
        
        if (!registerButton) return;
        
        // Create a temporary highlight effect around the registration button
        const highlight = document.createElement('div');
        highlight.style.position = 'absolute';
        highlight.style.top = '-10px';
        highlight.style.left = '-10px';
        highlight.style.right = '-10px';
        highlight.style.bottom = '-10px';
        highlight.style.borderRadius = 'var(--radius-sm)';
        highlight.style.background = 'radial-gradient(circle, rgba(255,204,0,0.1) 0%, rgba(255,153,0,0) 70%)';
        highlight.style.pointerEvents = 'none';
        highlight.style.opacity = '0';
        highlight.style.transition = 'opacity 1s ease';
        
        // Append to button parent with relative positioning
        registerButton.style.position = 'relative';
        registerButton.appendChild(highlight);
        
        // Animate in
        setTimeout(() => {
            highlight.style.opacity = '1';
        }, 100);
        
        // Add destiny path to the button
        this.addDestinyPath(registerButton);
        
        // Remove after animation completes
        setTimeout(() => {
            highlight.style.opacity = '0';
            setTimeout(() => {
                if (highlight.parentNode) {
                    highlight.parentNode.removeChild(highlight);
                }
            }, 1000);
        }, 3000);
    }
    
    /**
     * Add mouse trail effect for high-end GPUs
     * Creates an interactive, flowing experience
     */
    addMouseTrailEffect() {
        // Only for high tier GPUs
        if (this.gpuTier !== 'high') return;
        
        const ctx = this.canvas.getContext('2d');
        if (!ctx) return;
        
        // Mouse trail particles
        const trail = [];
        const maxTrailLength = 15;
        let mouseX = 0;
        let mouseY = 0;
        let isMouseMoving = false;
        
        // Update mouse position
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            isMouseMoving = true;
            
            // Add particle to trail
            if (trail.length < maxTrailLength) {
                trail.push({
                    x: mouseX,
                    y: mouseY,
                    size: Math.random() * 3 + 1,
                    life: 1,
                    color: 'rgba(255, 204, 0, 0.6)'
                });
            }
        });
        
        // Animation loop for trail
        const animateTrail = () => {
            // Only draw trail when mouse is moving
            if (isMouseMoving) {
                // Add new particle at mouse position
                if (trail.length < maxTrailLength && Math.random() > 0.3) {
                    trail.push({
                        x: mouseX,
                        y: mouseY,
                        size: Math.random() * 3 + 1,
                        life: 1,
                        color: 'rgba(255, 204, 0, 0.6)'
                    });
                }
                
                isMouseMoving = false;
            }
            
            // Update and draw trail particles
            for (let i = 0; i < trail.length; i++) {
                const particle = trail[i];
                
                // Reduce life
                particle.life -= 0.05;
                
                if (particle.life <= 0) {
                    // Remove dead particles
                    trail.splice(i, 1);
                    i--;
                    continue;
                }
                
                // Draw particle with fading opacity
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = particle.color.replace('0.6', particle.life.toFixed(2));
                ctx.fill();
            }
            
            requestAnimationFrame(animateTrail);
        };
        
        animateTrail();
    }
    
    /**
     * Add a destiny path animation that guides the user's eye
     * to the registration button, emphasizing its importance
     * @param {HTMLElement} button - The button to highlight
     */
    addDestinyPath(button) {
        if (!button || this.destinyAnimationActive) return;
        this.destinyAnimationActive = true;
        
        const ctx = this.canvas.getContext('2d');
        if (!ctx) return;
        
        // Create cosmic nodes at strategic positions
        const cosmicNodes = [];
        const nodeCount = 5;
        
        // Create nodes in a pentagonal pattern
        for (let i = 0; i < nodeCount; i++) {
            const angle = (Math.PI * 2 * i) / nodeCount - Math.PI / 2;
            const distance = Math.min(this.canvas.width, this.canvas.height) * 0.4;
            
            cosmicNodes.push({
                x: this.canvas.width / 2 + Math.cos(angle) * distance,
                y: this.canvas.height / 2 + Math.sin(angle) * distance,
                pulsePhase: Math.random() * Math.PI * 2,
                pulseSpeed: 0.02 + Math.random() * 0.02,
                size: Math.min(this.canvas.width, this.canvas.height) * (0.05 + Math.random() * 0.03)
            });
        }
        
        // Animate cosmic resonance
        const animateCosmicResonance = () => {
            if (!this.cosmicResonanceActive) return;
            
            for (const node of cosmicNodes) {
                // Update pulse phase
                node.pulsePhase += node.pulseSpeed;
                if (node.pulsePhase > Math.PI * 2) {
                    node.pulsePhase -= Math.PI * 2;
                }
                
                // Calculate pulse intensity (0-1)
                const pulseIntensity = (Math.sin(node.pulsePhase) + 1) * 0.5;
                
                // Draw pulsating cosmic node
                const gradient = ctx.createRadialGradient(
                    node.x, node.y, 0,
                    node.x, node.y, node.size * (0.8 + pulseIntensity * 0.4)
                );
                
                // Color based on position in the pattern
                const hue = (cosmicNodes.indexOf(node) / nodeCount) * 30 + 40; // Gold to orange hues
                gradient.addColorStop(0, `hsla(${hue}, 80%, 60%, ${0.1 + pulseIntensity * 0.1})`);
                gradient.addColorStop(0.5, `hsla(${hue}, 90%, 50%, ${0.05 + pulseIntensity * 0.05})`);
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.size * (0.8 + pulseIntensity * 0.4), 0, Math.PI * 2);
                ctx.fill();
                
                // Draw connections between nodes
                for (const otherNode of cosmicNodes) {
                    if (otherNode === node) continue;
                    
                    // Calculate opacity based on pulse phases of both nodes
                    const otherPulseIntensity = (Math.sin(otherNode.pulsePhase) + 1) * 0.5;
                    const connectionOpacity = 0.03 + (pulseIntensity * otherPulseIntensity) * 0.05;
                    
                    // Draw connecting line
                    ctx.beginPath();
                    ctx.moveTo(node.x, node.y);
                    ctx.lineTo(otherNode.x, otherNode.y);
                    ctx.strokeStyle = `rgba(255, 204, 0, ${connectionOpacity})`;
                    ctx.lineWidth = 1 + pulseIntensity * otherPulseIntensity;
                    ctx.stroke();
                }
            }
            
            requestAnimationFrame(animateCosmicResonance);
        };
        
        // Start the animation
        animateCosmicResonance();
    }
    
    /**
     * Add inspirational messages that periodically fade in and out
     * to reinforce the significance of the creative journey
     */
    addInspirationMessages() {
        // Inspirational quotes about creativity and storytelling
        const inspirationalMessages = [
            "Your story begins now",
            "Create worlds never seen before",
            "Every great journey begins with a single step",
            "Unleash your creative potential",
            "Your imagination knows no bounds",
            "The universe awaits your stories"
        ];
        
        // Create container for messages
        const messageContainer = document.createElement('div');
        messageContainer.style.position = 'absolute';
        messageContainer.style.width = '100%';
        messageContainer.style.height = '100%';
        messageContainer.style.pointerEvents = 'none';
        messageContainer.style.overflow = 'hidden';
        messageContainer.style.zIndex = '1';
        
        document.body.appendChild(messageContainer);
        
        // Function to display a random message
        const showRandomMessage = () => {
            // Select random message
            const message = inspirationalMessages[Math.floor(Math.random() * inspirationalMessages.length)];
            
            // Create message element
            const messageElement = document.createElement('div');
            messageElement.textContent = message;
            messageElement.style.position = 'absolute';
            messageElement.style.color = 'rgba(255, 204, 0, 0)';
            messageElement.style.fontFamily = 'var(--font-heading, "Montserrat", sans-serif)';
            messageElement.style.fontSize = 'clamp(1rem, 2vw, 1.5rem)';
            messageElement.style.fontWeight = '300';
            messageElement.style.letterSpacing = '0.15em';
            messageElement.style.textShadow = '0 0 10px rgba(255, 204, 0, 0.5)';
            messageElement.style.transition = 'opacity 3s ease-in-out, transform 3s ease-in-out';
            messageElement.style.opacity = '0';
            messageElement.style.userSelect = 'none';
            
            // Random position (avoiding corners)
            messageElement.style.left = `${20 + Math.random() * 60}%`;
            messageElement.style.top = `${20 + Math.random() * 60}%`;
            messageElement.style.transform = 'translateY(20px)';
            
            // Add to container
            messageContainer.appendChild(messageElement);
            
            // Animate in
            setTimeout(() => {
                messageElement.style.opacity = '0.7';
                messageElement.style.color = 'rgba(255, 204, 0, 0.7)';
                messageElement.style.transform = 'translateY(0)';
            }, 100);
            
            // Animate out after delay
            setTimeout(() => {
                messageElement.style.opacity = '0';
                messageElement.style.transform = 'translateY(-20px)';
                
                // Remove element after transition
                setTimeout(() => {
                    if (messageElement.parentNode) {
                        messageElement.parentNode.removeChild(messageElement);
                    }
                }, 3100);
            }, 5000);
        };
        
        // Show first message after a delay
        setTimeout(() => {
            showRandomMessage();
            
            // Show new message periodically
            setInterval(() => {
                showRandomMessage();
            }, 10000); // New message every 10 seconds
        }, 3000);
    }
    
    /**
     * Add a time-slowing effect when hovering over the register button
     * to emphasize the momentousness of the decision
     */
    addTimeSlowingEffect() {
        // Find register button
        const setupForButton = (buttonSelector, formID) => {
            setTimeout(() => {
                const form = document.getElementById(formID);
                const button = form?.querySelector(buttonSelector);
                
                if (!button) return;
                
                // Create ripple container
                const rippleContainer = document.createElement('div');
                rippleContainer.style.position = 'absolute';
                rippleContainer.style.top = '0';
                rippleContainer.style.left = '0';
                rippleContainer.style.width = '100%';
                rippleContainer.style.height = '100%';
                rippleContainer.style.overflow = 'hidden';
                rippleContainer.style.pointerEvents = 'none';
                rippleContainer.style.zIndex = '0';
                rippleContainer.style.opacity = '0';
                rippleContainer.style.transition = 'opacity 0.5s ease-out';
                rippleContainer.classList.add('time-ripple-container');
                
                // Position button relative to contain ripple
                button.style.position = 'relative';
                button.appendChild(rippleContainer);
                
                // Slow time effect on hover
                button.addEventListener('mouseenter', () => {
                    // Show ripple
                    rippleContainer.style.opacity = '1';
                    
                    // Create ripple effect
                    this.createTimeRipple(rippleContainer);
                    
                    // Slow down particles if on high-end GPU
                    if (this.gpuTier === 'high') {
                        document.documentElement.style.setProperty('--time-dilation', '0.5');
                        
                        // Add subtle glow to button
                        button.style.boxShadow = '0 0 15px rgba(255, 204, 0, 0.3)';
                        button.style.transition = 'all 0.5s ease-out';
                    }
                });
                
                // Return to normal on leave
                button.addEventListener('mouseleave', () => {
                    // Hide ripple
                    rippleContainer.style.opacity = '0';
                    
                    // Reset time dilation
                    document.documentElement.style.setProperty('--time-dilation', '1');
                    
                    // Remove glow
                    button.style.boxShadow = '';
                });
                
                // Add focus effect similar to hover
                button.addEventListener('focus', () => {
                    // Show ripple
                    rippleContainer.style.opacity = '1';
                    
                    // Create ripple effect
                    this.createTimeRipple(rippleContainer);
                });
                
                button.addEventListener('blur', () => {
                    // Hide ripple
                    rippleContainer.style.opacity = '0';
                });
            }, 1500); // Delay to ensure DOM is ready
        };
        
        // Setup for both register and login buttons
        setupForButton('.auth-button', 'register-form');
        setupForButton('.auth-button', 'login-form');
        
        // Add a CSS variable for time dilation (used in animation speeds)
        document.documentElement.style.setProperty('--time-dilation', '1');
    }
    
    /**
     * Create a time ripple effect in the provided container
     * @param {HTMLElement} container - The container for the ripple effect
     */
    createTimeRipple(container) {
        if (!container) return;
        
        // Create ripple
        const ripple = document.createElement('div');
        ripple.style.position = 'absolute';
        ripple.style.top = '50%';
        ripple.style.left = '50%';
        ripple.style.transform = 'translate(-50%, -50%)';
        ripple.style.width = '10px';
        ripple.style.height = '10px';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'radial-gradient(circle, rgba(255,204,0,0.3) 0%, rgba(255,204,0,0) 70%)';
        ripple.style.pointerEvents = 'none';
        ripple.style.opacity = '0.8';
        
        // Add to container
        container.appendChild(ripple);
        
        // Animate ripple
        let size = 10;
        const maxSize = Math.max(container.offsetWidth, container.offsetHeight) * 3;
        const growSpeed = this.gpuTier === 'high' ? 3 : 1.5;
        
        const animateRipple = () => {
            size += growSpeed;
            ripple.style.width = `${size}px`;
            ripple.style.height = `${size}px`;
            ripple.style.opacity = 1 - (size / maxSize);
            
            if (size < maxSize && container.style.opacity !== '0') {
                requestAnimationFrame(animateRipple);
            } else {
                // Remove ripple when done
                if (ripple.parentNode) {
                    ripple.parentNode.removeChild(ripple);
                }
            }
        };
        
        animateRipple();
    }
}

// Export the class as the default export
console.log('📦 WebGPUBackground: Exporting module');
export default WebGPUBackground;