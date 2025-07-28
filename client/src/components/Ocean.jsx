import * as THREE from 'three';

export class Ocean {
    constructor() {
        this.mesh = null;
        this.material = null;
        this.time = 0;
        this.waveHeight = 5; // Increased for visibility
        this.waveSpeed = 1.0;
        
        this.createSimpleOcean();
    }

    createSimpleOcean() {
        // Create ocean geometry with enough segments for waves
        const geometry = new THREE.PlaneGeometry(2000, 2000, 100, 100);
        
        // Store original positions for wave animation
        this.originalPositions = geometry.attributes.position.array.slice();
        
        // Simple but effective ocean material
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                waveHeight: { value: this.waveHeight },
                waveSpeed: { value: this.waveSpeed }
            },
            vertexShader: `
                uniform float time;
                uniform float waveHeight;
                uniform float waveSpeed;
                
                varying vec3 vPosition;
                varying float vElevation;
                
                void main() {
                    vec3 pos = position;
                    
                    // Create multiple wave layers for realistic ocean
                    float wave1 = sin(pos.x * 0.02 + time * waveSpeed) * waveHeight;
                    float wave2 = sin(pos.z * 0.015 + time * waveSpeed * 0.8) * waveHeight * 0.7;
                    float wave3 = sin((pos.x + pos.z) * 0.01 + time * waveSpeed * 1.2) * waveHeight * 0.5;
                    float wave4 = sin(pos.x * 0.03 - pos.z * 0.02 + time * waveSpeed * 0.6) * waveHeight * 0.3;
                    
                    pos.y += wave1 + wave2 + wave3 + wave4;
                    
                    vPosition = pos;
                    vElevation = pos.y;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                
                varying vec3 vPosition;
                varying float vElevation;
                
                void main() {
                    // Water color based on elevation
                    vec3 deepColor = vec3(0.0, 0.1, 0.3);
                    vec3 surfaceColor = vec3(0.0, 0.3, 0.6);
                    vec3 foamColor = vec3(0.8, 0.9, 1.0);
                    
                    float depth = clamp(vElevation / 10.0 + 0.5, 0.0, 1.0);
                    vec3 waterColor = mix(deepColor, surfaceColor, depth);
                    
                    // Add foam on wave peaks
                    float foam = smoothstep(3.0, 5.0, vElevation);
                    waterColor = mix(waterColor, foamColor, foam * 0.5);
                    
                    // Add some movement to the water color
                    float colorShift = sin(vPosition.x * 0.01 + time * 0.5) * 0.1;
                    waterColor += colorShift;
                    
                    gl_FragColor = vec4(waterColor, 0.9);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide
        });
        
        this.mesh = new THREE.Mesh(geometry, this.material);
        this.mesh.rotation.x = -Math.PI / 2;
        this.mesh.position.y = 0; // At surface level
        this.mesh.receiveShadow = true;
    }

    update(deltaTime, shipPosition = null, shipVelocity = null) {
        this.time += deltaTime;
        
        // Update shader time uniform
        if (this.material && this.material.uniforms) {
            this.material.uniforms.time.value = this.time;
        }
    }

    setWeatherConditions(conditions) {
        switch (conditions) {
            case 'calm':
                this.waveHeight = 2;
                this.waveSpeed = 0.5;
                break;
            case 'rough':
                this.waveHeight = 5;
                this.waveSpeed = 1.0;
                break;
            case 'stormy':
                this.waveHeight = 8;
                this.waveSpeed = 1.5;
                break;
        }
        
        if (this.material && this.material.uniforms) {
            this.material.uniforms.waveHeight.value = this.waveHeight;
            this.material.uniforms.waveSpeed.value = this.waveSpeed;
        }
    }

    getWaveHeightAtPosition(x, z) {
        const wave1 = Math.sin(x * 0.02 + this.time * this.waveSpeed) * this.waveHeight;
        const wave2 = Math.sin(z * 0.015 + this.time * this.waveSpeed * 0.8) * this.waveHeight * 0.7;
        const wave3 = Math.sin((x + z) * 0.01 + this.time * this.waveSpeed * 1.2) * this.waveHeight * 0.5;
        const wave4 = Math.sin(x * 0.03 - z * 0.02 + this.time * this.waveSpeed * 0.6) * this.waveHeight * 0.3;
        
        return wave1 + wave2 + wave3 + wave4;
    }
}