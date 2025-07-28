import * as THREE from 'three';

export class IcebergField {
    constructor() {
        this.group = new THREE.Group();
        this.icebergs = [];
        this.icebergCount = 50;
        this.fieldRadius = 1000;
        this.minDistance = 100; // Minimum distance from ship start
    }

    generateField() {
        this.clearField();
        
        // CREATE THE FATAL ICEBERG - The one that sank the Titanic
        this.createFatalIceberg();
        
        // Add other icebergs around the field
        for (let i = 0; i < this.icebergCount - 1; i++) {
            const iceberg = this.createIceberg();
            this.positionIceberg(iceberg);
            this.icebergs.push(iceberg);
            this.group.add(iceberg.mesh);
        }
    }

    createFatalIceberg() {
        // THE ICEBERG THAT SANK THE TITANIC - MAKE IT DRAMATIC!
        // Historical data: Estimated 50-100 feet above water, 400 feet total height
        const fatalSize = 12; // MASSIVE size - much bigger than others
        const fatalType = 'fatal'; // Special type for the deadly iceberg
        
        // Create the geometry for the fatal iceberg - much larger and more menacing
        const geometry = this.createFatalIcebergGeometry(fatalSize);
        
        // Special dramatic material for the fatal iceberg
        const material = new THREE.MeshPhongMaterial({
            color: 0x6688aa, // Darker, more menacing blue
            transparent: true,
            opacity: 0.98,
            shininess: 100,
            specular: 0x4466aa,
            emissive: 0x001122, // Slight glow effect
            emissiveIntensity: 0.1
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        
        // Add dramatic subsurface scattering
        const innerGeometry = geometry.clone();
        innerGeometry.scale(0.85, 0.85, 0.85);
        const innerMaterial = new THREE.MeshLambertMaterial({
            color: 0x6677aa,
            transparent: true,
            opacity: 0.4
        });
        const innerMesh = new THREE.Mesh(innerGeometry, innerMaterial);
        mesh.add(innerMesh);
        
        // Add menacing ice crystals and details
        this.addFatalIcebergDetails(mesh, fatalSize);
        
        // Position the fatal iceberg directly in the ship's path
        // Historical: The iceberg was spotted about 500 meters ahead
        const fatalIceberg = {
            mesh,
            size: fatalSize,
            type: fatalType,
            position: new THREE.Vector3(0, -fatalSize * 6, -450), // Directly ahead, 450m away
            velocity: new THREE.Vector3(0.05, 0, 0.02), // Slight drift like the real iceberg
            rotationSpeed: 0.0005, // Very slow, ominous rotation
            boundingBox: new THREE.Box3(),
            isFatal: true, // Mark this as the historical iceberg
            historicalData: {
                estimatedHeight: 100, // feet above water
                totalHeight: 400, // feet total
                spottedDistance: 500, // meters when first spotted
                impactTime: 37 // seconds from spotting to impact
            }
        };
        
        // Position the mesh
        fatalIceberg.mesh.position.copy(fatalIceberg.position);
        fatalIceberg.boundingBox.setFromObject(mesh);
        
        // Add dramatic warning lights/effects around the fatal iceberg
        this.addDramaticIcebergEffects(mesh, fatalIceberg.position);
        
        this.icebergs.push(fatalIceberg);
        this.group.add(fatalIceberg.mesh);
        
        // Store reference to the fatal iceberg
        this.fatalIceberg = fatalIceberg;
        
        console.log("⚠️ FATAL ICEBERG AHEAD! Historical recreation of the Titanic disaster scenario.");
    }

    createFatalIcebergGeometry(size) {
        // Create a massive, irregular iceberg based on historical descriptions
        const geometry = new THREE.ConeGeometry(size * 8, size * 15, 12); // Much larger
        
        // Make it extremely irregular and menacing
        const vertices = geometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            // Create the characteristic "ram" shape that punctured the hull
            const x = vertices[i];
            const y = vertices[i + 1];
            const z = vertices[i + 2];
            
            // Add the deadly underwater ram
            if (y < 0) {
                vertices[i] += (Math.random() - 0.5) * size * 2;
                vertices[i + 2] += (Math.random() - 0.5) * size * 2;
                
                // Create the sharp underwater protrusion that caused the damage
                if (y < -size * 3) {
                    vertices[i] *= 1.5; // Wider underwater section
                    vertices[i + 2] *= 1.5;
                }
            } else {
                // Visible portion above water
                vertices[i] += (Math.random() - 0.5) * size * 1.5;
                vertices[i + 1] += (Math.random() - 0.5) * size * 0.8;
                vertices[i + 2] += (Math.random() - 0.5) * size * 1.5;
            }
        }
        
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();
        
        return geometry;
    }

    addFatalIcebergDetails(mesh, size) {
        // Add dramatic ice formations and details
        const detailCount = Math.floor(size * 20);
        
        for (let i = 0; i < detailCount; i++) {
            // Ice spikes and formations
            const spikeGeometry = new THREE.ConeGeometry(0.5, size * 2, 6);
            const spikeMaterial = new THREE.MeshLambertMaterial({
                color: 0xaabbcc,
                transparent: true,
                opacity: 0.8
            });
            
            const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
            spike.position.set(
                (Math.random() - 0.5) * size * 12,
                (Math.random() - 0.5) * size * 10,
                (Math.random() - 0.5) * size * 12
            );
            spike.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            
            mesh.add(spike);
        }
        
        // Add the deadly underwater ram that would puncture the hull
        const ramGeometry = new THREE.BoxGeometry(size * 3, size * 8, size * 2);
        const ramMaterial = new THREE.MeshLambertMaterial({
            color: 0x667788,
            transparent: true,
            opacity: 0.7
        });
        
        const ram = new THREE.Mesh(ramGeometry, ramMaterial);
        ram.position.set(0, -size * 6, size * 4); // Underwater protrusion
        ram.rotation.x = Math.PI / 6; // Angled like a ship's ram
        mesh.add(ram);
    }

    addDramaticIcebergEffects(mesh, position) {
        // DRAMATIC LIGHTING EFFECTS TO MAKE IT POP OUT!
        
        // 1. Bright warning spotlight from above
        const spotLight = new THREE.SpotLight(0xff4444, 2.0, 200, Math.PI / 4, 0.5);
        spotLight.position.set(0, 100, 0);
        spotLight.target.position.set(0, 0, 0);
        spotLight.castShadow = true;
        mesh.add(spotLight);
        mesh.add(spotLight.target);
        
        // 2. Ominous red glow around the base
        const glowLight = new THREE.PointLight(0xff2222, 1.5, 150);
        glowLight.position.set(0, -20, 0);
        mesh.add(glowLight);
        
        // 3. Blue ice glow on top
        const iceGlow = new THREE.PointLight(0x4488ff, 1.0, 100);
        iceGlow.position.set(0, 50, 0);
        mesh.add(iceGlow);
        
        // 4. Dramatic particle effects - much more visible
        const particleCount = 200; // More particles
        const particleGeometry = new THREE.BufferGeometry();
        const particlePositions = new Float32Array(particleCount * 3);
        const particleColors = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Position particles around the iceberg
            particlePositions[i3] = (Math.random() - 0.5) * 150;     // x
            particlePositions[i3 + 1] = Math.random() * 100 - 20;    // y
            particlePositions[i3 + 2] = (Math.random() - 0.5) * 150; // z
            
            // Mix of red warning and white ice particles
            if (Math.random() > 0.7) {
                // Red warning particles
                particleColors[i3] = 1.0;     // r
                particleColors[i3 + 1] = 0.2; // g
                particleColors[i3 + 2] = 0.2; // b
            } else {
                // White ice particles
                particleColors[i3] = 1.0;     // r
                particleColors[i3 + 1] = 1.0; // g
                particleColors[i3 + 2] = 1.0; // b
            }
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
        particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            size: 2.0, // Bigger particles
            transparent: true,
            opacity: 0.8,
            vertexColors: true,
            blending: THREE.AdditiveBlending
        });
        
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        mesh.add(particles);
        
