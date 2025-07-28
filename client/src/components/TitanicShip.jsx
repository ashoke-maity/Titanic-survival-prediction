import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

export class TitanicShip {
    constructor() {
        this.group = new THREE.Group();
        this.position = new THREE.Vector3(0, 0, 0);
        this.velocity = new THREE.Vector3(0, 0, -9); // Initialize with stronger forward velocity (half of max speed)
        this.rotation = 0;
        this.speed = 18; // Fixed speed - cannot be changed
        this.maxSpeed = 18; // Fixed maximum speed
        this.acceleration = 0; // No acceleration allowed
        
        // REALISTIC TITANIC STEERING MECHANICS
        this.baseTurnSpeed = 0.3; // Much slower base turning
        this.steeringDelay = 0.8; // Delay before steering takes effect (seconds)
        this.steeringInput = 0; // Current steering input (-1 to 1)
        this.actualSteering = 0; // Actual steering being applied
        this.steeringMomentum = 0; // Steering momentum for realistic feel
        this.rudderAngle = 0; // Visual rudder angle
        this.maxRudderAngle = Math.PI / 6; // 30 degrees max
        
        // Historical Titanic specifications
        this.length = 269; // meters (actual Titanic length)
        this.mass = 52310; // tons (actual Titanic mass)
        this.turningRadius = 1200; // meters at full speed (historically accurate)
        this.stoppingDistance = 3000; // meters from full speed
        
        // Emergency maneuver capabilities
        this.emergencyTurnMultiplier = 1.5; // Can turn faster in emergency
        this.emergencyActive = false;
        this.emergencyDuration = 0;
        this.maxEmergencyTime = 10; // seconds
        
        this.boundingBox = new THREE.Box3();
        
        // Ship status
        this.damage = 0;
        this.engineStatus = 'running';
        this.crewMorale = 100;
        this.sinking = false;
        
        // Historical context
        this.historicalSpeed = 22.5; // knots - Titanic's speed when it hit the iceberg
        this.timeToReact = 37; // seconds - actual time from iceberg spotting to impact
        
        this.loadTitanicModel();
        this.createLights();
    }

