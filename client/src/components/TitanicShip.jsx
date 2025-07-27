import * as THREE from 'three';

export class TitanicShip {
    constructor() {
        this.group = new THREE.Group();
        this.position = new THREE.Vector3(0, 0, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.rotation = 0;
        this.speed = 0;
        this.maxSpeed = 20;
        this.acceleration = 5;
        this.turnSpeed = 1;
        this.boundingBox = new THREE.Box3();
        
        // Ship status
        this.damage = 0;
        this.engineStatus = 'running';
        this.crewMorale = 100;
        this.sinking = false;
        
        this.createShip();
        this.createLights();
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

        // Apply physics
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
        
        // Water resistance
        this.velocity.multiplyScalar(0.98);
        
        // Update group position and rotation
        this.group.position.copy(this.position);
        this.group.rotation.y = this.rotation;
        
        this.updateBoundingBox();
    }

    accelerate(amount) {
        if (this.sinking) return;
        
        this.speed = Math.min(this.maxSpeed, this.speed + amount);
        
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation);
        
        this.velocity.add(direction.multiplyScalar(amount * 0.1));
    }

    decelerate(amount) {
        if (this.sinking) return;
        
        this.speed = Math.max(0, this.speed - amount);
        this.velocity.multiplyScalar(0.9);
    }

    turnLeft(amount) {
        if (this.sinking) return;
        
        // Realistic ship turning - slower at higher speeds
        const turnRate = this.turnSpeed * (1 - this.speed / this.maxSpeed * 0.5);
        this.rotation += amount * turnRate * 0.02;
    }

    turnRight(amount) {
        if (this.sinking) return;
        
        const turnRate = this.turnSpeed * (1 - this.speed / this.maxSpeed * 0.5);
        this.rotation -= amount * turnRate * 0.02;
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
            position: this.position.clone()
        };
    }

    reset() {
        this.position.set(0, 0, 0);
        this.velocity.set(0, 0, 0);
        this.rotation = 0;
        this.speed = 0;
        this.damage = 0;
        this.engineStatus = 'running';
        this.crewMorale = 100;
        this.sinking = false;
        
        this.group.position.copy(this.position);
        this.group.rotation.set(0, 0, 0);
    }
}