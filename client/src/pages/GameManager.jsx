import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TitanicShip } from "../components/TitanicShip.jsx";
import { IcebergField } from "../components/IcebergField.jsx";
import { Ocean } from "../components/Ocean.jsx";
import { AIPredictor } from "../components/AIPredictor.js";
import { GameUI } from "../components/GameUI.jsx";
import { AudioManager } from "../components/AudioManager.jsx";
import { InputController } from "../components/InputController.jsx";

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
    this.aiPredictor = null;
    this.gameUI = null;
    this.audioManager = null;
    this.inputController = null;

    // Game state
    this.gameState = "menu"; // menu, playing, gameOver
    this.difficulty = "Calm Seas";
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
    // ENHANCED LIGHTING FOR TITANIC MODEL VISIBILITY
    
    // Brighter ambient light to prevent blackness
    const ambientLight = new THREE.AmbientLight(0x6688aa, 0.6); // Increased intensity
    this.scene.add(ambientLight);

    // Main moonlight (directional)
    const moonLight = new THREE.DirectionalLight(0xaabbff, 1.2); // Brighter moonlight
    moonLight.position.set(100, 200, 100);
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.width = 2048;
    moonLight.shadow.mapSize.height = 2048;
    moonLight.shadow.camera.near = 0.1;
    moonLight.shadow.camera.far = 1000;
    moonLight.shadow.camera.left = -200;
    moonLight.shadow.camera.right = 200;
    moonLight.shadow.camera.top = 200;
    moonLight.shadow.camera.bottom = -200;
    this.scene.add(moonLight);
    
    // Additional fill light from the opposite side
    const fillLight = new THREE.DirectionalLight(0x4466aa, 0.4);
    fillLight.position.set(-100, 150, -100);
    this.scene.add(fillLight);
    
    // Hemisphere light for natural sky/ground lighting
    const hemisphereLight = new THREE.HemisphereLight(0x8899bb, 0x223344, 0.4);
    this.scene.add(hemisphereLight);
    
    // Point light following the ship for better visibility
    this.shipLight = new THREE.PointLight(0xffffff, 0.8, 100);
    this.shipLight.position.set(0, 30, 20); // Above and slightly behind ship
    this.scene.add(this.shipLight);
    
    console.log("🌟 Enhanced lighting setup complete - Titanic should be clearly visible!");
  }

  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      3000
    );
    this.camera.position.set(0, 30, 80); // Lower camera to see waves better
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

    // LOCK CAMERA MOVEMENT - Prevent backside view
    this.controls.maxPolarAngle = Math.PI / 2.2; // Prevent going too low
    this.controls.minPolarAngle = Math.PI / 6; // Prevent going too high

    // Restrict horizontal rotation to front and sides only
    this.controls.minAzimuthAngle = -Math.PI / 2; // Left side limit
    this.controls.maxAzimuthAngle = Math.PI / 2; // Right side limit

    // Limit zoom distance
    this.controls.minDistance = 30; // Don't get too close
    this.controls.maxDistance = 200; // Don't get too far

    // Disable panning to keep focus on ship
    this.controls.enablePan = false;

    // Set initial camera position for best view
    this.controls.target.set(0, 0, 0); // Look at ship center
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

    // Initialize AI predictor
    this.aiPredictor = new AIPredictor();

    // Initialize game UI
    this.gameUI = new GameUI();

    // Initialize audio manager
    this.audioManager = new AudioManager();

    // Initialize input controller
    this.inputController = new InputController(this.ship);
  }

  setupEventListeners() {
    window.addEventListener("resize", this.onWindowResize.bind(this));

    // Game UI event listeners
    document.addEventListener("startGame", () => {
      this.startGame();
    });

    document.addEventListener("restartGame", () => {
      this.restartGame();
    });
  }

  showStartScreen() {
    this.gameUI.showStartScreen();
    this.gameState = "menu";
  }

  startGame() {
    this.gameState = "playing";
    this.gameTime = 0;
    this.survivalRate = 100;

    // Set ship to fixed position
    this.ship.position.set(0, 0, 0); // Starting position
    
    // Set initial ship speed to make it move forward
    this.ship.speed = 18; // Set to max speed (18) as defined in TitanicShip constructor
    
    // Force reset velocity to ensure clean state
    this.ship.velocity.set(0, 0, 0);
    
    // Initialize ship velocity with a stronger forward momentum
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.ship.rotation);
    this.ship.velocity.copy(direction.multiplyScalar(this.ship.speed * 0.5)); // Increased multiplier from 0.1 to 0.5

    console.log('🚢 Starting game with ship velocity:', this.ship.velocity);

    this.gameUI.hideStartScreen();
    this.gameUI.showGameHUD();
    this.audioManager.playBackgroundMusic();
    this.inputController.enable();

    // Start the countdown to disaster
    this.startDisasterCountdown();
  }

  // showGameInstructions method removed - game starts immediately

  startDisasterCountdown() {
    // We're removing the countdown overlay but still need to check distance to iceberg
    this.checkFatalIcebergDistance();
  }

  checkFatalIcebergDistance() {
    if (this.gameState !== "playing") return;

    const fatalIceberg = this.icebergs.fatalIceberg;
    if (!fatalIceberg) return;

    const distanceToFatal = this.ship.position.distanceTo(
      fatalIceberg.position
    );

    // When iceberg is spotted (historically 500m away)
    if (distanceToFatal <= 500 && !this.icebergSpotted) {
      this.icebergSpotted = true;
      this.disasterCountdown = 37; // Historical 37 seconds
      // We're not showing the alert anymore
      // this.showIcebergSpottedAlert();
      this.startCountdownTimer();
    }

    // Check if player has successfully avoided the fatal iceberg
    if (
      this.icebergSpotted &&
      !this.fatalIcebergAvoided &&
      this.disasterCountdown <= 0
    ) {
      const safeDistance = fatalIceberg.size * 12; // Safe clearance distance
      if (distanceToFatal > safeDistance) {
        this.fatalIcebergAvoided = true;
        this.showHistoryChangedMessage();
      }
    }

    // Continue checking
    requestAnimationFrame(() => this.checkFatalIcebergDistance());
  }

  showHistoryChangedMessage() {
    const victoryMsg = document.createElement("div");
    victoryMsg.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 50, 0, 0.95);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-family: 'Times New Roman', serif;
        color: #ffffff;
        z-index: 3000;
        text-align: center;
    `;

    victoryMsg.innerHTML = `
        <div style="max-width: 800px; padding: 40px;">
            <h1 style="color: #00ff00; font-size: 4rem; margin-bottom: 2rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">
                🎉 HISTORY CHANGED! 🎉
            </h1>
            <div style="font-size: 1.8rem; line-height: 1.8; margin-bottom: 2rem; color: #66ff66;">
                <p><strong>Incredible! You've avoided the fatal iceberg!</strong></p>
                <p>The Titanic lives to sail another day!</p>
            </div>
            <div style="background: rgba(0, 255, 0, 0.2); padding: 20px; border-radius: 10px; margin-bottom: 2rem;">
                <h3 style="color: #66ff66; margin-bottom: 1rem;">ALTERNATIVE HISTORY</h3>
                <p style="font-size: 1.2rem;">Through skillful navigation, you've saved 2,224 lives.</p>
                <p style="font-size: 1.2rem;">The "unsinkable" ship proves its name true.</p>
                <p style="font-size: 1.2rem;">Families will be reunited in New York.</p>
            </div>
            <div style="background: rgba(255, 215, 0, 0.2); padding: 20px; border-radius: 10px; margin-bottom: 2rem;">
                <h3 style="color: #ffd700; margin-bottom: 1rem;">YOUR ACHIEVEMENT</h3>
                <p>You've demonstrated that with quick thinking and expert seamanship,</p>
                <p>even the most famous maritime disaster in history could have been avoided.</p>
                <p><strong>You are a true naval hero!</strong></p>
            </div>
            <div style="background: rgba(0, 0, 0, 0.5); padding: 20px; border-radius: 10px; margin-bottom: 2rem;">
                <h3 style="color: #cccccc; margin-bottom: 1rem;">WHAT MADE THE DIFFERENCE</h3>
                <p>• Quick reaction time and decisive action</p>
                <p>• Proper use of emergency maneuvers</p>
                <p>• Understanding of ship physics and momentum</p>
                <p>• Effective steering despite the ship's massive size</p>
            </div>
            <div style="font-size: 1.1rem; color: #cccccc;">
                <p>Continue navigating to reach New York safely...</p>
            </div>
        </div>
    `;

    document.body.appendChild(victoryMsg);

    // Play victory sound
    this.audioManager.playVictorySound();

    // Remove after 10 seconds
    setTimeout(() => {
      if (victoryMsg.parentNode) {
        victoryMsg.parentNode.removeChild(victoryMsg);
      }
      // Continue the game with a new objective
      this.startSafePassageMode();
    }, 10000);
  }

  startSafePassageMode() {
    // After avoiding the fatal iceberg, the game continues with a new objective
    const newObjective = document.createElement("div");
    newObjective.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 100, 0, 0.9);
        color: white;
        padding: 15px 30px;
        border: 2px solid #00ff00;
        border-radius: 10px;
        font-family: 'Times New Roman', serif;
        font-size: 1.2rem;
        font-weight: bold;
        text-align: center;
        z-index: 1000;
        box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
    `;

    newObjective.innerHTML = `
        <div>🎯 NEW OBJECTIVE</div>
        <div style="font-size: 1rem; margin-top: 5px;">Navigate safely through the remaining ice field</div>
        <div style="font-size: 0.9rem; margin-top: 5px; color: #ccffcc;">Destination: New York Harbor</div>
    `;

    document.body.appendChild(newObjective);

    // Remove objective message after 8 seconds
    setTimeout(() => {
      if (newObjective.parentNode) {
        newObjective.parentNode.removeChild(newObjective);
      }
    }, 8000);

    // Update win condition - now need to survive longer and maintain high survival rate
    this.fatalIcebergAvoided = true;
    this.newObjectiveActive = true;
  }

  showIcebergSpottedAlert() {
    // We're removing the iceberg alert
    // No need to play alarm sound either
    // this.audioManager.playWarningAlarm();
  }

  startCountdownTimer() {
    // We're removing the countdown timer display
    // But we still need to decrease the countdown value for game logic
    const updateCountdown = () => {
      if (this.gameState !== "playing" || this.disasterCountdown <= 0) {
        return;
      }

      this.disasterCountdown -= 0.1;
      setTimeout(updateCountdown, 100);
    };

    updateCountdown();
  }

  restartGame() {
    this.gameState = "menu";
    this.ship.reset();
    this.icebergs.reset();
    this.survivalRate = 100;
    this.gameTime = 0;
    this.showStartScreen();
    this.audioManager.stopAll();
    this.inputController.disable();
  }

  update(deltaTime) {
    if (this.gameState !== "playing") return;

    this.gameTime += deltaTime;

    // Update game objects
    this.inputController.update(deltaTime);
    
    // Ensure ship always has forward momentum
    if (this.ship.speed < 1) {
      this.ship.speed = 18; // Reset to max speed if it somehow got reduced to near zero
      
      // Recalculate velocity based on current rotation
      const direction = new THREE.Vector3(0, 0, -1);
      direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.ship.rotation);
      this.ship.velocity.copy(direction.multiplyScalar(this.ship.speed * 0.5));
      
      console.log('🚢 Corrected ship movement:', { speed: this.ship.speed, velocity: this.ship.velocity });
    }
    
    this.ship.update(deltaTime);

    // Update ocean with ship wake effects
    this.ocean.update(deltaTime, this.ship.position, this.ship.velocity);

    this.icebergs.update(deltaTime);

    // AI prediction system
    const prediction = this.aiPredictor.predict(
      this.ship.position,
      this.ship.velocity,
      this.icebergs.getPositions(),
      this.difficulty
    );

    this.survivalRate = prediction.survivalPercentage;

    // Update UI
    this.gameUI.updateHUD({
      survivalRate: this.survivalRate,
      riskLevel: prediction.riskLevel,
      recommendations: prediction.recommendations,
      shipStatus: this.ship.getStatus(),
      gameTime: this.gameTime,
    });

    // Check collision
    if (this.checkCollisions()) {
      this.gameOver(false);
    }

    // Check win condition
    if (this.gameTime > 300 && this.survivalRate > 50) {
      // 5 minutes survival
      this.gameOver(true);
    }

    // Update camera to follow ship
    this.updateCamera();
    
    // Update ship light to follow the Titanic model
    if (this.shipLight && this.ship) {
      this.shipLight.position.set(
        this.ship.position.x,
        this.ship.position.y + 30,
        this.ship.position.z + 20
      );
    }
  }

  checkCollisions() {
    const collision = this.icebergs.checkCollisionWithShip(
      this.ship.position,
      this.ship.boundingBox
    );

    // Special handling for fatal iceberg collision
    if (collision && this.icebergs.fatalIceberg) {
      const fatalDistance = this.ship.position.distanceTo(
        this.icebergs.fatalIceberg.position
      );
      const fatalRadius = this.icebergs.fatalIceberg.size * 8;

      if (fatalDistance <= fatalRadius) {
        this.hitFatalIceberg();
        return true;
      }
    }

    return collision;
  }

  hitFatalIceberg() {
    // Recreate the historical disaster
    this.showDisasterMessage();

    // Create dramatic collision effects
    this.createCollisionEffects();
  }

  showDisasterMessage() {
    const disasterMsg = document.createElement("div");
    disasterMsg.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-family: 'Times New Roman', serif;
        color: #ffffff;
        z-index: 3000;
        text-align: center;
    `;

    disasterMsg.innerHTML = `
        <div style="max-width: 800px; padding: 40px;">
            <h1 style="color: #ff0000; font-size: 4rem; margin-bottom: 2rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">
                💥 COLLISION! 💥
            </h1>
            <div style="font-size: 1.8rem; line-height: 1.8; margin-bottom: 2rem; color: #ff6666;">
                <p><strong>The ship has struck the iceberg!</strong></p>
                <p>History repeats itself...</p>
            </div>
            <div style="background: rgba(255, 0, 0, 0.3); padding: 20px; border-radius: 10px; margin-bottom: 2rem;">
                <h3 style="color: #ff6666; margin-bottom: 1rem;">HISTORICAL OUTCOME</h3>
                <p style="font-size: 1.2rem;">The iceberg's underwater ram has punctured the hull.</p>
                <p style="font-size: 1.2rem;">Water is flooding the forward compartments.</p>
                <p style="font-size: 1.2rem;">The "unsinkable" ship is doomed.</p>
            </div>
            <div style="background: rgba(0, 0, 0, 0.5); padding: 20px; border-radius: 10px; margin-bottom: 2rem;">
                <h3 style="color: #ffd700; margin-bottom: 1rem;">WHAT HAPPENED</h3>
                <p>Despite your efforts, the massive ship's momentum and the iceberg's deadly underwater ram proved fatal.</p>
                <p>This demonstrates the incredible challenge faced by the actual Titanic officers in 1912.</p>
            </div>
            <div style="font-size: 1.1rem; color: #cccccc;">
                <p>The disaster will unfold over the next few hours...</p>
            </div>
        </div>
    `;

    document.body.appendChild(disasterMsg);

    // Remove after 8 seconds and proceed to game over
    setTimeout(() => {
      if (disasterMsg.parentNode) {
        disasterMsg.parentNode.removeChild(disasterMsg);
      }
    }, 8000);
  }

  createCollisionEffects() {
    // Add dramatic visual and audio effects for the collision
    const canvas = this.renderer.domElement;

    // Screen shake effect
    let shakeIntensity = 20;
    const shakeEffect = () => {
      if (shakeIntensity > 0) {
        canvas.style.transform = `translate(${
          (Math.random() - 0.5) * shakeIntensity
        }px, ${(Math.random() - 0.5) * shakeIntensity}px)`;
        shakeIntensity *= 0.9;
        setTimeout(shakeEffect, 50);
      } else {
        canvas.style.transform = "translate(0, 0)";
      }
    };
    shakeEffect();

    // Flash effect
    const flashOverlay = document.createElement("div");
    flashOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(255, 255, 255, 0.8);
        z-index: 2500;
        pointer-events: none;
        animation: collisionFlash 1s ease-out;
    `;

    const flashStyle = document.createElement("style");
    flashStyle.textContent = `
        @keyframes collisionFlash {
            0% { opacity: 1; }
            100% { opacity: 0; }
        }
    `;
    document.head.appendChild(flashStyle);
    document.body.appendChild(flashOverlay);

    setTimeout(() => {
      if (flashOverlay.parentNode)
        flashOverlay.parentNode.removeChild(flashOverlay);
      if (flashStyle.parentNode) flashStyle.parentNode.removeChild(flashStyle);
    }, 1000);
  }

  updateCamera() {
    const shipPosition = this.ship.position;
    
    // Update camera target to follow ship
    this.controls.target.copy(shipPosition);
    
    // ALSO UPDATE CAMERA POSITION to follow behind the ship
    const cameraOffset = new THREE.Vector3(0, 30, 80); // Behind and above the ship
    const newCameraPosition = shipPosition.clone().add(cameraOffset);
    
    // Smoothly move camera to follow ship
    this.camera.position.lerp(newCameraPosition, 0.05);
    
    console.log('📷 CAMERA UPDATE:', { 
      shipPos: shipPosition.clone(), 
      cameraPos: this.camera.position.clone(),
      target: this.controls.target.clone()
    });
  }

  gameOver(survived) {
    this.gameState = "gameOver";
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
      difficulty: this.difficulty,
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
