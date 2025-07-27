export class AudioManager {
    constructor() {
        this.sounds = {};
        this.backgroundMusic = null;
        this.masterVolume = 0.7;
        this.musicVolume = 0.5;
        this.sfxVolume = 0.8;
        
        this.initializeAudio();
    }

    initializeAudio() {
        // Create audio context for better control
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = this.masterVolume;
        } catch (e) {
            console.warn('Web Audio API not supported, falling back to HTML5 audio');
            this.audioContext = null;
        }

        this.createSounds();
    }

    createSounds() {
        // Generate procedural audio for ocean ambience
        this.sounds.oceanWaves = this.createOceanWaves();
        this.sounds.shipEngine = this.createShipEngine();
        this.sounds.windEffect = this.createWindEffect();
        this.sounds.iceCreaking = this.createIceCreaking();
        this.sounds.collisionImpact = this.createCollisionSound();
        this.sounds.warningAlarm = this.createWarningAlarm();
        this.sounds.victoryFanfare = this.createVictorySound();
        
        // Background music
        this.backgroundMusic = this.createBackgroundMusic();
    }

    createOceanWaves() {
        if (!this.audioContext) return this.createHTMLAudio('ocean');

        const bufferSize = this.audioContext.sampleRate * 4; // 4 seconds
        const buffer = this.audioContext.createBuffer(2, bufferSize, this.audioContext.sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = buffer.getChannelData(channel);
            
            for (let i = 0; i < bufferSize; i++) {
                const time = i / this.audioContext.sampleRate;
                
                // Layer multiple wave frequencies for realistic ocean sound
                let sample = 0;
                sample += Math.sin(time * 2 * Math.PI * 0.5) * 0.3; // Low rumble
                sample += Math.sin(time * 2 * Math.PI * 1.2) * 0.2; // Mid wave
                sample += (Math.random() - 0.5) * 0.1; // White noise for foam
                
                // Apply envelope for wave crashes
                const wavePhase = (time * 0.3) % 1;
                const envelope = Math.pow(Math.sin(wavePhase * Math.PI), 2);
                sample *= envelope;
                
                channelData[i] = sample * 0.5;
            }
        }

        return {
            buffer,
            loop: true,
            volume: 0.6
        };
    }

    createShipEngine() {
        if (!this.audioContext) return this.createHTMLAudio('engine');

        const bufferSize = this.audioContext.sampleRate * 2;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const channelData = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            const time = i / this.audioContext.sampleRate;
            
            // Steam engine rhythm
            let sample = 0;
            sample += Math.sin(time * 2 * Math.PI * 8) * 0.4; // Engine pulse
            sample += Math.sin(time * 2 * Math.PI * 16) * 0.2; // Harmonic
            sample += (Math.random() - 0.5) * 0.1; // Mechanical noise
            
            // Rhythmic envelope
            const rhythm = Math.floor(time * 4) % 2;
            sample *= rhythm ? 0.8 : 0.6;
            
            channelData[i] = sample * 0.3;
        }

        return {
            buffer,
            loop: true,
            volume: 0.4
        };
    }

    createWindEffect() {
        if (!this.audioContext) return this.createHTMLAudio('wind');

        const bufferSize = this.audioContext.sampleRate * 3;
        const buffer = this.audioContext.createBuffer(2, bufferSize, this.audioContext.sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = buffer.getChannelData(channel);
            
            for (let i = 0; i < bufferSize; i++) {
                const time = i / this.audioContext.sampleRate;
                
                // Wind is mostly filtered noise
                let sample = (Math.random() - 0.5) * 2;
                
                // Apply low-pass filtering effect
                const cutoff = 0.3 + Math.sin(time * 0.5) * 0.2;
                sample *= cutoff;
                
                // Wind gusts
                const gustPhase = (time * 0.2) % 1;
                const gustEnvelope = Math.pow(Math.sin(gustPhase * Math.PI), 3);
                sample *= 0.5 + gustEnvelope * 0.5;
                
                channelData[i] = sample * 0.3;
            }
        }

        return {
            buffer,
            loop: true,
            volume: 0.5
        };
    }

    createIceCreaking() {
        if (!this.audioContext) return this.createHTMLAudio('ice');

        const bufferSize = this.audioContext.sampleRate * 0.5;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const channelData = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            const time = i / this.audioContext.sampleRate;
            
            // Ice cracking sound
            let sample = 0;
            sample += Math.sin(time * 2 * Math.PI * 200) * Math.exp(-time * 10); // Sharp crack
            sample += Math.sin(time * 2 * Math.PI * 100) * Math.exp(-time * 5); // Lower resonance
            sample += (Math.random() - 0.5) * 0.2 * Math.exp(-time * 8); // Crackling
            
            channelData[i] = sample * 0.6;
        }

        return {
            buffer,
            loop: false,
            volume: 0.7
        };
    }

    createCollisionSound() {
        if (!this.audioContext) return this.createHTMLAudio('collision');

        const bufferSize = this.audioContext.sampleRate * 2;
        const buffer = this.audioContext.createBuffer(2, bufferSize, this.audioContext.sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = buffer.getChannelData(channel);
            
            for (let i = 0; i < bufferSize; i++) {
                const time = i / this.audioContext.sampleRate;
                
                // Massive impact sound
                let sample = 0;
                sample += Math.sin(time * 2 * Math.PI * 60) * Math.exp(-time * 2); // Deep impact
                sample += Math.sin(time * 2 * Math.PI * 120) * Math.exp(-time * 3); // Metal stress
                sample += (Math.random() - 0.5) * Math.exp(-time * 1); // Debris
                
                // Add reverb-like effect
                if (i > this.audioContext.sampleRate * 0.1) {
                    sample += channelData[i - Math.floor(this.audioContext.sampleRate * 0.1)] * 0.3;
                }
                
                channelData[i] = sample * 0.8;
            }
        }

        return {
            buffer,
            loop: false,
            volume: 1.0
        };
    }

    createWarningAlarm() {
        if (!this.audioContext) return this.createHTMLAudio('alarm');

        const bufferSize = this.audioContext.sampleRate * 1;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const channelData = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            const time = i / this.audioContext.sampleRate;
            
            // Classic ship alarm
            const frequency = 800 + Math.sin(time * 2 * Math.PI * 2) * 200;
            let sample = Math.sin(time * 2 * Math.PI * frequency) * 0.5;
            
            // Pulsing effect
            const pulse = Math.floor(time * 8) % 2;
            sample *= pulse ? 1 : 0.3;
            
            channelData[i] = sample;
        }

        return {
            buffer,
            loop: true,
            volume: 0.8
        };
    }

    createVictorySound() {
        if (!this.audioContext) return this.createHTMLAudio('victory');

        const bufferSize = this.audioContext.sampleRate * 3;
        const buffer = this.audioContext.createBuffer(2, bufferSize, this.audioContext.sampleRate);
        
        // Simple victory fanfare
        const notes = [261.63, 329.63, 392.00, 523.25]; // C, E, G, C
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = buffer.getChannelData(channel);
            
            for (let i = 0; i < bufferSize; i++) {
                const time = i / this.audioContext.sampleRate;
                const noteIndex = Math.floor(time * 2) % notes.length;
                const frequency = notes[noteIndex];
                
                let sample = Math.sin(time * 2 * Math.PI * frequency) * 0.3;
                sample += Math.sin(time * 2 * Math.PI * frequency * 2) * 0.1; // Harmonic
                
                // Envelope
                const noteTime = (time * 2) % 0.5;
                const envelope = Math.exp(-noteTime * 3);
                sample *= envelope;
                
                channelData[i] = sample;
            }
        }

        return {
            buffer,
            loop: false,
            volume: 0.9
        };
    }

    createBackgroundMusic() {
        if (!this.audioContext) return this.createHTMLAudio('music');

        // Create a simple orchestral-style background music
        const bufferSize = this.audioContext.sampleRate * 30; // 30 seconds loop
        const buffer = this.audioContext.createBuffer(2, bufferSize, this.audioContext.sampleRate);
        
        // Simple chord progression in a minor key
        const chords = [
            [220, 261.63, 329.63], // Am
            [246.94, 293.66, 369.99], // Dm
            [196, 246.94, 311.13], // G
            [220, 261.63, 329.63]  // Am
        ];
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = buffer.getChannelData(channel);
            
            for (let i = 0; i < bufferSize; i++) {
                const time = i / this.audioContext.sampleRate;
                const chordIndex = Math.floor(time / 7.5) % chords.length;
                const chord = chords[chordIndex];
                
                let sample = 0;
                
                // Play chord notes
                chord.forEach((freq, noteIndex) => {
                    sample += Math.sin(time * 2 * Math.PI * freq) * 0.1;
                    sample += Math.sin(time * 2 * Math.PI * freq * 0.5) * 0.05; // Lower octave
                });
                
                // Add some melody
                const melodyFreq = chord[0] * (1 + Math.sin(time * 0.5) * 0.2);
                sample += Math.sin(time * 2 * Math.PI * melodyFreq) * 0.08;
                
                // Gentle envelope
                const envelope = 0.7 + Math.sin(time * 0.1) * 0.3;
                sample *= envelope;
                
                channelData[i] = sample * 0.4;
            }
        }

        return {
            buffer,
            loop: true,
            volume: 0.3
        };
    }

    createHTMLAudio(type) {
        // Fallback for browsers without Web Audio API
        const audio = new Audio();
        audio.loop = type !== 'collision' && type !== 'victory' && type !== 'ice';
        audio.volume = 0.5;
        
        // You would load actual audio files here
        // audio.src = `sounds/${type}.mp3`;
        
        return {
            element: audio,
            volume: 0.5
        };
    }

    playSound(soundName, volume = 1) {
        const sound = this.sounds[soundName];
        if (!sound) return;

        if (this.audioContext && sound.buffer) {
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            
            source.buffer = sound.buffer;
            source.loop = sound.loop;
            
            gainNode.gain.value = sound.volume * volume * this.sfxVolume;
            
            source.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            source.start();
            
            return source;
        } else if (sound.element) {
            sound.element.volume = sound.volume * volume * this.sfxVolume;
            sound.element.play().catch(e => console.warn('Audio play failed:', e));
            return sound.element;
        }
    }

    playBackgroundMusic() {
        if (this.backgroundMusic && this.audioContext && this.backgroundMusic.buffer) {
            this.stopBackgroundMusic();
            
            this.musicSource = this.audioContext.createBufferSource();
            this.musicGain = this.audioContext.createGain();
            
            this.musicSource.buffer = this.backgroundMusic.buffer;
            this.musicSource.loop = true;
            
            this.musicGain.gain.value = this.backgroundMusic.volume * this.musicVolume;
            
            this.musicSource.connect(this.musicGain);
            this.musicGain.connect(this.masterGain);
            
            this.musicSource.start();
        }
    }

    stopBackgroundMusic() {
        if (this.musicSource) {
            this.musicSource.stop();
            this.musicSource = null;
        }
    }

    playCollisionSound() {
        this.playSound('collisionImpact');
        
        // Add additional impact effects
        setTimeout(() => this.playSound('iceCreaking'), 200);
        setTimeout(() => this.playSound('iceCreaking'), 400);
    }

    playVictorySound() {
        this.playSound('victoryFanfare');
    }

    playWarningAlarm() {
        if (!this.alarmSource) {
            this.alarmSource = this.playSound('warningAlarm');
        }
    }

    stopWarningAlarm() {
        if (this.alarmSource) {
            if (this.alarmSource.stop) {
                this.alarmSource.stop();
            } else if (this.alarmSource.pause) {
                this.alarmSource.pause();
            }
            this.alarmSource = null;
        }
    }

    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.value = this.masterVolume;
        }
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.musicGain) {
            this.musicGain.gain.value = this.backgroundMusic.volume * this.musicVolume;
        }
    }

    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }

    playAmbientSounds() {
        this.playSound('oceanWaves');
        this.playSound('shipEngine');
        this.playSound('windEffect');
    }

    stopAmbientSounds() {
        // Stop all looping sounds
        Object.keys(this.sounds).forEach(soundName => {
            const sound = this.sounds[soundName];
            if (sound.loop && sound.source) {
                sound.source.stop();
            }
        });
    }

    stopAll() {
        this.stopBackgroundMusic();
        this.stopAmbientSounds();
        this.stopWarningAlarm();
    }

    dispose() {
        this.stopAll();
        
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        // Clean up HTML audio elements
        Object.values(this.sounds).forEach(sound => {
            if (sound.element) {
                sound.element.pause();
                sound.element.src = '';
            }
        });
    }
}