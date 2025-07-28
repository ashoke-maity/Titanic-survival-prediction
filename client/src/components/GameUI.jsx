// Pure JavaScript UI component - no React needed

export class GameUI {
    constructor() {
        this.hudElement = null;
        this.startScreenElement = null;
        this.gameOverScreenElement = null;
        this.isInitialized = false;
        
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        this.createHUD();
        this.createStartScreen();
        this.createGameOverScreen();
        this.isInitialized = true;
    }

    createHUD() {
        this.hudElement = document.createElement('div');
        this.hudElement.id = 'game-hud';
        this.hudElement.className = 'game-hud hidden';
        this.hudElement.innerHTML = `
            <div class="controls-reminder" style="position: fixed; top: 20px; left: 20px; background: rgba(0,0,0,0.7); padding: 15px; border-radius: 10px; color: white;">
                <div style="font-size: 1.2rem; margin-bottom: 10px; color: #ffd700;">CONTROLS</div>
                <div style="font-size: 1.5rem;"><strong>A</strong> - Turn Left</div>
                <div style="font-size: 1.5rem;"><strong>D</strong> - Turn Right</div>
            </div>
            
            <div class="survival-prediction">
                <div class="survival-rate">
                    <span class="label">SURVIVAL PREDICTION</span>
                    <div class="percentage">100%</div>
                </div>
                <div class="risk-assessment">
                    <span class="label">Risk Level</span>
                    <span class="risk-level safe">SAFE</span>
                </div>
                <div class="recommendations">
                    <span class="label">Recommended Actions</span>
                    <div class="action-list">
                        <div class="action">Maintain course</div>
                    </div>
                </div>
            </div>
            
            <div class="ship-status">
                <div class="status-header">SHIP STATUS</div>
                <div class="speed-indicator">
                    <span class="label">Speed</span>
                    <span class="value">0 knots</span>
                </div>
                <div class="heading-compass">
                    <span class="label">Heading</span>
                    <span class="value">0°</span>
                </div>
                <div class="engine-status">
                    <span class="label">Engine</span>
                    <span class="value running">RUNNING</span>
                </div>
                <div class="rudder-angle">
                    <span class="label">Rudder Angle</span>
                    <span class="value">0°</span>
                </div>
                <div class="steering-response">
                    <span class="label">Steering Response</span>
                    <span class="value">100%</span>
                </div>
                <div class="emergency-status">
                    <span class="label">Emergency Maneuver</span>
                    <span class="value ready">READY</span>
                </div>
                <div class="damage-assessment">
                    <span class="label">Damage</span>
                    <span class="value">0%</span>
                </div>
                <div class="crew-morale">
                    <span class="label">Crew Morale</span>
                    <span class="value">100%</span>
                </div>
            </div>
            
            <div class="mini-map">
                <canvas id="mini-map-canvas" width="200" height="200"></canvas>
                <div class="map-legend">
                    <div class="legend-item">
                        <div class="ship-icon"></div>
                        <span>Ship</span>
                    </div>
                    <div class="legend-item">
                        <div class="iceberg-icon"></div>
                        <span>Iceberg</span>
                    </div>
                </div>
            </div>
            
            <div class="game-time" style="position: fixed; bottom: 20px; left: 20px; background: rgba(0,0,0,0.7); padding: 15px; border-radius: 10px; color: white;">
                <span class="label" style="font-size: 1.2rem; color: #ffd700;">Time Survived</span>
                <span class="time" style="font-size: 1.5rem; display: block; text-align: center;">00:00</span>
            </div>
        `;
        
        document.body.appendChild(this.hudElement);
    }

