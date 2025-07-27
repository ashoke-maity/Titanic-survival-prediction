export class InputController {
    constructor(ship) {
        this.ship = ship;
        this.keys = {};
        this.mouseDown = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.enabled = false;
        
        // Touch controls for mobile
        this.touchControls = {
            active: false,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0
        };
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup', this.onKeyUp.bind(this));
        
        // Mouse controls
        document.addEventListener('mousedown', this.onMouseDown.bind(this));
        document.addEventListener('mouseup', this.onMouseUp.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        
        // Touch controls for mobile
        document.addEventListener('touchstart', this.onTouchStart.bind(this));
        document.addEventListener('touchend', this.onTouchEnd.bind(this));
        document.addEventListener('touchmove', this.onTouchMove.bind(this));
        
        // Prevent context menu on right click
        document.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Handle window focus/blur
        window.addEventListener('blur', this.onWindowBlur.bind(this));
    }

    onKeyDown(event) {
        if (!this.enabled) return;
        
        this.keys[event.code] = true;
        
        // Prevent default behavior for game keys
        const gameKeys = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'];
        if (gameKeys.includes(event.code)) {
            event.preventDefault();
        }
    }

    onKeyUp(event) {
        if (!this.enabled) return;
        
        this.keys[event.code] = false;
    }

    onMouseDown(event) {
        if (!this.enabled) return;
        
        this.mouseDown = true;
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
    }

    onMouseUp(event) {
        if (!this.enabled) return;
        
        this.mouseDown = false;
    }

    onMouseMove(event) {
        if (!this.enabled || !this.mouseDown) return;
        
        const deltaX = event.clientX - this.lastMouseX;
        const deltaY = event.clientY - this.lastMouseY;
        
        // Mouse drag controls ship
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal movement - steering
            if (deltaX > 0) {
                this.ship.turnRight(Math.abs(deltaX) * 0.1);
            } else {
                this.ship.turnLeft(Math.abs(deltaX) * 0.1);
            }
        } else {
            // Vertical movement - speed
            if (deltaY < 0) {
                this.ship.accelerate(Math.abs(deltaY) * 0.01);
            } else {
                this.ship.decelerate(Math.abs(deltaY) * 0.01);
            }
        }
        
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
    }

    onTouchStart(event) {
        if (!this.enabled) return;
        
        event.preventDefault();
        
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            this.touchControls.active = true;
            this.touchControls.startX = touch.clientX;
            this.touchControls.startY = touch.clientY;
            this.touchControls.currentX = touch.clientX;
            this.touchControls.currentY = touch.clientY;
        }
    }

    onTouchEnd(event) {
        if (!this.enabled) return;
        
        event.preventDefault();
        this.touchControls.active = false;
    }

    onTouchMove(event) {
        if (!this.enabled || !this.touchControls.active) return;
        
        event.preventDefault();
        
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            this.touchControls.currentX = touch.clientX;
            this.touchControls.currentY = touch.clientY;
            
            const deltaX = this.touchControls.currentX - this.touchControls.startX;
            const deltaY = this.touchControls.currentY - this.touchControls.startY;
            
            // Touch controls similar to mouse drag
            if (Math.abs(deltaX) > 10) {
                if (deltaX > 0) {
                    this.ship.turnRight(Math.abs(deltaX) * 0.005);
                } else {
                    this.ship.turnLeft(Math.abs(deltaX) * 0.005);
                }
            }
            
            if (Math.abs(deltaY) > 10) {
                if (deltaY < 0) {
                    this.ship.accelerate(Math.abs(deltaY) * 0.002);
                } else {
                    this.ship.decelerate(Math.abs(deltaY) * 0.002);
                }
            }
        }
    }

    onWindowBlur() {
        // Clear all keys when window loses focus
        this.keys = {};
        this.mouseDown = false;
        this.touchControls.active = false;
    }

    update(deltaTime) {
        if (!this.enabled) return;
        
        this.handleKeyboardInput(deltaTime);
    }

    handleKeyboardInput(deltaTime) {
        const accelerationRate = 15 * deltaTime;
        const decelerationRate = 20 * deltaTime;
        const turnRate = 2 * deltaTime;
        
        // Forward/Backward movement
        if (this.keys['KeyW'] || this.keys['ArrowUp']) {
            this.ship.accelerate(accelerationRate);
        }
        
        if (this.keys['KeyS'] || this.keys['ArrowDown']) {
            this.ship.decelerate(decelerationRate);
        }
        
        // Steering
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) {
            this.ship.turnLeft(turnRate);
        }
        
        if (this.keys['KeyD'] || this.keys['ArrowRight']) {
            this.ship.turnRight(turnRate);
        }
        
        // Emergency stop
        if (this.keys['Space']) {
            this.ship.decelerate(decelerationRate * 2);
        }
        
        // Speed presets (number keys)
        if (this.keys['Digit1']) {
            this.ship.speed = Math.min(this.ship.maxSpeed * 0.25, this.ship.speed + accelerationRate);
        }
        if (this.keys['Digit2']) {
            this.ship.speed = Math.min(this.ship.maxSpeed * 0.5, this.ship.speed + accelerationRate);
        }
        if (this.keys['Digit3']) {
            this.ship.speed = Math.min(this.ship.maxSpeed * 0.75, this.ship.speed + accelerationRate);
        }
        if (this.keys['Digit4']) {
            this.ship.speed = Math.min(this.ship.maxSpeed, this.ship.speed + accelerationRate);
        }
    }

    enable() {
        this.enabled = true;
        this.showControlsHint();
    }

    disable() {
        this.enabled = false;
        this.keys = {};
        this.mouseDown = false;
        this.touchControls.active = false;
        this.hideControlsHint();
    }

    showControlsHint() {
        // Create controls hint overlay
        if (document.getElementById('controlsHint')) return;
        
        const hint = document.createElement('div');
        hint.id = 'controlsHint';
        hint.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 20px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 15px;
            border-radius: 10px;
            font-family: 'Times New Roman', serif;
            font-size: 14px;
            z-index: 200;
            max-width: 250px;
            opacity: 0;
            transition: opacity 0.5s ease;
        `;
        
        hint.innerHTML = `
            <div style="margin-bottom: 10px; font-weight: bold; color: #4a90e2;">CONTROLS</div>
            <div style="margin-bottom: 5px;">WASD / Arrow Keys - Navigate</div>
            <div style="margin-bottom: 5px;">Mouse Drag - Steer & Speed</div>
            <div style="margin-bottom: 5px;">Space - Emergency Stop</div>
            <div style="margin-bottom: 5px;">1-4 - Speed Presets</div>
            ${this.isMobileDevice() ? '<div>Touch & Drag - Mobile Control</div>' : ''}
        `;
        
        document.body.appendChild(hint);
        
        // Fade in
        setTimeout(() => {
            hint.style.opacity = '1';
        }, 100);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (hint.parentNode) {
                hint.style.opacity = '0';
                setTimeout(() => {
                    if (hint.parentNode) {
                        hint.parentNode.removeChild(hint);
                    }
                }, 500);
            }
        }, 5000);
    }

    hideControlsHint() {
        const hint = document.getElementById('controlsHint');
        if (hint) {
            hint.style.opacity = '0';
            setTimeout(() => {
                if (hint.parentNode) {
                    hint.parentNode.removeChild(hint);
                }
            }, 500);
        }
    }

    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    getInputState() {
        return {
            keys: { ...this.keys },
            mouse: {
                down: this.mouseDown,
                x: this.lastMouseX,
                y: this.lastMouseY
            },
            touch: { ...this.touchControls },
            enabled: this.enabled
        };
    }

    // Advanced control schemes
    setControlScheme(scheme) {
        this.controlScheme = scheme;
        
        switch (scheme) {
            case 'arcade':
                // More responsive, less realistic
                this.accelerationMultiplier = 1.5;
                this.turnMultiplier = 1.5;
                break;
            case 'realistic':
                // Slower, more ship-like
                this.accelerationMultiplier = 0.7;
                this.turnMultiplier = 0.7;
                break;
            case 'expert':
                // Requires more skill
                this.accelerationMultiplier = 0.5;
                this.turnMultiplier = 0.5;
                break;
            default:
                this.accelerationMultiplier = 1.0;
                this.turnMultiplier = 1.0;
        }
    }

    // Haptic feedback for supported devices
    vibrate(pattern = [100]) {
        if (navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    }

    // Collision feedback
    onCollision() {
        this.vibrate([200, 100, 200]);
    }

    dispose() {
        // Remove event listeners
        document.removeEventListener('keydown', this.onKeyDown.bind(this));
        document.removeEventListener('keyup', this.onKeyUp.bind(this));
        document.removeEventListener('mousedown', this.onMouseDown.bind(this));
        document.removeEventListener('mouseup', this.onMouseUp.bind(this));
        document.removeEventListener('mousemove', this.onMouseMove.bind(this));
        document.removeEventListener('touchstart', this.onTouchStart.bind(this));
        document.removeEventListener('touchend', this.onTouchEnd.bind(this));
        document.removeEventListener('touchmove', this.onTouchMove.bind(this));
        window.removeEventListener('blur', this.onWindowBlur.bind(this));
        
        this.hideControlsHint();
    }
}