    loadTitanicModel() {
        const loader = new OBJLoader();
        const textureLoader = new THREE.TextureLoader();
        
        // Load your custom Titanic texture first
        console.log('🎨 Loading Titanic texture...');
        textureLoader.load(
            '/penup_20230701_205028.jpeg',
            (texture) => {
                console.log('✅ Titanic texture loaded successfully!');
                
                // Configure texture settings for best appearance
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.flipY = false; // Important for OBJ models
                
                // Now load the 3D model with the texture
                loader.load(
                    '/Titanic textured (8).obj',
                    (object) => {
                        console.log('✅ Titanic 3D model loaded successfully!');
                        
                        // Scale the model to MASSIVE size - Make it impressive!
                        object.scale.set(0.2, 0.2, 0.2); // Much bigger scale for dramatic presence
                        
                        // Position the model at the origin of the group (it will move with the group)
                        object.position.set(0, 0, 0); // Position at group origin
                        
                        // Rotate the model to face forward (bow pointing toward -Z)
                        object.rotation.x = 0;
                        object.rotation.y = -Math.PI / 2; // -90 degrees rotation
                        object.rotation.z = 0;
                        
                        // Store reference for easy rotation adjustment
                        window.titanicModel = object; // Access via browser console
                        
                        console.log('🔧 Titanic model rotation controls:');
                        console.log('   titanicModel.rotation.y = 0        (no rotation)');
                        console.log('   titanicModel.rotation.y = Math.PI/2  (90° right)');
                        console.log('   titanicModel.rotation.y = Math.PI    (180° back)');
                        console.log('   titanicModel.rotation.y = -Math.PI/2 (90° left)');
                        console.log('🎮 Use browser console to adjust rotation in real-time!');
                        
                        // DEBUG: Log all mesh parts to understand the structure
                        console.log('🔍 Analyzing Titanic model structure:');
                        let meshCount = 0;
                        
                        // Apply colors: BLACK body, YELLOW exhaust pipes, BLACK pipe tops
                        object.traverse((child) => {
                            if (child.isMesh) {
                                meshCount++;
                                const boundingBox = new THREE.Box3().setFromObject(child);
                                const size = boundingBox.getSize(new THREE.Vector3());
                                const center = boundingBox.getCenter(new THREE.Vector3());
                                
                                console.log(`Mesh ${meshCount}:`, {
                                    name: child.name || 'unnamed',
                                    position: center,
                                    size: size,
                                    vertices: child.geometry.attributes.position?.count || 0,
                                    faces: child.geometry.index ? child.geometry.index.count / 3 : 'no index'
                                });
                                
                                // Use the already calculated boundingBox, size, and center for material assignment
                                
                                let material;
                                
                                // Check if it's an exhaust pipe/funnel (tall, cylindrical objects)
                                if (size.y > size.x && size.y > size.z && center.y > 0 && size.y > 10) {
                                    // This is likely a funnel/exhaust pipe
                                    
                                    if (center.y > size.y * 0.7) {
                                        // Top part of pipe - BLACK
                                        material = new THREE.MeshPhongMaterial({
                                            color: 0x000000, // Black pipe tops
                                            shininess: 30,
                                            specular: 0x444444,
                                            emissive: 0x111111,
                                            emissiveIntensity: 0.05
                                        });
                                        console.log('🖤 Applied BLACK to pipe top');
                                    } else {
                                        // Main pipe body - YELLOW (from your texture colors)
                                        material = new THREE.MeshPhongMaterial({
                                            color: 0xffcc33, // Yellow exhaust pipes (golden yellow from typical Titanic colors)
                                            shininess: 40,
                                            specular: 0x666633,
                                            emissive: 0x332211,
                                            emissiveIntensity: 0.08
                                        });
                                        console.log('💛 Applied YELLOW to exhaust pipe');
                                    }
                                }
                                // Everything else - BLACK BODY
                                else {
                                    // BLACK hull/body
                                    material = new THREE.MeshPhongMaterial({
                                        color: 0x1a1a1a, // BLACK side body
                                        shininess: 25,
                                        specular: 0x333333,
                                        emissive: 0x111111,
                                        emissiveIntensity: 0.05
                                    });
                                }
                                
                                child.material = material;
                                
                                // FIX COMMON OBJ ISSUES
                                
                                // 1. Fix face orientation (normals)
                                if (child.geometry.attributes.normal) {
                                    child.geometry.computeVertexNormals();
                                }
                                
                                // 2. Ensure double-sided rendering for hollow parts
                                child.material.side = THREE.DoubleSide;
                                
                                // 3. Force geometry update
                                child.geometry.computeBoundingBox();
                                child.geometry.computeBoundingSphere();
                                
                                // 4. Make sure it's visible
                                child.visible = true;
                                child.frustumCulled = false; // Prevent culling issues
                                
                                // Enable shadows
                                child.castShadow = true;
                                child.receiveShadow = true;
                                
                                console.log(`✅ Applied material and fixes to mesh ${meshCount}`);
                            }
                        });
                        
                        // Add the loaded model to the ship group
                        this.group.add(object);
                        this.titanicModel = object;
                        
                        // Update bounding box after model is loaded
                        this.updateBoundingBox();
                        
                        console.log('🚢 Your custom textured Titanic model is now in the game!');
                        console.log('🎨 Custom texture applied successfully!');
                    },
                    (progress) => {
                        console.log('Loading Titanic model...', (progress.loaded / progress.total * 100) + '%');
                    },
                    (error) => {
                        console.error('❌ Error loading Titanic model:', error);
                        console.log('🔄 Falling back to procedural ship...');
                        // Fallback to procedural ship if model fails to load
                        this.createShip();
                    }
                );
            },
            (progress) => {
                console.log('Loading texture...', (progress.loaded / progress.total * 100) + '%');
            },
            (error) => {
                console.error('❌ Error loading Titanic texture:', error);
                console.log('🔄 Loading model without custom texture...');
                
                // Fallback: Load model without texture
                this.loadModelWithoutTexture();
            }
        );
    }

