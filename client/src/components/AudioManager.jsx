export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.backgroundMusic = null;
        this.masterVolume = 0.7;
        this.musicVolume = 0.3;
        this.sfxVolume = 0.8;
        
        this.init();
    }

    init() {
        // Initialize Web Audio API
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
            return;
        }

        // Create audio sources
        this.createAudioSources();
    }

    createAudioSources() {
        // Create synthetic ocean waves sound
        this.createOceanWaves();
        
        // Create engine sound
        this.createEngineSound();
        
        // Create wind sound
        this.createWindSound();
        
        // Create collision sound
        this.createCollisionSound();
        
        // Create warning alarm
        this.createWarningAlarm();
        
        // Create background music
        this.createBackgroundMusic();
    }

    createOceanWaves() {
        if (!this.audioContext) return;

        const bufferSize = this.audioContext.sampleRate * 2; // 2 seconds
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        // Generate ocean wave sound using noise and filtering
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.1;
        }

        this.sounds.oceanWaves = {
            buffer,
            source: null,
            gainNode: null,
            isPlaying: false
        };
    }

    createEngineSound() {
        if (!this.audioContext) return;

        const bufferSize = this.audioContext.sampleRate * 1; // 1 second loop
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        // Generate engine rumble using low frequency oscillation
        for (let i = 0; i < bufferSize; i++) {
            const t = i / this.audioContext.sampleRate;
            data[i] = Math.sin(2 * Math.PI * 60 * t) * 0.3 + 
                     Math.sin(2 * Math.PI * 120 * t) * 0.2 +
                     (Math.random() * 2 - 1) * 0.1;
        }

        this.sounds.engine = {
            buffer,
            source: null,
            gainNode: null,
            isPlaying: false
        };
    }

    createWindSound() {
        if (!this.audioContext) return;

        const bufferSize = this.audioContext.sampleRate * 3; // 3 seconds
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        // Generate wind sound using filtered noise
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.15;
        }

        this.sounds.wind = {
            buffer,
            source: null,
            gainNode: null,
            isPlaying: false
        };
    }

    createCollisionSound() {
        if (!this.audioContext) return;

        const bufferSize = this.audioContext.sampleRate * 2; // 2 seconds
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        // Generate collision sound - sharp impact with decay
        for (let i = 0; i < bufferSize; i++) {
            const t = i / this.audioContext.sampleRate;
            const decay = Math.exp(-t * 3);
            data[i] = (Math.random() * 2 - 1) * decay * 0.8;
        }

        this.sounds.collision = {
            buffer,
            source: null,
            gainNode: null,
            isPlaying: false
        };
    }

    createWarningAlarm() {
        if (!this.audioContext) return;

        const bufferSize = this.audioContext.sampleRate * 1; // 1 second
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        // Generate alarm sound - alternating tones
        for (let i = 0; i < bufferSize; i++) {
            const t = i / this.audioContext.sampleRate;
            const freq = (Math.floor(t * 4) % 2) ? 800 : 600;
            data[i] = Math.sin(2 * Math.PI * freq * t) * 0.5;
        }

        this.sounds.alarm = {
            buffer,
            source: null,
            gainNode: null,
            isPlaying: false
        };
    }

    createBackgroundMusic() {
        if (!this.audioContext) return;

        const bufferSize = this.audioContext.sampleRate * 8; // 8 seconds loop
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        // Generate simple orchestral-like background music
        for (let i = 0; i < bufferSize; i++) {
            const t = i / this.audioContext.sampleRate;
            
            // Simple melody with harmonics
            const melody = Math.sin(2 * Math.PI * 220 * t) * 0.2 +
                          Math.sin(2 * Math.PI * 330 * t) * 0.15 +
                          Math.sin(2 * Math.PI * 440 * t) * 0.1;
            
            data[i] = melody;
        }

        this.backgroundMusic = {
            buffer,
            source: null,
            gainNode: null,
            isPlaying: false
        };
    }

    playSound(soundName, loop = false, volume = 1) {
        if (!this.audioContext || !this.sounds[soundName]) return;

        const sound = this.sounds[soundName];
        
        // Stop existing sound if playing
        if (sound.isPlaying && sound.source) {
            sound.source.stop();
        }

        // Create new source
        sound.source = this.audioContext.createBufferSource();
        sound.source.buffer = sound.buffer;
        sound.source.loop = loop;

        // Create gain node for volume control
        sound.gainNode = this.audioContext.createGain();
        sound.gainNode.gain.value = volume * this.sfxVolume * this.masterVolume;

        // Connect audio graph
        sound.source.connect(sound.gainNode);
        sound.gainNode.connect(this.audioContext.destination);

        // Start playing
        sound.source.start();
        sound.isPlaying = true;

        // Handle ended event
        sound.source.onended = () => {
            sound.isPlaying = false;
        };
    }

    stopSound(soundName) {
        if (!this.sounds[soundName]) return;

        const sound = this.sounds[soundName];
        if (sound.isPlaying && sound.source) {
            sound.source.stop();
            sound.isPlaying = false;
        }
    }

    playBackgroundMusic() {
        if (!this.audioContext || !this.backgroundMusic) return;

        if (this.backgroundMusic.isPlaying) return;

        // Create new source
        this.backgroundMusic.source = this.audioContext.createBufferSource();
        this.backgroundMusic.source.buffer = this.backgroundMusic.buffer;
        this.backgroundMusic.source.loop = true;

        // Create gain node
        this.backgroundMusic.gainNode = this.audioContext.createGain();
        this.backgroundMusic.gainNode.gain.value = this.musicVolume * this.masterVolume;

        // Connect and start
        this.backgroundMusic.source.connect(this.backgroundMusic.gainNode);
        this.backgroundMusic.gainNode.connect(this.audioContext.destination);
        
        this.backgroundMusic.source.start();
        this.backgroundMusic.isPlaying = true;
    }

    stopBackgroundMusic() {
        if (this.backgroundMusic && this.backgroundMusic.isPlaying && this.backgroundMusic.source) {
            this.backgroundMusic.source.stop();
            this.backgroundMusic.isPlaying = false;
        }
    }

    playOceanAmbient() {
        this.playSound('oceanWaves', true, 0.6);
        this.playSound('wind', true, 0.4);
    }

    playEngineSound() {
        this.playSound('engine', true, 0.8);
    }

    stopEngineSound() {
        this.stopSound('engine');
    }

    playCollisionSound() {
        this.playSound('collision', false, 1.0);
    }

    playWarningAlarm() {
        this.playSound('alarm', true, 0.7);
    }

    stopWarningAlarm() {
        this.stopSound('alarm');
    }

    playVictorySound() {
        // Create a simple victory fanfare
        if (!this.audioContext) return;

        const bufferSize = this.audioContext.sampleRate * 3;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            const t = i / this.audioContext.sampleRate;
            const note = Math.sin(2 * Math.PI * 523 * t) * Math.exp(-t * 0.5) * 0.5; // C note
            data[i] = note;
        }

        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = this.sfxVolume * this.masterVolume;
        
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        source.start();
    }

    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.updateAllVolumes();
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.backgroundMusic && this.backgroundMusic.gainNode) {
            this.backgroundMusic.gainNode.gain.value = this.musicVolume * this.masterVolume;
        }
    }

    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        this.updateAllVolumes();
    }

    updateAllVolumes() {
        // Update all currently playing sounds
        Object.values(this.sounds).forEach(sound => {
            if (sound.gainNode) {
                sound.gainNode.gain.value = this.sfxVolume * this.masterVolume;
            }
        });
    }

    stopAll() {
        // Stop all sounds
        Object.keys(this.sounds).forEach(soundName => {
            this.stopSound(soundName);
        });
        
        this.stopBackgroundMusic();
    }

    dispose() {
        this.stopAll();
        
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}