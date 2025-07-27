export class GameUI {
    constructor() {
        this.hudElements = {};
        this.menuElements = {};
        this.isVisible = false;
        
        this.createStartScreen();
        this.createGameHUD();
        this.createGameOverScreen();
    }

    createStartScreen() {
        const startScreen = document.createElement('div');
        startScreen.id = 'startScreen';
        startScreen.style.cssText = `
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
        `;

        // Title
        const title = document.createElement('h1');
        title.textContent = 'TITANIC SURVIVAL PREDICTION';
        title.style.cssText = `
            font-size: 3rem;
            margin-bottom: 1rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            letter-spacing: 3px;
        `;

        // Subtitle
        const subtitle = document.createElement('h2');
        subtitle.textContent = 'Navigate Through the Ice Field';
        subtitle.style.cssText = `
            font-size: 1.5rem;
            margin-bottom: 3rem;
            color: #cccccc;
            font-weight: normal;
        `;

        // Difficulty selection
        const difficultyContainer = document.createElement('div');
        difficultyContainer.style.cssText = `
            display: flex;
            gap: 2rem;
            margin-bottom: 3rem;
        `;

        const difficulties = ['Calm Seas', 'Rough Waters', 'Perfect Storm'];
        difficulties.forEach(difficulty => {
            const button = document.createElement('button');
            button.textContent = difficulty;
            button.className = 'difficulty-btn';
            button.dataset.difficulty = difficulty;
            button.style.cssText = `
                padding: 1rem 2rem;
                font-size: 1.2rem;
                background: rgba(255,255,255,0.1);
                border: 2px solid #ffffff;
                color: #ffffff;
                cursor: pointer;
                transition: all 0.3s ease;
                font-family: 'Times New Roman', serif;
            `;

            button.addEventListener('mouseenter', () => {
                button.style.background = 'rgba(255,255,255,0.2)';
                button.style.transform = 'scale(1.05)';
            });

            button.addEventListener('mouseleave', () => {
                button.style.background = 'rgba(255,255,255,0.1)';
                button.style.transform = 'scale(1)';
            });

            button.addEventListener('click', () => {
                this.startGame(difficulty);
            });

            difficultyContainer.appendChild(button);
        });

        // Instructions
        const instructions = document.createElement('div');
        instructions.style.cssText = `
            max-width: 600px;
            text-align: center;
            line-height: 1.6;
            color: #cccccc;
            font-size: 1.1rem;
        `;
        instructions.innerHTML = `
            <p><strong>Controls:</strong></p>
            <p>WASD or Arrow Keys - Navigate the ship</p>
            <p>Mouse - Camera control</p>
            <p><strong>Objective:</strong> Avoid icebergs while the AI predicts your survival chances</p>
        `;

        startScreen.appendChild(title);
        startScreen.appendChild(subtitle);
        startScreen.appendChild(difficultyContainer);
        startScreen.appendChild(instructions);

        document.body.appendChild(startScreen);
        this.menuElements.startScreen = startScreen;
    }

    createGameHUD() {
        // Survival Prediction Panel (top-right)
        const survivalPanel = document.createElement('div');
        survivalPanel.id = 'survivalPanel';
        survivalPanel.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 300px;
            background: rgba(0,20,40,0.9);
            border: 2px solid #4a90e2;
            border-radius: 10px;
            padding: 20px;
            font-family: 'Times New Roman', serif;
            color: #ffffff;
            display: none;
            z-index: 100;
        `;

        survivalPanel.innerHTML = `
            <div style="text-align: center; margin-bottom: 15px;">
                <h3 style="margin: 0; color: #4a90e2;">SURVIVAL PREDICTION</h3>
            </div>
            <div style="text-align: center; margin-bottom: 15px;">
                <div id="survivalRate" style="font-size: 3rem; font-weight: bold; color: #00ff00;">100%</div>
            </div>
            <div style="margin-bottom: 10px;">
                <div>Risk Level: <span id="riskLevel" style="font-weight: bold;">SAFE</span></div>
            </div>
            <div style="margin-bottom: 10px;">
                <div>Time to Decision: <span id="timeToDecision">--</span></div>
            </div>
            <div>
                <div style="margin-bottom: 5px;">Recommended Actions:</div>
                <div id="recommendations" style="font-style: italic; color: #cccccc;">Maintain course</div>
            </div>
        `;

        // Ship Status Panel (bottom-left)
        const shipPanel = document.createElement('div');
        shipPanel.id = 'shipPanel';
        shipPanel.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            width: 250px;
            background: rgba(40,20,0,0.9);
            border: 2px solid #e2904a;
            border-radius: 10px;
            padding: 15px;
            font-family: 'Times New Roman', serif;
            color: #ffffff;
            display: none;
            z-index: 100;
        `;

        shipPanel.innerHTML = `
            <div style="text-align: center; margin-bottom: 10px;">
                <h4 style="margin: 0; color: #e2904a;">SHIP STATUS</h4>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.9rem;">
                <div>Speed: <span id="shipSpeed">0</span> kts</div>
                <div>Heading: <span id="shipHeading">0</span>°</div>
                <div>Engine: <span id="engineStatus">Running</span></div>
                <div>Damage: <span id="shipDamage">0</span>%</div>
                <div colspan="2">Crew Morale: <span id="crewMorale">100</span>%</div>
            </div>
        `;

        // Mini Map (top-left)
        const miniMap = document.createElement('div');
        miniMap.id = 'miniMap';
        miniMap.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            width: 200px;
            height: 200px;
            background: rgba(0,0,0,0.8);
            border: 2px solid #ffffff;
            border-radius: 10px;
            display: none;
            z-index: 100;
        `;

        const miniMapCanvas = document.createElement('canvas');
        miniMapCanvas.width = 196;
        miniMapCanvas.height = 196;
        miniMapCanvas.style.cssText = `
            width: 100%;
            height: 100%;
            border-radius: 8px;
        `;
        miniMap.appendChild(miniMapCanvas);

        document.body.appendChild(survivalPanel);
        document.body.appendChild(shipPanel);
        document.body.appendChild(miniMap);

        this.hudElements = {
            survivalPanel,
            shipPanel,
            miniMap,
            miniMapCanvas,
            survivalRate: document.getElementById('survivalRate'),
            riskLevel: document.getElementById('riskLevel'),
            timeToDecision: document.getElementById('timeToDecision'),
            recommendations: document.getElementById('recommendations'),
            shipSpeed: document.getElementById('shipSpeed'),
            shipHeading: document.getElementById('shipHeading'),
            engineStatus: document.getElementById('engineStatus'),
            shipDamage: document.getElementById('shipDamage'),
            crewMorale: document.getElementById('crewMorale')
        };
    }

    createGameOverScreen() {
        const gameOverScreen = document.createElement('div');
        gameOverScreen.id = 'gameOverScreen';
        gameOverScreen.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0,0,0,0.9);
            display: none;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-family: 'Times New Roman', serif;
            color: #ffffff;
            z-index: 1000;
        `;

        gameOverScreen.innerHTML = `
            <div style="text-align: center; max-width: 600px;">
                <h1 id="gameOverTitle" style="font-size: 3rem; margin-bottom: 2rem;">VOYAGE COMPLETE</h1>
                <div id="gameOverStats" style="font-size: 1.2rem; line-height: 2; margin-bottom: 3rem;">
                    <div>Final Survival Rate: <span id="finalSurvivalRate">--</span>%</div>
                    <div>Voyage Duration: <span id="voyageDuration">--</span></div>
                    <div>Difficulty: <span id="finalDifficulty">--</span></div>
                </div>
                <div id="historicalComparison" style="margin-bottom: 3rem; padding: 20px; background: rgba(255,255,255,0.1); border-radius: 10px;">
                    <h3>Historical Comparison</h3>
                    <p id="comparisonText">--</p>
                </div>
                <button id="restartBtn" style="
                    padding: 1rem 3rem;
                    font-size: 1.5rem;
                    background: rgba(255,255,255,0.1);
                    border: 2px solid #ffffff;
                    color: #ffffff;
                    cursor: pointer;
                    font-family: 'Times New Roman', serif;
                    transition: all 0.3s ease;
                ">Try Again</button>
            </div>
        `;

        const restartBtn = gameOverScreen.querySelector('#restartBtn');
        restartBtn.addEventListener('mouseenter', () => {
            restartBtn.style.background = 'rgba(255,255,255,0.2)';
            restartBtn.style.transform = 'scale(1.05)';
        });

        restartBtn.addEventListener('mouseleave', () => {
            restartBtn.style.background = 'rgba(255,255,255,0.1)';
            restartBtn.style.transform = 'scale(1)';
        });

        restartBtn.addEventListener('click', () => {
            this.restartGame();
        });

        document.body.appendChild(gameOverScreen);
        this.menuElements.gameOverScreen = gameOverScreen;
    }

    showStartScreen() {
        this.menuElements.startScreen.style.display = 'flex';
        this.hideGameHUD();
        this.hideGameOverScreen();
    }

    hideStartScreen() {
        this.menuElements.startScreen.style.display = 'none';
    }

    showGameHUD() {
        this.hudElements.survivalPanel.style.display = 'block';
        this.hudElements.shipPanel.style.display = 'block';
        this.hudElements.miniMap.style.display = 'block';
        this.isVisible = true;
    }

    hideGameHUD() {
        this.hudElements.survivalPanel.style.display = 'none';
        this.hudElements.shipPanel.style.display = 'none';
        this.hudElements.miniMap.style.display = 'none';
        this.isVisible = false;
    }

    showGameOverScreen(data) {
        const { survived, finalSurvivalRate, gameTime, difficulty } = data;
        
        const title = document.getElementById('gameOverTitle');
        title.textContent = survived ? 'VOYAGE SUCCESSFUL!' : 'DISASTER STRUCK';
        title.style.color = survived ? '#00ff00' : '#ff0000';

        document.getElementById('finalSurvivalRate').textContent = Math.round(finalSurvivalRate);
        document.getElementById('voyageDuration').textContent = this.formatTime(gameTime);
        document.getElementById('finalDifficulty').textContent = difficulty;

        // Historical comparison
        const comparisonText = document.getElementById('comparisonText');
        if (survived && finalSurvivalRate > 70) {
            comparisonText.textContent = 'Excellent navigation! You performed much better than the historical Titanic voyage.';
        } else if (finalSurvivalRate > 30) {
            comparisonText.textContent = 'Good effort! Your survival rate was higher than the actual Titanic disaster (32%).';
        } else {
            comparisonText.textContent = 'Similar outcome to the historical Titanic. The North Atlantic proved treacherous.';
        }

        this.menuElements.gameOverScreen.style.display = 'flex';
    }

    hideGameOverScreen() {
        this.menuElements.gameOverScreen.style.display = 'none';
    }

    updateHUD(data) {
        if (!this.isVisible) return;

        const { survivalRate, riskLevel, recommendations, shipStatus, gameTime } = data;

        // Update survival prediction
        this.hudElements.survivalRate.textContent = Math.round(survivalRate) + '%';
        this.hudElements.survivalRate.style.color = this.getSurvivalColor(survivalRate);
        
        this.hudElements.riskLevel.textContent = riskLevel.toUpperCase();
        this.hudElements.riskLevel.style.color = this.getRiskColor(riskLevel);
        
        this.hudElements.recommendations.textContent = recommendations.join(', ');

        // Update ship status
        this.hudElements.shipSpeed.textContent = Math.round(shipStatus.speed);
        this.hudElements.shipHeading.textContent = Math.round(shipStatus.heading);
        this.hudElements.engineStatus.textContent = shipStatus.engineStatus;
        this.hudElements.shipDamage.textContent = Math.round(shipStatus.damage);
        this.hudElements.crewMorale.textContent = Math.round(shipStatus.crewMorale);

        // Update mini map
        this.updateMiniMap(shipStatus.position);
    }

    updateMiniMap(shipPosition) {
        const canvas = this.hudElements.miniMapCanvas;
        const ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.fillStyle = 'rgba(0,0,50,1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
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
        
        // Draw ship (center)
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(canvas.width/2 - 2, canvas.height/2 - 2, 4, 4);
        
        // Draw compass
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(canvas.width - 30, 30, 20, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('N', canvas.width - 30, 20);
    }

    getSurvivalColor(rate) {
        if (rate >= 80) return '#00ff00';
        if (rate >= 60) return '#ffff00';
        if (rate >= 30) return '#ff8800';
        return '#ff0000';
    }

    getRiskColor(level) {
        switch (level) {
            case 'safe': return '#00ff00';
            case 'caution': return '#ffff00';
            case 'danger': return '#ff8800';
            case 'critical': return '#ff0000';
            default: return '#ffffff';
        }
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    startGame(difficulty) {
        const event = new CustomEvent('startGame', { detail: { difficulty } });
        document.dispatchEvent(event);
    }

    restartGame() {
        const event = new CustomEvent('restartGame');
        document.dispatchEvent(event);
    }

    dispose() {
        // Remove all UI elements
        Object.values(this.hudElements).forEach(element => {
            if (element && element.remove) element.remove();
        });
        
        Object.values(this.menuElements).forEach(element => {
            if (element && element.remove) element.remove();
        });
    }
}