    createStartScreen() {
        this.startScreenElement = document.createElement('div');
        this.startScreenElement.id = 'start-screen';
        this.startScreenElement.className = 'start-screen';
        
        // Add inline CSS to ensure the start screen is visible
        this.startScreenElement.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: linear-gradient(180deg, #000033 0%, #001122 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-family: 'Times New Roman', serif;
            color: #ffffff;
            z-index: 1000;
            text-align: center;
        `;
        this.startScreenElement.innerHTML = `
            <div class="start-content">
                <h1 class="game-title">Titanic Survival Prediction</h1>
                <p class="game-subtitle">Can you save the Titanic?</p>
                
                <div class="historical-info">
                    <p>April 14, 1912 - North Atlantic Ocean</p>
                    <p>Your mission: Steer the Titanic away from the iceberg!</p>
                </div>
                
                <div style="margin: 2rem 0;">
                    <button id="start-game-btn" style="
                        display: block;
                        width: 100%;
                        max-width: 400px;
                        margin: 1rem auto;
                        padding: 15px 20px;
                        background: linear-gradient(135deg, #2c4c6c 0%, #1a3a5a 100%);
                        border: 2px solid #ffd700;
                        border-radius: 8px;
                        color: #ffffff;
                        font-family: 'Times New Roman', serif;
                        font-size: 1.5rem;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    ">
                        START GAME
                    </button>
                </div>
                
                <div class="controls-info">
                    <h3>Controls</h3>
                    <div class="control-item">
                        <span class="key">W/S or ↑/↓</span>
                        <span class="action">Forward/Backward</span>
                    </div>
                    <div class="control-item">
                        <span class="key">A/D or ←/→</span>
                        <span class="action">Turn Left/Right</span>
                    </div>
                    <div class="control-item">
                        <span class="key">Mouse</span>
                        <span class="action">Camera Control</span>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.startScreenElement);
        
        // Add CSS for hidden class and button hover effects
        const style = document.createElement('style');
        style.textContent = `
            .hidden {
                display: none !important;
            }
            
            .difficulty-btn:hover {
                background: linear-gradient(135deg, #3c5c7c 0%, #2a4a6a 100%) !important;
                transform: translateY(-2px) !important;
                box-shadow: 0 4px 8px rgba(255, 215, 0, 0.3) !important;
            }
            
            .start-content {
                max-width: 800px;
                padding: 40px;
            }
            
            .game-title {
                font-size: 3rem;
                margin-bottom: 1rem;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
                color: #ffd700;
            }
            
            .game-subtitle {
                font-size: 1.5rem;
                margin-bottom: 2rem;
                color: #cccccc;
            }
            
            .historical-info {
                margin-bottom: 2rem;
                padding: 20px;
                border: 2px solid #ffd700;
                border-radius: 10px;
                background: rgba(0, 0, 0, 0.3);
            }
            
            .controls-info {
                text-align: left;
                max-width: 300px;
                margin: 2rem auto 0;
            }
            
            .controls-info h3 {
                text-align: center;
                color: #ffd700;
                margin-bottom: 1rem;
            }
            
            .control-item {
                display: flex;
                justify-content: space-between;
                margin: 0.5rem 0;
                padding: 5px 0;
                border-bottom: 1px solid #333;
            }
            
            .key {
                font-weight: bold;
                color: #ffd700;
            }
        `;
        document.head.appendChild(style);
        
        // Add event listener for start game button
        const startButton = this.startScreenElement.querySelector('#start-game-btn');
        if (startButton) {
            startButton.addEventListener('click', () => {
                document.dispatchEvent(new CustomEvent('startGame'));
            });
            
            // Add hover effects
            startButton.addEventListener('mouseover', () => {
                startButton.style.transform = 'scale(1.05)';
                startButton.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.5)';
            });
            
            startButton.addEventListener('mouseout', () => {
                startButton.style.transform = 'scale(1)';
                startButton.style.boxShadow = 'none';
            });
        }
    }

