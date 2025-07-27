export class InputController {
    constructor(ship) {
        this.ship = ship;
        this.keys = {};
        this.mouseDown = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.enabled = false;
        
        this.bindEvents();
    }

    bindEvents() {
        // Keyboard events
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup', this.onKeyUp.bind(this));
        
        // Mouse events for ship dragging
        document.addEventListener('mousedown', this.onMouseDown.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('mouseup', this.onMouseUp.bind(this));
        
        // Touch events for mobile
        document.addEventListener('touchstart', this.onTouchStart.bind(this));
        document.addEventListener('touchmove', this.onTouchMove.bind(this));
        document.addEventListener('touchend', this.onTouchEnd.bind(this));
        
        // Prevent context menu on right click
        document.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Start input processing loop
        this.inputLoop();
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

    onMouseMove(event) {
        if (!this.enabled || !this.mouseDown) return;
        
        const deltaX = event.clientX - this.lastMouseX;
        const deltaY = event.clientY - this.lastMouseY;
        
        // Use mouse movement for ship steering
        if (Math.abs(deltaX) > 2) {
            if (deltaX > 0) {
                this.ship.turnRight(Math.abs(deltaX) * 0.1);
            } else {
                this.ship.turnLeft(Math.abs(deltaX) * 0.1);
            }
        }
        
        // Use vertical mouse movement for speed control
        if (Math.abs(deltaY) > 2) {
            if (deltaY < 0) {
                this.ship.accelerate(Math.abs(deltaY) * 0.05);
            } else {
                this.ship.decelerate(Math.abs(deltaY) * 0.05);
            }
        }
        
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
    }

    onMouseUp(event) {
        if (!this.enabled) return;
        
        this.mouseDown = false;
    }

    onTouchStart(event) {
        if (!this.enabled) return;
        
        event.preventDefault();
        
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            this.mouseDown = true;
            this.lastMouseX = touch.clientX;
            this.lastMouseY = touch.clientY;
        }
    }

    onTouchMove(event) {
        if (!this.enabled || !this.mouseDown) return;
        
        event.preventDefault();
        
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            const deltaX = touch.clientX - this.lastMouseX;
            const deltaY = touch.clientY - this.lastMouseY;
            
            // Touch steering - more sensitive for mobile
            if (Math.abs(deltaX) > 1) {
                if (deltaX > 0) {
                    this.ship.turnRight(Math.abs(deltaX) * 0.15);
                } else {
                    this.ship.turnLeft(Math.abs(deltaX) * 0.15);
                }
            }
            
            // Touch speed control
            if (Math.abs(deltaY) > 1) {
                if (deltaY < 0) {
                    this.ship.accelerate(Math.abs(deltaY) * 0.08);
                } else {
                    this.ship.decelerate(Math.abs(deltaY) * 0.08);
                }
            }
            
            this.lastMouseX = touch.clientX;
            this.lastMouseY = touch.clientY;
        }
    }

    onTouchEnd(event) {
        if (!this.enabled) return;
        
        event.preventDefault();
        this.mouseDown = false;
    }

    inputLoop() {
        if (this.enabled && this.ship) {
            this.processKeyboardInput();
        }
        
        requestAnimationFrame(this.inputLoop.bind(this));
    }

    processKeyboardInput() {
        // REALISTIC TITANIC STEERING - Much more challenging and historically accurate
        const accelerationAmount = 0.8; // Slower acceleration for realism
        const baseTurnAmount = 0.6; // Much slower base turning
        
        // Get steering responsiveness based on ship's current state
        const steeringResponsiveness = this.ship.getSteeringResponsiveness ? 
            this.ship.getSteeringResponsiveness() : 1;
        const finalTurnAmount = baseTurnAmount * steeringResponsiveness;
        
        // Forward/Backward movement
        if (this.keys['KeyW'] || this.keys['ArrowUp']) {
            this.ship.accelerate(accelerationAmount);
        }
        
        if (this.keys['KeyS'] || this.keys['ArrowDown']) {
            this.ship.decelerate(accelerationAmount);
        }
        
        // Realistic steering with momentum and delay
        let steeringInput = 0;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) {
            steeringInput -= finalTurnAmount;
        }
        if (this.keys['KeyD'] || this.keys['ArrowRight']) {
            steeringInput += finalTurnAmount;
        }
        
        // Apply steering input
        if (steeringInput !== 0) {
            if (steeringInput < 0) {
                this.ship.turnLeft(Math.abs(steeringInput));
            } else {
                this.ship.turnRight(steeringInput);
            }
        } else {
            // Gradual return to center when no input (realistic steering)
            if (this.ship.steeringInput) {
                this.ship.steeringInput *= 0.95;
            }
        }
        
        // EMERGENCY MANEUVERS (Historical Titanic commands)
        
        // Emergency hard turn (E key) - Can only be used once per emergency
        if (this.keys['KeyE'] && !this.emergencyTurnPressed) {
            this.emergencyTurnPressed = true;
            if (this.ship.activateEmergencyManeuver && this.ship.activateEmergencyManeuver()) {
                this.showEmergencyMessage("EMERGENCY MANEUVER ACTIVATED!");
                this.vibrate([200, 100, 200, 100, 200]);
            }
        }
        if (!this.keys['KeyE']) {
            this.emergencyTurnPressed = false;
        }
        
        // Full Astern - Emergency reverse (R key)
        if (this.keys['KeyR'] && !this.fullAsternPressed) {
            this.fullAsternPressed = true;
            if (this.ship.fullAstern) {
                this.ship.fullAstern();
                this.showEmergencyMessage("FULL ASTERN! ENGINES REVERSING!");
                this.vibrate([300, 200, 300]);
            }
        }
        if (!this.keys['KeyR']) {
            this.fullAsternPressed = false;
        }
        
        // Emergency stop (Space) - More effective than normal deceleration
        if (this.keys['Space']) {
            this.ship.decelerate(accelerationAmount * 3);
        }
        
        // Historical speed telegraph settings (based on actual Titanic)
        if (this.keys['Digit1']) { // Dead slow ahead
            this.setTargetSpeed(this.ship.maxSpeed * 0.1);
        }
        if (this.keys['Digit2']) { // Slow ahead  
            this.setTargetSpeed(this.ship.maxSpeed * 0.3);
        }
        if (this.keys['Digit3']) { // Half ahead
            this.setTargetSpeed(this.ship.maxSpeed * 0.6);
        }
        if (this.keys['Digit4']) { // Full ahead (dangerous near icebergs!)
            this.setTargetSpeed(this.ship.maxSpeed);
        }
        if (this.keys['Digit0']) { // All stop
            this.setTargetSpeed(0);
        }
        
        // Hard a-port / Hard a-starboard (Q/T keys for maximum turn)
        if (this.keys['KeyQ']) {
            this.ship.turnLeft(finalTurnAmount * 2); // Hard a-port
        }
        if (this.keys['KeyT']) {
            this.ship.turnRight(finalTurnAmount * 2); // Hard a-starboard
        }
    }

    setTargetSpeed(targetSpeed) {
        if (!this.ship) return;
        
        const currentSpeed = this.ship.speed;
        const speedDiff = targetSpeed - currentSpeed;
        const adjustment = Math.sign(speedDiff) * Math.min(Math.abs(speedDiff), 0.3);
        
        if (adjustment > 0) {
            this.ship.accelerate(adjustment);
        } else if (adjustment < 0) {
            this.ship.decelerate(Math.abs(adjustment));
        }
    }

    showEmergencyMessage(message) {
        // Create emergency message overlay
        const emergencyMsg = document.createElement('div');
        emergencyMsg.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 0, 0, 0.9);
            color: white;
            padding: 20px 40px;
            border: 3px solid #fff;
            border-radius: 10px;
            font-family: 'Times New Roman', serif;
            font-size: 1.5rem;
            font-weight: bold;
            text-align: center;
            z-index: 1000;
            box-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
        `;
        
        emergencyMsg.textContent = message;
        document.body.appendChild(emergencyMsg);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (emergencyMsg.parentNode) {
                emergencyMsg.parentNode.removeChild(emergencyMsg);
            }
        }, 3000);
    }

    enable() {
        this.enabled = true;
        this.showControlsHint();
    }

    disable() {
        this.enabled = false;
        this.keys = {};
        this.mouseDown = false;
        this.hideControlsHint();
    }

    showControlsHint() {
        // Create or show controls hint overlay
        let hint = document.getElementById('controls-hint');
        
        if (!hint) {
            hint = document.createElement('div');
            hint.id = 'controls-hint';
            hint.className = 'controls-hint';
            hint.innerHTML = `
                <div class="controls-hint-content">
                    <h3>Ship Controls</h3>
                    <div class="control-group">
                        <h4 style="color: #ffd700; margin: 10px 0 5px 0;">Basic Controls</h4>
                        <div class="control-item">
                            <span class="key">W / ↑</span>
                            <span class="action">Accelerate</span>
                        </div>
                        <div class="control-item">
                            <span class="key">S / ↓</span>
                            <span class="action">Decelerate</span>
                        </div>
                        <div class="control-item">
                            <span class="key">A / ←</span>
                            <span class="action">Port (Left)</span>
                        </div>
                        <div class="control-item">
                            <span class="key">D / →</span>
                            <span class="action">Starboard (Right)</span>
                        </div>
                        <div class="control-item">
                            <span class="key">Mouse Drag</span>
                            <span class="action">Steer Ship</span>
                        </div>
                    </div>
                    <div class="control-group">
                        <h4 style="color: #ff6600; margin: 10px 0 5px 0;">Emergency Commands</h4>
                        <div class="control-item">
                            <span class="key">E</span>
                            <span class="action">Emergency Maneuver</span>
                        </div>
                        <div class="control-item">
                            <span class="key">R</span>
                            <span class="action">Full Astern (Reverse)</span>
                        </div>
                        <div class="control-item">
                            <span class="key">Q</span>
                            <span class="action">Hard A-Port</span>
                        </div>
                        <div class="control-item">
                            <span class="key">T</span>
                            <span class="action">Hard A-Starboard</span>
                        </div>
                        <div class="control-item">
                            <span class="key">Space</span>
                            <span class="action">Emergency Stop</span>
                        </div>
                    </div>
                    <div class="control-group">
                        <h4 style="color: #88ccff; margin: 10px 0 5px 0;">Speed Telegraph</h4>
                        <div class="control-item">
                            <span class="key">0</span>
                            <span class="action">All Stop</span>
                        </div>
                        <div class="control-item">
                            <span class="key">1</span>
                            <span class="action">Dead Slow</span>
                        </div>
                        <div class="control-item">
                            <span class="key">2</span>
                            <span class="action">Slow Ahead</span>
                        </div>
                        <div class="control-item">
                            <span class="key">3</span>
                            <span class="action">Half Ahead</span>
                        </div>
                        <div class="control-item">
                            <span class="key">4</span>
                            <span class="action">Full Ahead</span>
                        </div>
                    </div>
                    <p class="hint-note">Click anywhere to dismiss</p>
                </div>
            `;
            
            // Add styles
            const style = document.createElement('style');
            style.textContent = `
                .controls-hint {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(0, 17, 34, 0.95);
                    border: 2px solid #ffd700;
                    border-radius: 10px;
                    padding: 20px;
                    color: #ffffff;
                    font-family: 'Times New Roman', serif;
                    z-index: 1001;
                    max-width: 400px;
                    animation: fadeIn 0.3s ease-in;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
                    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }
                
                .controls-hint-content h3 {
                    color: #ffd700;
                    text-align: center;
                    margin-bottom: 15px;
                }
                
                .control-group {
                    margin-bottom: 15px;
                }
                
                .control-item {
                    display: flex;
                    justify-content: space-between;
                    margin: 8px 0;
                    padding: 5px 0;
                    border-bottom: 1px solid #333;
                }
                
                .control-item .key {
                    font-weight: bold;
                    color: #ffd700;
                    min-width: 80px;
                }
                
                .control-item .action {
                    color: #cccccc;
                }
                
                .hint-note {
                    text-align: center;
                    font-size: 0.9rem;
                    color: #999;
                    margin-top: 15px;
                    font-style: italic;
                }
            `;
            
            document.head.appendChild(style);
            document.body.appendChild(hint);
            
            // Auto-hide after 5 seconds or on click
            const hideHint = () => {
                hint.style.animation = 'fadeOut 0.3s ease-out';
                setTimeout(() => {
                    if (hint.parentNode) {
                        hint.parentNode.removeChild(hint);
                    }
                }, 300);
            };
            
            hint.addEventListener('click', hideHint);
            setTimeout(hideHint, 5000);
            
            // Add fadeOut animation
            const fadeOutStyle = document.createElement('style');
            fadeOutStyle.textContent = `
                @keyframes fadeOut {
                    from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                    to { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
                }
            `;
            document.head.appendChild(fadeOutStyle);
        }
    }

    hideControlsHint() {
        const hint = document.getElementById('controls-hint');
        if (hint) {
            hint.style.display = 'none';
        }
    }

    getInputState() {
        return {
            keys: { ...this.keys },
            mouseDown: this.mouseDown,
            enabled: this.enabled
        };
    }

    dispose() {
        this.disable();
        
        // Remove event listeners
        document.removeEventListener('keydown', this.onKeyDown.bind(this));
        document.removeEventListener('keyup', this.onKeyUp.bind(this));
        document.removeEventListener('mousedown', this.onMouseDown.bind(this));
        document.removeEventListener('mousemove', this.onMouseMove.bind(this));
        document.removeEventListener('mouseup', this.onMouseUp.bind(this));
        document.removeEventListener('touchstart', this.onTouchStart.bind(this));
        document.removeEventListener('touchmove', this.onTouchMove.bind(this));
        document.removeEventListener('touchend', this.onTouchEnd.bind(this));
    }
}