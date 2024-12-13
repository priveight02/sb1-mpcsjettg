class AudioManager {
  private context: AudioContext | null = null;
  private buffers: Map<string, AudioBuffer> = new Map();
  private gainNode: GainNode | null = null;
  private initialized = false;

  init() {
    if (this.initialized) return;
    
    try {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.context.createGain();
      this.gainNode.connect(this.context.destination);
      this.loadSounds();
      this.initialized = true;
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  private async loadSounds() {
    const sounds = {
      jump: '/sounds/jump.mp3',
      score: '/sounds/score.mp3',
      collision: '/sounds/collision.mp3'
    };

    for (const [name, url] of Object.entries(sounds)) {
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.context?.decodeAudioData(arrayBuffer);
        if (audioBuffer) {
          this.buffers.set(name, audioBuffer);
        }
      } catch (error) {
        console.warn(`Failed to load sound ${name}:`, error);
      }
    }
  }

  playSound(name: string, volume = 1) {
    if (!this.context || !this.gainNode) return;

    const buffer = this.buffers.get(name);
    if (!buffer) return;

    const source = this.context.createBufferSource();
    source.buffer = buffer;

    const gainNode = this.context.createGain();
    gainNode.gain.value = volume;
    
    source.connect(gainNode);
    gainNode.connect(this.gainNode);
    
    source.start(0);
  }

  setMasterVolume(volume: number) {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  resume() {
    if (this.context?.state === 'suspended') {
      this.context.resume();
    }
  }
}

export const audioManager = new AudioManager();