        // 5. Glowing outline effect
        const outlineGeometry = mesh.geometry.clone();
        const outlineMaterial = new THREE.MeshBasicMaterial({
            color: 0xff4444,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
        });
        const outline = new THREE.Mesh(outlineGeometry, outlineMaterial);
        outline.scale.multiplyScalar(1.05); // Slightly larger
        mesh.add(outline);
        
        // 6. Pulsing danger beacon on top
        const beaconGeometry = new THREE.SphereGeometry(2, 8, 8);
        const beaconMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.8,
            emissive: 0xff0000,
            emissiveIntensity: 0.5
        });
        const beacon = new THREE.Mesh(beaconGeometry, beaconMaterial);
        beacon.position.set(0, 60, 0);
        mesh.add(beacon);
        
        // Store references for animation
        mesh.userData = {
            spotLight,
            glowLight,
            iceGlow,
            particles,
            beacon,
            beaconMaterial,
            time: 0
        };
        
        console.log("🚨 DRAMATIC FATAL ICEBERG CREATED - Should be highly visible now!");
    }

    createIceberg() {
        const size = Math.random() * 3 + 1; // 1-4 scale
        const type = this.getIcebergType(size);
        
        // Create irregular iceberg shape
        const geometry = this.createIcebergGeometry(size, type);
        const material = new THREE.MeshLambertMaterial({
            color: 0xaaccff,
            transparent: true,
            opacity: 0.9
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        
        // Add subsurface scattering effect
        const innerGeometry = geometry.clone();
        innerGeometry.scale(0.8, 0.8, 0.8);
        const innerMaterial = new THREE.MeshLambertMaterial({
            color: 0x88aaff,
            transparent: true,
            opacity: 0.3
        });
        const innerMesh = new THREE.Mesh(innerGeometry, innerMaterial);
        mesh.add(innerMesh);
        
        // Add ice crystals effect
        this.addIceCrystals(mesh, size);
        
        const iceberg = {
            mesh,
            size,
            type,
            position: new THREE.Vector3(),
            velocity: new THREE.Vector3(),
            rotationSpeed: (Math.random() - 0.5) * 0.001,
            boundingBox: new THREE.Box3()
        };
        
        iceberg.boundingBox.setFromObject(mesh);
        
        return iceberg;
    }

    createIcebergGeometry(size, type) {
        let geometry;
        
        switch (type) {
            case 'small':
                geometry = new THREE.ConeGeometry(size * 3, size * 8, 6);
                break;
            case 'medium':
                geometry = new THREE.CylinderGeometry(size * 2, size * 4, size * 10, 8);
                break;
            case 'large':
                geometry = new THREE.DodecahedronGeometry(size * 5);
                break;
            case 'massive':
                geometry = new THREE.IcosahedronGeometry(size * 7);
                break;
            default:
                geometry = new THREE.ConeGeometry(size * 3, size * 8, 6);
        }
        
        // Make it irregular
        const vertices = geometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            vertices[i] += (Math.random() - 0.5) * size * 0.5;
            vertices[i + 1] += (Math.random() - 0.5) * size * 0.3;
            vertices[i + 2] += (Math.random() - 0.5) * size * 0.5;
        }
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();
        
        return geometry;
    }

    getIcebergType(size) {
        if (size < 1.5) return 'small';
        if (size < 2.5) return 'medium';
        if (size < 3.5) return 'large';
        return 'massive';
    }

    addIceCrystals(mesh, size) {
        const crystalCount = Math.floor(size * 10);
        const crystalGeometry = new THREE.TetrahedronGeometry(0.1);
        const crystalMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.8
        });
        
        for (let i = 0; i < crystalCount; i++) {
            const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
            crystal.position.set(
                (Math.random() - 0.5) * size * 6,
                (Math.random() - 0.5) * size * 8,
                (Math.random() - 0.5) * size * 6
            );
            crystal.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            mesh.add(crystal);
        }
    }

    positionIceberg(iceberg) {
        let position;
        let attempts = 0;
        const maxAttempts = 100;
        
        do {
            const angle = Math.random() * Math.PI * 2;
            const distance = this.minDistance + Math.random() * (this.fieldRadius - this.minDistance);
            
            position = new THREE.Vector3(
                Math.cos(angle) * distance,
                -iceberg.size * 4, // 90% submerged
                Math.sin(angle) * distance
            );
            
            attempts++;
        } while (this.isTooClose(position, iceberg.size) && attempts < maxAttempts);
        
        iceberg.position.copy(position);
        iceberg.mesh.position.copy(position);
        
        // Add slight drifting motion
        iceberg.velocity.set(
            (Math.random() - 0.5) * 0.1,
            0,
            (Math.random() - 0.5) * 0.1
        );
    }

    isTooClose(position, size) {
        const minSeparation = size * 10;
        
        for (const existingIceberg of this.icebergs) {
            if (position.distanceTo(existingIceberg.position) < minSeparation) {
                return true;
            }
        }
        
        return false;
    }

    update(deltaTime) {
        this.icebergs.forEach(iceberg => {
            // Drift motion
            iceberg.position.add(iceberg.velocity.clone().multiplyScalar(deltaTime));
            iceberg.mesh.position.copy(iceberg.position);
            
            // Subtle rotation
            iceberg.mesh.rotation.y += iceberg.rotationSpeed;
            
            // SPECIAL ANIMATION FOR FATAL ICEBERG
            if (iceberg.isFatal && iceberg.mesh.userData) {
                this.animateFatalIceberg(iceberg, deltaTime);
            }
            
            // Update bounding box
            iceberg.boundingBox.setFromObject(iceberg.mesh);
        });
    }

    animateFatalIceberg(fatalIceberg, deltaTime) {
        const userData = fatalIceberg.mesh.userData;
        userData.time += deltaTime;
        
        // 1. Pulsing beacon effect
        if (userData.beacon && userData.beaconMaterial) {
            const pulse = Math.sin(userData.time * 4) * 0.5 + 0.5;
            userData.beaconMaterial.opacity = 0.5 + pulse * 0.5;
            userData.beaconMaterial.emissiveIntensity = 0.3 + pulse * 0.7;
            
            // Make beacon bob up and down
            userData.beacon.position.y = 60 + Math.sin(userData.time * 2) * 3;
        }
        
        // 2. Pulsing warning lights
        if (userData.spotLight) {
            const lightPulse = Math.sin(userData.time * 3) * 0.3 + 0.7;
            userData.spotLight.intensity = 1.5 + lightPulse;
        }
        
        if (userData.glowLight) {
            const glowPulse = Math.sin(userData.time * 2.5) * 0.5 + 0.5;
            userData.glowLight.intensity = 1.0 + glowPulse;
        }
        
        if (userData.iceGlow) {
            const icePulse = Math.sin(userData.time * 1.8) * 0.3 + 0.7;
            userData.iceGlow.intensity = 0.8 + icePulse;
        }
        
        // 3. Rotating particle effects
        if (userData.particles) {
            userData.particles.rotation.y += deltaTime * 0.5;
            userData.particles.rotation.x += deltaTime * 0.2;
            
            // Animate particle positions for swirling effect
            const positions = userData.particles.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                const angle = userData.time * 0.5 + i * 0.01;
                const radius = 50 + Math.sin(userData.time + i * 0.1) * 20;
                
                positions[i] += Math.sin(angle) * 0.1;     // x
                positions[i + 1] += Math.cos(userData.time * 2 + i * 0.05) * 0.2; // y
                positions[i + 2] += Math.cos(angle) * 0.1; // z
            }
            userData.particles.geometry.attributes.position.needsUpdate = true;
        }
        
        // 4. Dramatic iceberg bobbing motion
        const bobbing = Math.sin(userData.time * 0.8) * 2;
        fatalIceberg.mesh.position.y = fatalIceberg.position.y + bobbing;
        
        // 5. Ominous slow rotation
        fatalIceberg.mesh.rotation.y += deltaTime * 0.1;
        fatalIceberg.mesh.rotation.z = Math.sin(userData.time * 0.5) * 0.05; // Slight tilt
    }

    checkCollisionWithShip(shipPosition, shipBoundingBox) {
        for (const iceberg of this.icebergs) {
            if (shipBoundingBox.intersectsBox(iceberg.boundingBox)) {
                // Create collision effect
                this.createCollisionEffect(iceberg.position);
                return true;
            }
        }
        return false;
    }

    createCollisionEffect(position) {
        // Create ice debris particles
        const debrisCount = 20;
        const debrisGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const debrisMaterial = new THREE.MeshLambertMaterial({ color: 0xaaccff });
        
        for (let i = 0; i < debrisCount; i++) {
            const debris = new THREE.Mesh(debrisGeometry, debrisMaterial);
            debris.position.copy(position);
            debris.position.add(new THREE.Vector3(
                (Math.random() - 0.5) * 10,
                Math.random() * 5,
                (Math.random() - 0.5) * 10
            ));
            
            this.group.add(debris);
            
            // Remove debris after animation
            setTimeout(() => {
                this.group.remove(debris);
            }, 5000);
        }
    }

    getPositions() {
        return this.icebergs.map(iceberg => ({
            position: iceberg.position.clone(),
            size: iceberg.size,
            type: iceberg.type
        }));
    }

    getNearestIcebergs(position, count = 5) {
        return this.icebergs
            .map(iceberg => ({
                ...iceberg,
                distance: position.distanceTo(iceberg.position)
            }))
            .sort((a, b) => a.distance - b.distance)
            .slice(0, count);
    }

    clearField() {
        this.icebergs.forEach(iceberg => {
            this.group.remove(iceberg.mesh);
        });
        this.icebergs = [];
    }

    reset() {
        this.clearField();
        this.generateField();
    }
}