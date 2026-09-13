// Web Audio API RPG Synthesizer
// Provides tactile, reliable audio feedback without external audio files

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Load mute preference
    const saved = localStorage.getItem('questbound_muted');
    this.isMuted = saved === 'true';
  }

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('questbound_muted', String(this.isMuted));
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Quest completion sound: Sparkling ascending harmonic chime
   */
  public playQuestComplete(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.4);
    });
  }

  /**
   * Level up fanfare: Triumphant brass/synth chord progression
   */
  public playLevelUp(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const chords = [
      { notes: [440, 554.37, 659.25], start: 0, dur: 0.2 }, // A major
      { notes: [493.88, 622.25, 739.99], start: 0.2, dur: 0.2 }, // B major
      { notes: [554.37, 698.46, 830.61], start: 0.4, dur: 0.25 }, // C# major
      { notes: [659.25, 830.61, 987.77, 1318.51], start: 0.65, dur: 0.8 }, // E major fanfare chord
    ];

    chords.forEach((chord) => {
      chord.notes.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + chord.start);

        gain.gain.setValueAtTime(0, ctx.currentTime + chord.start);
        gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + chord.start + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + chord.start + chord.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + chord.start);
        osc.stop(ctx.currentTime + chord.start + chord.dur + 0.05);
      });
    });
  }

  /**
   * Shop purchase sound: Golden coin clink
   */
  public playPurchase(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const coins = [1760, 2637]; // A6, E7
    coins.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);

      gain.gain.setValueAtTime(0.25, ctx.currentTime + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.06);
      osc.stop(ctx.currentTime + idx * 0.06 + 0.25);
    });
  }

  /**
   * Light tactile button click
   */
  public playClick(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  }
}

export const sound = new SoundEngine();
