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
            <div class="survival-prediction">
                <div class="survival-rate">
                    <span class="label">Survival Rate</span>
                    <span class="percentage">100%</span>
                </div>
                <div class="risk-indicator">
                    <span class="label">Risk Level</span>
                    <span class="risk-level safe">SAFE</span>
                </div>
                <div class="countdown-timer">
                    <span class="label">Time to Decision</span>
                    <span class="timer">--</span>
                </div>
                <div class="recommendations">
                    <span class="label">Recommended Actions</span>
                    <div class="action-list"></div>
                </div>
            </div>
            
            <div class="ship-status">
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
                    <span class="label">Rudder</span>
                    <span class="value">0°</span>
                </div>
                <div class="steering-response">
                    <span class="label">Steering</span>
                    <span class="value">100%</span>
                </div>
                <div class="emergency-status">
                    <span class="label">Emergency</span>
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
                <div class="historical-context" style="margin-top: 10px; padding: 8px; background: rgba(0,0,0,0.3); border-radius: 5px; font-size: 0.8rem;">
                    <div style="color: #ffd700; font-weight: bold; margin-bottom: 5px;">Historical Context</div>
                    <div style="color: #cccccc;">RMS Titanic - April 14, 1912</div>
                    <div style="color: #cccccc;">Length: 269m | Mass: 52,310 tons</div>
                    <div style="color: #cccccc;">Can you change history?</div>
                </div>
            </div>
            
            <div class="mini-map">
                <canvas id="mini-map-canvas" width="200" height="200"></canvas>
                <div class="map-legend">
                    <div class="legend-item">
                        <span class="ship-icon"></span>
                        <span>Titanic</span>
                    </div>
                    <div class="legend-item">
                        <span class="iceberg-icon"></span>
                        <span>Icebergs</span>
                    </div>
                </div>
            </div>
            
            <div class="game-time">
                <span class="label">Time Survived</span>
                <span class="time">00:00</span>
            </div>
        `;
        
        document.body.appendChild(this.hudElement);
    }

    createStartScreen() {
        this.startScreenElement = document.createElement('div');
        this.startScreenElement.id = 'start-screen';
        this.startScreenElement.className = 'start-screen';
        this.startScreenElement.innerHTML = `
            <div class="start-content">
                <h1 class="game-title">Titanic Survival Prediction</h1>
                <p class="game-subtitle">Navigate the Titanic through treacherous waters</p>
                
                <div class="historical-info">
                    <p>April 14, 1912 - North Atlantic Ocean</p>
                    <p>Your mission: Guide the RMS Titanic safely through the iceberg field</p>
                </div>
                
                <div class="difficulty-selection">
                    <h3>Choose Difficulty</h3>
                    <button class="difficulty-btn" data-difficulty="Calm Seas">
                        <span class="difficulty-name">Calm Seas</span>
                        <span class="difficulty-desc">Clear visibility, few icebergs</span>
                    </button>
                    <button class="difficulty-btn" data-difficulty="Rough Waters">
                        <span class="difficulty-name">Rough Waters</span>
                        <span class="difficulty-desc">Moderate conditions, more icebergs</span>
                    </button>
                    <button class="difficulty-btn" data-difficulty="Perfect Storm">
                        <span class="difficulty-name">Perfect Storm</span>
                        <span class="difficulty-desc">Poor visibility, dense iceberg field</span>
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
        
        // Add event listeners for difficulty buttons
        this.startScreenElement.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const difficulty = e.currentTarget.dataset.difficulty;
                document.dispatchEvent(new CustomEvent('startGame', { detail: { difficulty } }));
            });
        });
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
        
        // Update survival prediction
        this.hudElement.querySelector('.survival-prediction .percentage').textContent = `${Math.round(survivalRate)}%`;
        
        const riskElement = this.hudElement.querySelector('.risk-level');
        riskElement.textContent = riskLevel.toUpperCase();
        riskElement.className = `risk-level ${riskLevel}`;
        
        // Update recommendations
        const actionList = this.hudElement.querySelector('.action-list');
        actionList.innerHTML = recommendations.map(action => `<div class="action">${action}</div>`).join('');
        
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