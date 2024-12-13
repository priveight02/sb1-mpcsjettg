import { GAME_CONFIG } from '../config/gameConfig';

class AudioManager {
  private context: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private gainNode: GainNode | null = null;

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext() {
    try {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.context.createGain();
      this.gainNode.connect(this.context.destination);
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  async loadSound(name: string, url: string) {
    if (!this.context) return;

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
      this.sounds.set(name, audioBuffer);
    } catch (error) {
      console.error(`Failed to load sound ${name}:`, error);
    }
  }

  playSound(name: string, volume = 1) {
    if (!this.context || !this.gainNode) return;

    const sound = this.sounds.get(name);
    if (!sound) return;

    const source = this.context.createBufferSource();
    source.buffer = sound;

    const gainNode = this.context.createGain();
    gainNode.gain.value = volume * GAME_CONFIG.soundEffects[name as keyof typeof GAME_CONFIG.soundEffects];
    
    source.connect(gainNode);
    gainNode.connect(this.gainNode);
    
    source.start(0);
  }

  setMasterVolume(volume: number) {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }
}

export const audioManager = new AudioManager();

// Preload sounds
audioManager.loadSound('jump', '/sounds/jump.mp3');
audioManager.loadSound('score', '/sounds/score.mp3');
audioManager.loadSound('collision', '/sounds/collision.mp3');
audioManager.loadSound('powerUp', '/sounds/powerup.mp3');