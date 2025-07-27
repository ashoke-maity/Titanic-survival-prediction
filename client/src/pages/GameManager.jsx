import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TitanicShip } from '../components/TitanicShip.jsx';
import { IcebergField } from '../components/IcebergField.jsx';
import { Ocean } from '../components/Ocean.jsx';
import { GameUI } from '../components/GameUI.jsx';
import { AudioManager } from '../components/AudioManager.jsx';
import { InputController } from '../components/InputController.jsx';

export class GameManager {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        // Game objects
        this.ship = null;
        this.icebergs = null;
        this.ocean = null;
        this.gameUI = null;
        this.audioManager = null;
        this.inputController = null;
        
        // Game state
        this.gameState = 'menu'; // menu, playing, gameOver
        this.difficulty = 'Calm Seas';
        this.survivalRate = 100;
        this.gameTime = 0;
        
        // Animation
        this.clock = new THREE.Clock();
        this.animationId = null;
    }

    init() {
        this.setupScene();
        this.setupLighting();
        this.setupCamera();
        this.setupRenderer();
        this.setupControls();
        this.createGameObjects();
        this.setupEventListeners();
        this.showStartScreen();
        this.animate();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x000033, 50, 2000);
    }

    setupLighting() {
        // Ambient moonlight
        const ambientLight = new THREE.AmbientLight(0x404080, 0.3);
        this.scene.add(ambientLight);

        // Moonlight
        const moonLight = new THREE.DirectionalLight(0x8888ff, 0.8);
        moonLight.position.set(100, 200, 100);
        moonLight.castShadow = true;
        moonLight.shadow.mapSize.width = 2048;
        moonLight.shadow.mapSize.height = 2048;
        this.scene.add(moonLight);
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            3000
        );
        this.camera.position.set(0, 50, 100);
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000033);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);
    }

    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI / 2;
    }

    createGameObjects() {
        // Create ocean
        this.ocean = new Ocean();
        this.scene.add(this.ocean.mesh);

        // Create Titanic ship
        this.ship = new TitanicShip();
        this.scene.add(this.ship.group);

        // Create iceberg field
        this.icebergs = new IcebergField();
        this.icebergs.generateField();
        this.scene.add(this.icebergs.group);

        // AI predictor removed for frontend focus

        // Initialize game UI
        this.gameUI = new GameUI();

        // Initialize audio manager
        this.audioManager = new AudioManager();

        // Initialize input controller
        this.inputController = new InputController(this.ship);
    }

    setupEventListeners() {
        window.addEventListener('resize', this.onWindowResize.bind(this));
        
        // Game UI event listeners
        document.addEventListener('startGame', (e) => {
            this.startGame(e.detail.difficulty);
        });
        
        document.addEventListener('restartGame', () => {
            this.restartGame();
        });
    }

    showStartScreen() {
        this.gameUI.showStartScreen();
        this.gameState = 'menu';
    }

    startGame(difficulty = 'Calm Seas') {
        this.difficulty = difficulty;
        this.gameState = 'playing';
        this.gameTime = 0;
        this.survivalRate = 100;
        
        this.gameUI.hideStartScreen();
        this.gameUI.showGameHUD();
        this.audioManager.playBackgroundMusic();
        this.inputController.enable();
    }

    restartGame() {
        this.gameState = 'menu';
        this.ship.reset();
        this.icebergs.reset();
        this.survivalRate = 100;
        this.gameTime = 0;
        this.showStartScreen();
        this.audioManager.stopAll();
        this.inputController.disable();
    }

    update(deltaTime) {
        if (this.gameState !== 'playing') return;

        this.gameTime += deltaTime;

        // Update game objects
        this.ship.update(deltaTime);
        this.ocean.update(deltaTime);
        this.icebergs.update(deltaTime);

        // Simple survival calculation for frontend
        const nearestIcebergs = this.icebergs.getNearestIcebergs(this.ship.position, 3);
        const minDistance = nearestIcebergs.length > 0 ? nearestIcebergs[0].distance : 1000;
        
        // Basic survival rate calculation
        this.survivalRate = Math.max(10, Math.min(100, (minDistance / 50) * 100));
        
        const riskLevel = minDistance < 20 ? 'critical' : minDistance < 50 ? 'danger' : minDistance < 100 ? 'caution' : 'safe';
        const recommendations = minDistance < 30 ? ['Turn away from iceberg', 'Reduce speed'] : ['Maintain course'];

        // Update UI
        this.gameUI.updateHUD({
            survivalRate: this.survivalRate,
            riskLevel: riskLevel,
            recommendations: recommendations,
            shipStatus: this.ship.getStatus(),
            gameTime: this.gameTime
        });

        // Check collision
        if (this.checkCollisions()) {
            this.gameOver(false);
        }

        // Check win condition
        if (this.gameTime > 300 && this.survivalRate > 50) { // 5 minutes survival
            this.gameOver(true);
        }

        // Update camera to follow ship
        this.updateCamera();
    }

    checkCollisions() {
        return this.icebergs.checkCollisionWithShip(this.ship.position, this.ship.boundingBox);
    }

    updateCamera() {
        const shipPosition = this.ship.position;
        this.controls.target.copy(shipPosition);
    }

    gameOver(survived) {
        this.gameState = 'gameOver';
        this.inputController.disable();
        this.audioManager.stopBackgroundMusic();
        
        if (survived) {
            this.audioManager.playVictorySound();
        } else {
            this.audioManager.playCollisionSound();
            this.ship.startSinking();
        }

        this.gameUI.showGameOverScreen({
            survived,
            finalSurvivalRate: this.survivalRate,
            gameTime: this.gameTime,
            difficulty: this.difficulty
        });
    }

    animate() {
        this.animationId = requestAnimationFrame(this.animate.bind(this));
        
        const deltaTime = this.clock.getDelta();
        
        this.update(deltaTime);
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    dispose() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.audioManager?.dispose();
        this.inputController?.dispose();
        this.gameUI?.dispose();
        this.renderer?.dispose();
    }
}