    loadModelWithoutTexture() {
        const loader = new OBJLoader();
        
        // Load model with default material if texture fails
        loader.load(
            '/Titanic textured (8).obj',
            (object) => {
                console.log('✅ Titanic 3D model loaded (without custom texture)');
                
                object.scale.set(0.2, 0.2, 0.2);
                object.position.set(0, 2, 0);
                object.rotation.x = 0;
                object.rotation.y = -Math.PI / 2;
                object.rotation.z = 0;
                
                window.titanicModel = object;
                
                // Apply default enhanced material
                object.traverse((child) => {
                    if (child.isMesh) {
                        child.material = new THREE.MeshPhongMaterial({
                            color: 0x666666,
                            shininess: 50,
                            specular: 0x444444,
                            emissive: 0x111111,
                            emissiveIntensity: 0.1
                        });
                        
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                
                this.group.add(object);
                this.titanicModel = object;
                this.updateBoundingBox();
                
                console.log('🚢 Titanic model loaded with default material');
            },
            undefined,
            (error) => {
                console.error('❌ Error loading Titanic model:', error);
                this.createShip();
            }
        );
    }

    createShip() {
        // Main hull
        const hullGeometry = new THREE.BoxGeometry(8, 3, 40);
        const hullMaterial = new THREE.MeshLambertMaterial({ color: 0x2c2c2c });
        const hull = new THREE.Mesh(hullGeometry, hullMaterial);
        hull.position.y = 1;
        this.group.add(hull);

        // Upper decks
        const deckGeometry = new THREE.BoxGeometry(6, 1, 35);
        const deckMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        
        for (let i = 0; i < 4; i++) {
            const deck = new THREE.Mesh(deckGeometry, deckMaterial);
            deck.position.y = 3 + i * 2;
            deck.scale.x = 1 - i * 0.1;
            deck.scale.z = 1 - i * 0.05;
            this.group.add(deck);
        }

        // Funnels (4 iconic smokestacks)
        const funnelGeometry = new THREE.CylinderGeometry(0.8, 1, 8);
        const funnelMaterial = new THREE.MeshLambertMaterial({ color: 0xff6600 });
        
        const funnelPositions = [-10, -3, 4, 11];
        funnelPositions.forEach(z => {
            const funnel = new THREE.Mesh(funnelGeometry, funnelMaterial);
            funnel.position.set(0, 8, z);
            this.group.add(funnel);
        });

        // Bridge
        const bridgeGeometry = new THREE.BoxGeometry(4, 2, 6);
        const bridgeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const bridge = new THREE.Mesh(bridgeGeometry, bridgeMaterial);
        bridge.position.set(0, 9, 15);
        this.group.add(bridge);

        // Lifeboats
        const lifeboatGeometry = new THREE.BoxGeometry(1, 0.5, 4);
        const lifeboatMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        
        for (let side = -1; side <= 1; side += 2) {
            for (let i = 0; i < 8; i++) {
                const lifeboat = new THREE.Mesh(lifeboatGeometry, lifeboatMaterial);
                lifeboat.position.set(side * 4, 6, -15 + i * 4);
                this.group.add(lifeboat);
            }
        }

        // Masts
        const mastGeometry = new THREE.CylinderGeometry(0.2, 0.2, 20);
        const mastMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        
        const frontMast = new THREE.Mesh(mastGeometry, mastMaterial);
        frontMast.position.set(0, 15, 15);
        this.group.add(frontMast);
        
        const rearMast = new THREE.Mesh(mastGeometry, mastMaterial);
        rearMast.position.set(0, 15, -10);
        this.group.add(rearMast);

        this.updateBoundingBox();
    }

    createLights() {
        // Deck lights
        const deckLightPositions = [
            [-3, 4, 10], [3, 4, 10],
            [-3, 4, 0], [3, 4, 0],
            [-3, 4, -10], [3, 4, -10]
        ];

        deckLightPositions.forEach(pos => {
            const light = new THREE.PointLight(0xffff88, 0.5, 20);
            light.position.set(...pos);
            this.group.add(light);

            // Light sphere
            const lightGeometry = new THREE.SphereGeometry(0.2);
            const lightMaterial = new THREE.MeshBasicMaterial({ color: 0xffff88 });
            const lightSphere = new THREE.Mesh(lightGeometry, lightMaterial);
            lightSphere.position.set(...pos);
            this.group.add(lightSphere);
        });

        // Navigation lights
        const redLight = new THREE.PointLight(0xff0000, 0.8, 30);
        redLight.position.set(-4, 6, 18);
        this.group.add(redLight);

        const greenLight = new THREE.PointLight(0x00ff00, 0.8, 30);
        greenLight.position.set(4, 6, 18);
        this.group.add(greenLight);

        // Searchlight
        const searchlight = new THREE.SpotLight(0xffffff, 1, 100, Math.PI / 6);
        searchlight.position.set(0, 12, 18);
        searchlight.target.position.set(0, 0, 50);
        this.group.add(searchlight);
        this.group.add(searchlight.target);
    }

    update(deltaTime) {
        if (this.sinking) {
            this.updateSinking(deltaTime);
            return;
        }

        // AUTOMATIC FORWARD MOVEMENT - Ship always moves forward
        this.automaticForwardMovement(deltaTime);

        // Update realistic steering system
        this.updateSteering(deltaTime);
        
        // Apply physics with historical accuracy
        this.updatePhysics(deltaTime);
        
        // Update group position and rotation
        this.group.position.copy(this.position);
        this.group.rotation.y = this.rotation;
        
        // FORCE UPDATE THE 3D MODEL POSITION (for loaded OBJ models)
        if (this.titanicModel) {
            // Don't copy position since the model is already a child of the group
            // Just update the rotation relative to the group
            this.titanicModel.rotation.y = -Math.PI / 2; // Keep the model's local rotation
        }
        
        // DETAILED DEBUG - Check if model is moving
        console.log('🚢 POSITION UPDATE:', { 
            position: this.position.clone(), 
            rotation: this.rotation,
            groupPos: this.group.position.clone(),
            groupChildren: this.group.children.length,
            modelExists: !!this.titanicModel,
            modelPos: this.titanicModel ? this.titanicModel.position.clone() : 'no model',
            modelVisible: this.titanicModel ? this.titanicModel.visible : 'no model'
        });
        
        // FORCE MODEL TO FOLLOW GROUP POSITION
        if (this.titanicModel) {
            // Make sure the model is visible and positioned correctly
            this.titanicModel.visible = true;
            
            // KEEP MODEL AT ORIGIN WITHIN GROUP (it moves with the group)
            this.titanicModel.position.set(0, 0, 0);
            
            console.log('🚢 MODEL UPDATE:', {
                modelLocalPos: this.titanicModel.position.clone(),
                groupPos: this.group.position.clone(),
                shipPos: this.position.clone(),
                modelWorldPos: new THREE.Vector3().setFromMatrixPosition(this.titanicModel.matrixWorld)
            });
        }
        
        this.updateBoundingBox();
    }

    automaticForwardMovement(deltaTime) {
        // DRAMATIC MOVEMENT TEST - Make it impossible to miss
        const targetSpeed = 100; // Super fast movement
        
        // Set speed immediately for instant movement
        this.speed = targetSpeed;
        
        // DRAMATIC POSITION CHANGES FOR TESTING
        const time = Date.now() * 0.001;
        this.position.x = Math.sin(time) * 20; // Big side-to-side movement
        this.position.z -= 2; // Fast forward movement
        
        console.log('🚢 DRAMATIC MOVEMENT TEST:', { 
            speed: this.speed, 
            position: this.position.clone(),
            time: time,
            deltaTime: deltaTime
        });
    }

    updateSteering(deltaTime) {
        // REALISTIC TITANIC STEERING DELAY AND MOMENTUM
        
        // Apply steering delay (it takes time for the rudder to respond)
        const steeringResponse = Math.min(1, deltaTime / this.steeringDelay);
        this.actualSteering += (this.steeringInput - this.actualSteering) * steeringResponse;
        
        // Calculate turn rate based on historical Titanic specifications
        let baseTurnRate = this.baseTurnSpeed;
        
        // Speed affects turning ability (faster = harder to turn)
        const speedFactor = 1 - (this.speed / this.maxSpeed) * 0.7;
        
        // Emergency maneuver system
        if (this.emergencyActive) {
            this.emergencyDuration += deltaTime;
            baseTurnRate *= this.emergencyTurnMultiplier;
            
            if (this.emergencyDuration >= this.maxEmergencyTime) {
                this.emergencyActive = false;
                this.emergencyDuration = 0;
            }
        }
        
        // Calculate final turn rate
        const finalTurnRate = baseTurnRate * speedFactor * deltaTime;
        
        // Apply steering with momentum
        this.steeringMomentum += this.actualSteering * finalTurnRate;
        this.steeringMomentum *= 0.95; // Momentum decay
        
        // Update ship rotation
        this.rotation += this.steeringMomentum;
        
        // Update visual rudder angle
        this.rudderAngle = this.actualSteering * this.maxRudderAngle;
    }

    updatePhysics(deltaTime) {
        // Historical Titanic physics - FIXED VERSION
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation);
        
        // DIRECT POSITION UPDATE - Move ship forward based on speed and direction
        const movementDistance = this.speed * deltaTime;
        const movement = direction.clone().multiplyScalar(movementDistance);
        
        // Apply movement directly to position
        this.position.add(movement);
        
        // Update velocity for other systems that might need it
        this.velocity = direction.clone().multiplyScalar(this.speed);
        
        // Debug log to verify ship movement
        console.log('🚢 PHYSICS UPDATE:', { 
            speed: this.speed,
            movementDistance: movementDistance,
            direction: direction,
            newPosition: this.position.clone(),
            velocity: this.velocity.clone()
        });
    }

    accelerate(amount) {
        if (this.sinking) return;
        
        this.speed = Math.min(this.maxSpeed, this.speed + amount);
        
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation);
        
        this.velocity.add(direction.multiplyScalar(amount * 0.1));
        
        console.log('🚢 ACCELERATE:', { speed: this.speed, position: this.position, velocity: this.velocity });
    }

    decelerate(amount) {
        if (this.sinking) return;
        
        this.speed = Math.max(0, this.speed - amount);
        this.velocity.multiplyScalar(0.9);
        
        console.log('🚢 DECELERATE:', { speed: this.speed, position: this.position, velocity: this.velocity });
    }

    turnLeft(amount) {
        if (this.sinking) return;
        
        // Set steering input for realistic steering system
        this.steeringInput = Math.max(-1, this.steeringInput - amount * 0.5);
        
        console.log('🚢 TURN LEFT:', { steeringInput: this.steeringInput, rotation: this.rotation });
    }

    turnRight(amount) {
        if (this.sinking) return;
        
        // Set steering input for realistic steering system
        this.steeringInput = Math.min(1, this.steeringInput + amount * 0.5);
        
        console.log('🚢 TURN RIGHT:', { steeringInput: this.steeringInput, rotation: this.rotation });
    }

    // Emergency maneuver - can be activated when iceberg is spotted
    activateEmergencyManeuver() {
        if (this.sinking || this.emergencyActive) return false;
        
        this.emergencyActive = true;
        this.emergencyDuration = 0;
        
        // Visual and audio feedback for emergency
        this.crewMorale = Math.max(50, this.crewMorale - 20); // Crew stress
        
        return true;
    }

    // Full astern (emergency reverse)
    fullAstern() {
        if (this.sinking) return;
        
        // Historical: Titanic's engines were put in full reverse
        this.speed = Math.max(-this.maxSpeed * 0.3, this.speed - this.acceleration * 2);
        this.engineStatus = 'full_reverse';
    }

    // Get steering responsiveness (for UI feedback)
    getSteeringResponsiveness() {
        const speedPenalty = this.speed / this.maxSpeed;
        const emergencyBonus = this.emergencyActive ? 0.5 : 0;
        return Math.max(0.1, 1 - speedPenalty + emergencyBonus);
    }

    // Check if ship can avoid collision given current trajectory
    canAvoidCollision(icebergPosition, timeToImpact) {
        const currentTurnRate = this.baseTurnSpeed * this.getSteeringResponsiveness();
        const maxTurnInTime = currentTurnRate * timeToImpact;
        
        // Calculate minimum turn needed to avoid iceberg
        const toIceberg = icebergPosition.clone().sub(this.position);
        const currentHeading = new THREE.Vector3(0, 0, -1);
        currentHeading.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation);
        
        const angleToIceberg = Math.acos(currentHeading.dot(toIceberg.normalize()));
        const minTurnNeeded = Math.abs(angleToIceberg - Math.PI/4); // Need to turn at least 45 degrees away
        
        return maxTurnInTime >= minTurnNeeded;
    }

