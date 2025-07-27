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
        
        for (let i = 0; i < this.icebergCount; i++) {
            const iceberg = this.createIceberg();
            this.positionIceberg(iceberg);
            this.icebergs.push(iceberg);
            this.group.add(iceberg.mesh);
        }
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
            
            // Update bounding box
            iceberg.boundingBox.setFromObject(iceberg.mesh);
        });
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