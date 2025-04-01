class WebGPUBackground {
    constructor() {
        this.canvas = null;
        this.adapter = null;
        this.device = null;
        this.context = null;
        this.animationId = null;
        this.initialized = false;
        this.gpuTier = 'low';
        this.destinyPaths = [];
        this.destinyAnimationActive = false;
        this.cosmicResonanceActive = false;
    }

    async init(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            return false;
        }

        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        await this.detectGPUCapabilities();

        if (!navigator.gpu) {
            this.initCanvasFallback();
            return false;
        }

        try {
            this.adapter = await navigator.gpu.requestAdapter();
            if (!this.adapter) {
                this.initCanvasFallback();
                return false;
            }

            this.device = await this.adapter.requestDevice();
            
            this.context = this.canvas.getContext('webgpu');
            if (!this.context) {
                this.initCanvasFallback();
                return false;
            }
            
            const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
            
            this.context.configure({
                device: this.device,
                format: presentationFormat,
                alphaMode: 'premultiplied'
            });

            this.initialized = true;
            this.animate();
            
            this.addProfoundElements();
            
            setTimeout(() => {
                const registerForm = document.getElementById('register-form');
                const registerButton = registerForm?.querySelector('.auth-button');
                if (registerButton) {
                    this.addDestinyPath(registerButton);
                }
            }, 1000);
            
            return true;
        } catch (error) {
            console.error('WebGPU initialization error:', error);
            this.initCanvasFallback();
            return false;
        }
    }

    async detectGPUCapabilities() {
        if (navigator.gpu) {
            try {
                const adapter = await navigator.gpu.requestAdapter();
                if (adapter) {
                    const info = await adapter.requestAdapterInfo();
                    
                    if (info.device || info.vendor) {
                        const deviceStr = (info.device || '').toLowerCase();
                        const vendorStr = (info.vendor || '').toLowerCase();
                        
                        const highEndKeywords = ['rtx', 'geforce', 'radeon rx', 'radeon pro', 'quadro'];
                        const midRangeKeywords = ['gtx', 'radeon', 'intel iris', 'adreno', 'mali-g'];
                        
                        if (highEndKeywords.some(keyword => deviceStr.includes(keyword) || vendorStr.includes(keyword))) {
                            this.gpuTier = 'high';
                        }
                        else if (midRangeKeywords.some(keyword => deviceStr.includes(keyword) || vendorStr.includes(keyword))) {
                            this.gpuTier = 'medium';
                        }
                        else {
                            this.gpuTier = 'low';
                        }
                    } else {
                        if (navigator.deviceMemory) {
                            if (navigator.deviceMemory >= 8) {
                                this.gpuTier = 'high';
                            } else if (navigator.deviceMemory >= 4) {
                                this.gpuTier = 'medium';
                            } else {
                                this.gpuTier = 'low';
                            }
                        }
                    }
                }
            } catch (e) {
                const cores = navigator.hardwareConcurrency || 2;
                if (cores >= 8) {
                    this.gpuTier = 'high';
                } else if (cores >= 4) {
                    this.gpuTier = 'medium';
                }
            }
        } else {
            if (window.devicePixelRatio >= 2) {
                const cores = navigator.hardwareConcurrency || 2;
                if (cores >= 4) {
                    this.gpuTier = 'medium';
                }
            }
        }
        
        this.setAnimationComplexity();
    }

    setAnimationComplexity() {
        switch(this.gpuTier) {
            case 'high':
                this.particleCount = 150;
                this.connectDistance = 120;
                this.particleSpeed = 1.0;
                this.useGlow = true;
                this.useBlur = true;
                this.useCosmicResonance = true;
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
                this.particleSpeed = 0.5;
                this.useGlow = false;
                this.useBlur = false;
                this.useCosmicResonance = false;
                break;
        }
    }

    initCanvasFallback() {
        const ctx = this.canvas.getContext('2d');
        if (!ctx) {
            return;
        }

        const particles = [];
        
        for (let i = 0; i < this.particleCount; i++) {
            particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 3 + 1,
                color: `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.1})`,
                vx: (Math.random() - 0.5) * this.particleSpeed,
                vy: (Math.random() - 0.5) * this.particleSpeed
            });
        }
        
        const animate = () => {
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            if (this.gpuTier !== 'low') {
                this.createGlowingAuras(ctx);
            }
            
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                
                // Update position
                p.x += p.vx;
                p.y += p.vy;
                
                // Bounce off walls
                if (p.x < 0 || p.x > this.canvas.width) {
                    p.vx *= -1;
                }
                if (p.y < 0 || p.y > this.canvas.height) {
                    p.vy *= -1;
                }
                
                // Draw particle
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
            }
            
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < this.connectDistance) {
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
        
        this.addProfoundElements();
        
        setTimeout(() => {
            const registerForm = document.getElementById('register-form');
            const registerButton = registerForm?.querySelector('.auth-button');
            if (registerButton) {
                this.addDestinyPath(registerButton);
                
                const registerTab = document.getElementById('register-tab');
                if (registerTab) {
                    registerTab.addEventListener('click', () => {
                        setTimeout(() => {
                            const registerForm = document.getElementById('register-form');
                            const registerButton = registerForm?.querySelector('.auth-button');
                            if (registerButton && !this.destinyAnimationActive) {
                                this.addDestinyPath(registerButton);
                            }
                        }, 500);
                    });
                }
            }
        }, 1000);
    }

    resizeCanvas() {
        if (!this.canvas) return;
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    animate() {
        if (!this.initialized) {
            return;
        }
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    addProfoundElements() {
        const ctx = this.canvas.getContext('2d');
        if (!ctx) return;
        
        if (this.gpuTier !== 'low') {
            this.createGlowingAuras(ctx);
        }
        
        if (this.gpuTier !== 'low') {
            this.addPerspectiveEffect();
        }
        
        const loginTab = document.getElementById('login-tab');
        const registerTab = document.getElementById('register-tab');
        
        if (loginTab && registerTab) {
            registerTab.addEventListener('click', () => {
                this.emphasizeRegisterForm();
            });
        }
        
        if (this.gpuTier === 'high') {
            this.addMouseTrailEffect();
        }
        
        if (this.gpuTier !== 'low') {
            this.addInspirationMessages();
        }
        
        if (this.gpuTier === 'high' && this.useCosmicResonance) {
            this.addCosmicResonanceEffect();
        }
        
        this.addTimeSlowingEffect();
    }

    createGlowingAuras(ctx) {
        if (!ctx) return;
        
        const auraPositions = [
            {
                x: this.canvas.width * 0.7,
                y: this.canvas.height * 0.4,
                radius: Math.min(this.canvas.width, this.canvas.height) * 0.3,
                color: 'rgba(255, 204, 0, 0.03)'
            },
            {
                x: this.canvas.width * 0.2,
                y: this.canvas.height * 0.8,
                radius: Math.min(this.canvas.width, this.canvas.height) * 0.25,
                color: 'rgba(75, 101, 132, 0.04)'
            },
            {
                x: this.canvas.width * 0.5,
                y: this.canvas.height * 0.15,
                radius: Math.min(this.canvas.width, this.canvas.height) * 0.2,
                color: 'rgba(255, 147, 0, 0.02)'
            }
        ];
        
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

    addPerspectiveEffect() {
        if (this.gpuTier === 'low') return;
        
        const container = document.querySelector('.storytelling-container');
        const authForm = document.querySelector('.auth-form-container');
        
        if (!container || !authForm) return;
        
        document.addEventListener('mousemove', (e) => {
            const mouseX = e.clientX / window.innerWidth - 0.5;
            const mouseY = e.clientY / window.innerHeight - 0.5;
            
            const rotateIntensity = this.gpuTier === 'high' ? 1.5 : 1;
            
            authForm.style.transition = 'transform 0.2s ease-out';
            authForm.style.transform = `
                perspective(1200px) 
                rotateY(${mouseX * 2 * rotateIntensity}deg) 
                rotateX(${-mouseY * 2 * rotateIntensity}deg)
                translateZ(10px)
            `;
            
            if (container) {
                container.style.backgroundPosition = `
                    ${50 + mouseX * 5}% ${50 + mouseY * 5}%`
                ;
            }
        });
    }

    emphasizeRegisterForm() {
        if (this.gpuTier === 'low') return;
        
        const registerForm = document.getElementById('register-form');
        const registerButton = registerForm?.querySelector('.auth-button');
        
        if (!registerButton) return;
        
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
        
        registerButton.style.position = 'relative';
        registerButton.appendChild(highlight);
        
        setTimeout(() => {
            highlight.style.opacity = '1';
        }, 100);
        
        this.addDestinyPath(registerButton);
        
        setTimeout(() => {
            highlight.style.opacity = '0';
            setTimeout(() => {
                if (highlight.parentNode) {
                    highlight.parentNode.removeChild(highlight);
                }
            }, 1000);
        }, 3000);
    }

    addMouseTrailEffect() {
        const container = document.querySelector('.login-container');
        if (!container) return;
        
        const trailContainer = document.createElement('div');
        trailContainer.style.position = 'absolute';
        trailContainer.style.top = '0';
        trailContainer.style.left = '0';
        trailContainer.style.width = '100%';
        trailContainer.style.height = '100%';
        trailContainer.style.pointerEvents = 'none';
        trailContainer.style.zIndex = '1';
        trailContainer.style.overflow = 'hidden';
        
        container.appendChild(trailContainer);
        
        let trail = [];
        let isMoving = false;
        
        document.addEventListener('mousemove', (e) => {
            isMoving = true;
            
            const trailDot = document.createElement('div');
            trailDot.className = 'trail-dot';
            trailDot.style.position = 'absolute';
            trailDot.style.width = '8px';
            trailDot.style.height = '8px';
            trailDot.style.borderRadius = '50%';
            trailDot.style.backgroundColor = 'rgba(255, 204, 0, 0.5)';
            trailDot.style.left = `${e.clientX}px`;
            trailDot.style.top = `${e.clientY}px`;
            trailDot.style.transform = 'translate(-50%, -50%)';
            trailDot.style.transition = 'opacity 1s ease-out, transform 1s ease-out';
            
            trailContainer.appendChild(trailDot);
            
            setTimeout(() => {
                trailDot.style.opacity = '0';
                trailDot.style.transform = 'translate(-50%, -50%) scale(0.5)';
                
                setTimeout(() => {
                    if (trailDot.parentNode) {
                        trailDot.parentNode.removeChild(trailDot);
                    }
                }, 1000);
            }, 100);
            
            trail.push(trailDot);
            
            if (trail.length > 20) {
                const oldDot = trail.shift();
                oldDot.style.opacity = '0';
                
                setTimeout(() => {
                    if (oldDot.parentNode) {
                        oldDot.parentNode.removeChild(oldDot);
                    }
                }, 1000);
            }
        });
        
        setInterval(() => {
            if (!isMoving) return;
            
            isMoving = false;
            
            const glowEffect = document.createElement('div');
            glowEffect.style.position = 'absolute';
            glowEffect.style.width = '100px';
            glowEffect.style.height = '100px';
            glowEffect.style.borderRadius = '50%';
            glowEffect.style.backgroundColor = 'rgba(255, 204, 0, 0.03)';
            glowEffect.style.left = `${trail[trail.length - 1]?.style.left || '50%'}`;
            glowEffect.style.top = `${trail[trail.length - 1]?.style.top || '50%'}`;
            glowEffect.style.transform = 'translate(-50%, -50%)';
            glowEffect.style.transition = 'all 1.5s ease-out';
            
            trailContainer.appendChild(glowEffect);
            
            setTimeout(() => {
                glowEffect.style.opacity = '0';
                glowEffect.style.width = '300px';
                glowEffect.style.height = '300px';
                
                setTimeout(() => {
                    if (glowEffect.parentNode) {
                        glowEffect.parentNode.removeChild(glowEffect);
                    }
                }, 1500);
            }, 50);
        }, 2000);
    }

    addDestinyPath(button) {
        if (!button || this.destinyAnimationActive) return;
        
        this.destinyAnimationActive = true;
        
        const container = document.querySelector('.form-container');
        if (!container) {
            this.destinyAnimationActive = false;
            return;
        }
        
        const pathContainer = document.createElement('div');
        pathContainer.style.position = 'absolute';
        pathContainer.style.top = '0';
        pathContainer.style.left = '0';
        pathContainer.style.width = '100%';
        pathContainer.style.height = '100%';
        pathContainer.style.pointerEvents = 'none';
        pathContainer.style.zIndex = '0';
        
        container.appendChild(pathContainer);
        
        const buttonRect = button.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        const endX = buttonRect.left - containerRect.left + buttonRect.width / 2;
        const endY = buttonRect.top - containerRect.top + buttonRect.height / 2;
        
        const particleCount = this.gpuTier === 'high' ? 15 : 8;
        
        for (let i = 0; i < particleCount; i++) {
            setTimeout(() => {
                const startAngle = Math.random() * Math.PI * 2;
                const distance = Math.random() * 200 + 100;
                
                const startX = endX + Math.cos(startAngle) * distance;
                const startY = endY + Math.sin(startAngle) * distance;
                
                const particle = document.createElement('div');
                particle.style.position = 'absolute';
                particle.style.width = '8px';
                particle.style.height = '8px';
                particle.style.borderRadius = '50%';
                particle.style.backgroundColor = 'rgba(255, 204, 0, 0.4)';
                particle.style.left = `${startX}px`;
                particle.style.top = `${startY}px`;
                particle.style.transform = 'translate(-50%, -50%)';
                particle.style.transition = `all 2s cubic-bezier(0.25, 0.1, 0.25, 1)`;
                particle.style.opacity = '0';
                
                pathContainer.appendChild(particle);
                
                setTimeout(() => {
                    particle.style.opacity = '0.5';
                    particle.style.left = `${endX}px`;
                    particle.style.top = `${endY}px`;
                    
                    setTimeout(() => {
                        particle.style.opacity = '0';
                        particle.style.transform = 'translate(-50%, -50%) scale(0.5)';
                        
                        setTimeout(() => {
                            if (particle.parentNode) {
                                particle.parentNode.removeChild(particle);
                            }
                            
                            if (i === particleCount - 1) {
                                setTimeout(() => {
                                    this.destinyAnimationActive = false;
                                    if (pathContainer.parentNode) {
                                        pathContainer.parentNode.removeChild(pathContainer);
                                    }
                                }, 500);
                            }
                        }, 1000);
                    }, 2000);
                }, 50);
            }, i * 200);
        }
    }

    addInspirationMessages() {
        const inspirationalMessages = [
            "Your story begins now",
            "Create worlds never seen before",
            "Every great journey begins with a single step",
            "Unleash your creative potential",
            "Your imagination knows no bounds",
            "The universe awaits your stories"
        ];
        
        const messageContainer = document.createElement('div');
        messageContainer.style.position = 'absolute';
        messageContainer.style.width = '100%';
        messageContainer.style.height = '100%';
        messageContainer.style.pointerEvents = 'none';
        messageContainer.style.overflow = 'hidden';
        messageContainer.style.zIndex = '1';
        
        document.body.appendChild(messageContainer);
        
        const showRandomMessage = () => {
            const message = inspirationalMessages[Math.floor(Math.random() * inspirationalMessages.length)];
            
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
            
            messageElement.style.left = `${20 + Math.random() * 60}%`;
            messageElement.style.top = `${20 + Math.random() * 60}%`;
            messageElement.style.transform = 'translateY(20px)';
            
            messageContainer.appendChild(messageElement);
            
            setTimeout(() => {
                messageElement.style.opacity = '0.7';
                messageElement.style.color = 'rgba(255, 204, 0, 0.7)';
                messageElement.style.transform = 'translateY(0)';
            }, 100);
            
            setTimeout(() => {
                messageElement.style.opacity = '0';
                messageElement.style.transform = 'translateY(-20px)';
                
                setTimeout(() => {
                    if (messageElement.parentNode) {
                        messageElement.parentNode.removeChild(messageElement);
                    }
                }, 3100);
            }, 5000);
        };
        
        setTimeout(() => {
            showRandomMessage();
            
            setInterval(() => {
                showRandomMessage();
            }, 10000);
        }, 3000);
    }

    addCosmicResonanceEffect() {
        if (this.cosmicResonanceActive) return;
        this.cosmicResonanceActive = true;
        
        const container = document.querySelector('.login-container');
        if (!container) return;
        
        const resonanceContainer = document.createElement('div');
        resonanceContainer.style.position = 'absolute';
        resonanceContainer.style.top = '0';
        resonanceContainer.style.left = '0';
        resonanceContainer.style.width = '100%';
        resonanceContainer.style.height = '100%';
        resonanceContainer.style.pointerEvents = 'none';
        resonanceContainer.style.zIndex = '0';
        resonanceContainer.style.overflow = 'hidden';
        
        container.appendChild(resonanceContainer);
        
        const createResonanceWave = () => {
            const wave = document.createElement('div');
            wave.style.position = 'absolute';
            wave.style.top = '50%';
            wave.style.left = '50%';
            wave.style.transform = 'translate(-50%, -50%)';
            wave.style.width = '10px';
            wave.style.height = '10px';
            wave.style.borderRadius = '50%';
            wave.style.boxShadow = '0 0 10px 2px rgba(255, 204, 0, 0.2)';
            wave.style.background = 'radial-gradient(circle, rgba(255,204,0,0.1) 0%, rgba(255,177,0,0.05) 50%, rgba(255,204,0,0) 70%)';
            wave.style.opacity = '0.8';
            wave.style.transition = 'all 7s cubic-bezier(0.165, 0.84, 0.44, 1)';
            
            resonanceContainer.appendChild(wave);
            
            setTimeout(() => {
                wave.style.width = '1000px';
                wave.style.height = '1000px';
                wave.style.opacity = '0';
                
                setTimeout(() => {
                    if (wave.parentNode) {
                        wave.parentNode.removeChild(wave);
                    }
                }, 7000);
            }, 100);
        };
        
        createResonanceWave();
        
        setInterval(() => {
            createResonanceWave();
        }, 8000);
    }

    addTimeSlowingEffect() {
        const setupForButton = (buttonSelector, formID) => {
            setTimeout(() => {
                const form = document.getElementById(formID);
                const button = form?.querySelector(buttonSelector);
                
                if (!button) return;
                
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
                
                button.style.position = 'relative';
                button.appendChild(rippleContainer);
                
                button.addEventListener('mouseenter', () => {
                    rippleContainer.style.opacity = '1';
                    
                    this.createTimeRipple(rippleContainer);
                    
                    if (this.gpuTier === 'high') {
                        document.documentElement.style.setProperty('--time-dilation', '0.5');
                        
                        button.style.boxShadow = '0 0 15px rgba(255, 204, 0, 0.3)';
                        button.style.transition = 'all 0.5s ease-out';
                    }
                });
                
                button.addEventListener('mouseleave', () => {
                    rippleContainer.style.opacity = '0';
                    
                    document.documentElement.style.setProperty('--time-dilation', '1');
                    
                    button.style.boxShadow = '';
                });
                
                button.addEventListener('focus', () => {
                    rippleContainer.style.opacity = '1';
                    
                    this.createTimeRipple(rippleContainer);
                });
                
                button.addEventListener('blur', () => {
                    rippleContainer.style.opacity = '0';
                });
            }, 1500);
        };
        
        setupForButton('.auth-button', 'register-form');
        setupForButton('.auth-button', 'login-form');
        
        document.documentElement.style.setProperty('--time-dilation', '1');
    }

    createTimeRipple(container) {
        if (!container) return;
        
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
        
        container.appendChild(ripple);
        
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
                if (ripple.parentNode) {
                    ripple.parentNode.removeChild(ripple);
                }
            }
        };
        
        animateRipple();
    }
}

export default WebGPUBackground;