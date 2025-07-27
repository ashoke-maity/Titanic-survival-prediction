import * as THREE from 'three';

export class Ocean {
    constructor() {
        this.mesh = null;
        this.material = null;
        this.time = 0;
        this.waveHeight = 2;
        this.waveSpeed = 0.5;
        
        this.createOcean();
    }

    createOcean() {
        // Create large ocean plane
        const geometry = new THREE.PlaneGeometry(4000, 4000, 200, 200);
        
        // Store original positions for wave animation
        this.originalPositions = geometry.attributes.position.array.slice();
        
        // Ocean shader material
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                waveHeight: { value: this.waveHeight },
                waveSpeed: { value: this.waveSpeed },
                deepColor: { value: new THREE.Color(0x001122) },
                surfaceColor: { value: new THREE.Color(0x003366) },
                foamColor: { value: new THREE.Color(0x88ccff) }
            },
            vertexShader: `
                uniform float time;
                uniform float waveHeight;
                uniform float waveSpeed;
                
                varying vec3 vPosition;
                varying vec3 vNormal;
                varying float vElevation;
                
                void main() {
                    vec3 pos = position;
                    
                    // Multiple wave layers for realistic ocean
                    float wave1 = sin(pos.x * 0.02 + time * waveSpeed) * waveHeight;
                    float wave2 = sin(pos.z * 0.015 + time * waveSpeed * 0.8) * waveHeight * 0.7;
                    float wave3 = sin((pos.x + pos.z) * 0.01 + time * waveSpeed * 1.2) * waveHeight * 0.5;
                    
                    pos.y += wave1 + wave2 + wave3;
                    
                    vPosition = pos;
                    vElevation = pos.y;
                    
                    // Calculate normal for lighting
                    vec3 tangent1 = vec3(1.0, 0.0, 0.0);
                    vec3 tangent2 = vec3(0.0, 0.0, 1.0);
                    
                    float dx = cos(pos.x * 0.02 + time * waveSpeed) * 0.02 * waveHeight;
                    float dz = cos(pos.z * 0.015 + time * waveSpeed * 0.8) * 0.015 * waveHeight * 0.7;
                    
                    tangent1.y = dx;
                    tangent2.y = dz;
                    
                    vNormal = normalize(cross(tangent1, tangent2));
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 deepColor;
                uniform vec3 surfaceColor;
                uniform vec3 foamColor;
                
                varying vec3 vPosition;
                varying vec3 vNormal;
                varying float vElevation;
                
                void main() {
                    // Water depth effect
                    float depth = clamp(vElevation / 5.0 + 0.5, 0.0, 1.0);
                    vec3 waterColor = mix(deepColor, surfaceColor, depth);
                    
                    // Foam on wave peaks
                    float foam = smoothstep(1.0, 2.0, vElevation);
                    waterColor = mix(waterColor, foamColor, foam * 0.3);
                    
                    // Simple lighting
                    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
                    float lighting = dot(vNormal, lightDir) * 0.5 + 0.5;
                    
                    waterColor *= lighting;
                    
                    // Add some transparency and reflection
                    gl_FragColor = vec4(waterColor, 0.8);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide
        });
        
        this.mesh = new THREE.Mesh(geometry, this.material);
        this.mesh.rotation.x = -Math.PI / 2;
        this.mesh.position.y = -5;
        
        // Add caustic light effects underwater
        this.addCausticEffects();
    }

    addCausticEffects() {
        // Create caustic light patterns
        const causticGeometry = new THREE.PlaneGeometry(2000, 2000);
        const causticMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                causticTexture: { value: this.createCausticTexture() }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform sampler2D causticTexture;
                varying vec2 vUv;
                
                void main() {
                    vec2 uv1 = vUv + vec2(sin(time * 0.1), cos(time * 0.15)) * 0.1;
                    vec2 uv2 = vUv + vec2(cos(time * 0.12), sin(time * 0.08)) * 0.15;
                    
                    vec4 caustic1 = texture2D(causticTexture, uv1);
                    vec4 caustic2 = texture2D(causticTexture, uv2);
                    
                    vec4 caustic = (caustic1 + caustic2) * 0.5;
                    
                    gl_FragColor = vec4(caustic.rgb * 0.3, caustic.a * 0.2);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        
        const causticMesh = new THREE.Mesh(causticGeometry, causticMaterial);
        causticMesh.rotation.x = -Math.PI / 2;
        causticMesh.position.y = -10;
        
        this.mesh.add(causticMesh);
        this.causticMaterial = causticMaterial;
    }

    createCausticTexture() {
        const size = 256;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext('2d');
        
        // Create caustic pattern
        const imageData = context.createImageData(size, size);
        const data = imageData.data;
        
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const x = i / size;
                const y = j / size;
                
                // Create ripple pattern
                const dist1 = Math.sqrt((x - 0.3) ** 2 + (y - 0.3) ** 2);
                const dist2 = Math.sqrt((x - 0.7) ** 2 + (y - 0.7) ** 2);
                
                const ripple1 = Math.sin(dist1 * 20) * 0.5 + 0.5;
                const ripple2 = Math.sin(dist2 * 25) * 0.5 + 0.5;
                
                const intensity = (ripple1 + ripple2) * 0.5;
                
                const index = (i + j * size) * 4;
                data[index] = intensity * 255;     // R
                data[index + 1] = intensity * 255; // G
                data[index + 2] = intensity * 255; // B
                data[index + 3] = intensity * 255; // A
            }
        }
        
        context.putImageData(imageData, 0, 0);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 4);
        
        return texture;
    }

    update(deltaTime) {
        this.time += deltaTime;
        
        // Update shader uniforms
        this.material.uniforms.time.value = this.time;
        
        if (this.causticMaterial) {
            this.causticMaterial.uniforms.time.value = this.time;
        }
        
        // Animate waves by modifying vertex positions
        const positions = this.mesh.geometry.attributes.position.array;
        
        for (let i = 0; i < positions.length; i += 3) {
            const x = this.originalPositions[i];
            const z = this.originalPositions[i + 2];
            
            // Multiple wave layers
            const wave1 = Math.sin(x * 0.02 + this.time * this.waveSpeed) * this.waveHeight;
            const wave2 = Math.sin(z * 0.015 + this.time * this.waveSpeed * 0.8) * this.waveHeight * 0.7;
            const wave3 = Math.sin((x + z) * 0.01 + this.time * this.waveSpeed * 1.2) * this.waveHeight * 0.5;
            
            positions[i + 1] = wave1 + wave2 + wave3;
        }
        
        this.mesh.geometry.attributes.position.needsUpdate = true;
        this.mesh.geometry.computeVertexNormals();
    }

    setWeatherConditions(conditions) {
        switch (conditions) {
            case 'calm':
                this.waveHeight = 1;
                this.waveSpeed = 0.3;
                this.material.uniforms.deepColor.value.setHex(0x001144);
                break;
            case 'rough':
                this.waveHeight = 3;
                this.waveSpeed = 0.8;
                this.material.uniforms.deepColor.value.setHex(0x000022);
                break;
            case 'stormy':
                this.waveHeight = 5;
                this.waveSpeed = 1.2;
                this.material.uniforms.deepColor.value.setHex(0x000011);
                break;
        }
        
        this.material.uniforms.waveHeight.value = this.waveHeight;
        this.material.uniforms.waveSpeed.value = this.waveSpeed;
    }

    getWaveHeightAtPosition(x, z) {
        const wave1 = Math.sin(x * 0.02 + this.time * this.waveSpeed) * this.waveHeight;
        const wave2 = Math.sin(z * 0.015 + this.time * this.waveSpeed * 0.8) * this.waveHeight * 0.7;
        const wave3 = Math.sin((x + z) * 0.01 + this.time * this.waveSpeed * 1.2) * this.waveHeight * 0.5;
        
        return wave1 + wave2 + wave3 - 5; // Account for ocean base level
    }
}