    createGameOverScreen() {
        this.gameOverScreenElement = document.createElement('div');
        this.gameOverScreenElement.id = 'game-over-screen';
        this.gameOverScreenElement.className = 'game-over-screen hidden';
        this.gameOverScreenElement.innerHTML = `
            <div class="game-over-content">
                <h1 class="game-over-title">Mission Complete</h1>
                <div class="outcome-message"></div>
                
                <div class="final-stats">
                    <div class="stat-item">
                        <span class="stat-label">Final Survival Rate</span>
                        <span class="stat-value survival-rate">0%</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Time Survived</span>
                        <span class="stat-value time-survived">00:00</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Difficulty</span>
                        <span class="stat-value difficulty">Calm Seas</span>
                    </div>
                </div>
                
                <div class="historical-comparison">
                    <h3>Historical Context</h3>
                    <p class="historical-text">
                        The real RMS Titanic sank on April 15, 1912, with a survival rate of approximately 32%.
                        Your performance: <span class="comparison-result"></span>
                    </p>
                </div>
                
                <div class="game-over-actions">
                    <button class="restart-btn">Try Again</button>
                    <button class="menu-btn">Main Menu</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.gameOverScreenElement);
        
        // Add event listeners
        this.gameOverScreenElement.querySelector('.restart-btn').addEventListener('click', () => {
            document.dispatchEvent(new CustomEvent('restartGame'));
        });
        
        this.gameOverScreenElement.querySelector('.menu-btn').addEventListener('click', () => {
            this.hideGameOverScreen();
            this.showStartScreen();
        });
    }

    showStartScreen() {
        this.startScreenElement.classList.remove('hidden');
        this.hudElement.classList.add('hidden');
        this.gameOverScreenElement.classList.add('hidden');
    }

    hideStartScreen() {
        this.startScreenElement.classList.add('hidden');
    }

    showGameHUD() {
        this.hudElement.classList.remove('hidden');
        this.startScreenElement.classList.add('hidden');
        this.gameOverScreenElement.classList.add('hidden');
    }

    hideGameHUD() {
        this.hudElement.classList.add('hidden');
    }

    showGameOverScreen(data) {
        const { survived, finalSurvivalRate, gameTime, difficulty } = data;
        
        this.gameOverScreenElement.classList.remove('hidden');
        this.hudElement.classList.add('hidden');
        
        // Update title and message
        const title = this.gameOverScreenElement.querySelector('.game-over-title');
        const message = this.gameOverScreenElement.querySelector('.outcome-message');
        
        if (survived) {
            title.textContent = 'Mission Accomplished!';
            message.innerHTML = '<p class="success">You successfully navigated the Titanic to safety!</p>';
            message.className = 'outcome-message success';
        } else {
            title.textContent = 'Mission Failed';
            message.innerHTML = '<p class="failure">The Titanic has collided with an iceberg...</p>';
            message.className = 'outcome-message failure';
        }
        
        // Update stats
        this.gameOverScreenElement.querySelector('.stat-value.survival-rate').textContent = `${Math.round(finalSurvivalRate)}%`;
        this.gameOverScreenElement.querySelector('.stat-value.time-survived').textContent = this.formatTime(gameTime);
        this.gameOverScreenElement.querySelector('.stat-value.difficulty').textContent = difficulty;
        
        // Update historical comparison
        const comparisonResult = this.gameOverScreenElement.querySelector('.comparison-result');
        if (finalSurvivalRate > 32) {
            comparisonResult.textContent = 'Better than historical outcome';
            comparisonResult.className = 'comparison-result better';
        } else {
            comparisonResult.textContent = 'Similar to historical outcome';
            comparisonResult.className = 'comparison-result similar';
        }
    }

    hideGameOverScreen() {
        this.gameOverScreenElement.classList.add('hidden');
    }

    updateHUD(data) {
        if (!this.hudElement || this.hudElement.classList.contains('hidden')) return;
        
        const { survivalRate, riskLevel, recommendations, shipStatus, gameTime } = data;
        
        // Update survival prediction with null checks
        const percentageElement = this.hudElement.querySelector('.survival-prediction .percentage');
        if (percentageElement) {
            percentageElement.textContent = `${Math.round(survivalRate)}%`;
        }
        
        const riskElement = this.hudElement.querySelector('.risk-level');
        if (riskElement) {
            riskElement.textContent = riskLevel.toUpperCase();
            riskElement.className = `risk-level ${riskLevel}`;
        }
        
        // Update recommendations with null check
        const actionList = this.hudElement.querySelector('.action-list');
        if (actionList) {
            actionList.innerHTML = recommendations.map(action => `<div class="action">${action}</div>`).join('');
        }
        
        // Update ship status
        this.hudElement.querySelector('.ship-status .speed-indicator .value').textContent = `${Math.round(shipStatus.speed)} knots`;
        this.hudElement.querySelector('.ship-status .heading-compass .value').textContent = `${Math.round(shipStatus.heading)}°`;
        
        const engineElement = this.hudElement.querySelector('.ship-status .engine-status .value');
        engineElement.textContent = shipStatus.engineStatus.toUpperCase();
        engineElement.className = `value ${shipStatus.engineStatus}`;
        
        // Update new steering information
        const rudderAngle = shipStatus.rudderAngle || 0;
        this.hudElement.querySelector('.ship-status .rudder-angle .value').textContent = `${Math.round(rudderAngle * 180 / Math.PI)}°`;
        
        const steeringResponse = shipStatus.steeringResponsiveness || 1;
        this.hudElement.querySelector('.ship-status .steering-response .value').textContent = `${Math.round(steeringResponse * 100)}%`;
        
        const emergencyElement = this.hudElement.querySelector('.ship-status .emergency-status .value');
        const emergencyStatus = shipStatus.emergencyActive ? 'ACTIVE' : 'READY';
        emergencyElement.textContent = emergencyStatus;
        emergencyElement.className = `value ${shipStatus.emergencyActive ? 'active' : 'ready'}`;
        
        this.hudElement.querySelector('.ship-status .damage-assessment .value').textContent = `${Math.round(shipStatus.damage)}%`;
        this.hudElement.querySelector('.ship-status .crew-morale .value').textContent = `${Math.round(shipStatus.crewMorale)}%`;
        
        // Update game time
        this.hudElement.querySelector('.game-time .time').textContent = this.formatTime(gameTime);
        
        // Update mini-map
        this.updateMiniMap(shipStatus.position);
    }

    updateMiniMap(shipPosition) {
        const canvas = this.hudElement.querySelector('#mini-map-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const scale = 0.1;
        
        // Clear canvas
        ctx.fillStyle = '#001122';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid
        ctx.strokeStyle = '#003366';
        ctx.lineWidth = 1;
        for (let i = 0; i < canvas.width; i += 20) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvas.height);
            ctx.stroke();
        }
        for (let i = 0; i < canvas.height; i += 20) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(canvas.width, i);
            ctx.stroke();
        }
        
        // Draw ship
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(centerX - 2, centerY - 2, 4, 4);
        
        // Draw compass
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw N indicator
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('N', centerX, centerY - 85);
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    dispose() {
        if (this.hudElement) {
            document.body.removeChild(this.hudElement);
        }
        if (this.startScreenElement) {
            document.body.removeChild(this.startScreenElement);
        }
        if (this.gameOverScreenElement) {
            document.body.removeChild(this.gameOverScreenElement);
        }
    }
}