    updateBoundingBox() {
        this.boundingBox.setFromObject(this.group);
    }

    startSinking() {
        this.sinking = true;
        this.engineStatus = 'failed';
        this.crewMorale = 0;
    }

    updateSinking(deltaTime) {
        // Gradual sinking animation
        this.position.y -= deltaTime * 2;
        this.group.rotation.z += deltaTime * 0.1; // Slight tilt
        
        // Slow down
        this.velocity.multiplyScalar(0.95);
    }

    getStatus() {
        return {
            speed: this.speed,
            heading: (this.rotation * 180 / Math.PI) % 360,
            engineStatus: this.engineStatus,
            damage: this.damage,
            crewMorale: this.crewMorale,
            position: this.position.clone(),
            // New steering information for realistic Titanic experience
            rudderAngle: this.rudderAngle,
            steeringResponsiveness: this.getSteeringResponsiveness(),
            emergencyActive: this.emergencyActive,
            steeringInput: this.steeringInput,
            actualSteering: this.actualSteering,
            // Historical context data
            historicalSpeed: this.historicalSpeed,
            timeToReact: this.timeToReact,
            turningRadius: this.turningRadius,
            stoppingDistance: this.stoppingDistance
        };
    }

    reset() {
        this.position.set(0, 0, 0);
        this.velocity.set(0, 0, 0);
        this.rotation = 0;
        this.speed = 18; // Initialize with full speed instead of 0
        this.damage = 0;
        this.engineStatus = 'running';
        this.crewMorale = 100;
        this.sinking = false;
        
        this.group.position.copy(this.position);
        this.group.rotation.set(0, 0, 0);
        
        // Initialize velocity with a stronger forward momentum
        // Use a direct approach with a fixed value for more reliable movement
        this.velocity.set(0, 0, -9); // Set to half of max speed (18) directly on Z-axis
        
        console.log('🚢 Ship reset with velocity:', this.velocity);
    }
}