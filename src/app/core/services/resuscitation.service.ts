import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ResuscitationService {
  // State
  private _seconds = signal(0);
  private _isRunning = signal(false);
  private _rounds = signal(0);

  // Metronoom State
  private _isMetronomeEnabled = signal(true); // Standaard aan? Of uit?
  private metronomeIntervalId: any;
  private readonly BPM = 110;
  private readonly BEAT_MS = 60000 / this.BPM; // ~545ms

  // Web Audio Context (voor de piepjes)
  private audioCtx: AudioContext | null = null;

  // Publieke Signals
  readonly seconds = this._seconds.asReadonly();
  readonly isRunning = this._isRunning.asReadonly();
  readonly rounds = this._rounds.asReadonly();
  readonly isMetronomeEnabled = this._isMetronomeEnabled.asReadonly();

  // Formatted Time (00:00)
  readonly formattedTime = computed(() => {
    const mins = Math.floor(this._seconds() / 60);
    const secs = this._seconds() % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  });

  private timerIntervalId: any;

  constructor() {
    // Init AudioContext (lazy loading)
    if (typeof window !== 'undefined') {
       const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
       this.audioCtx = new AudioContext();
    }
  }

  toggleTimer() {
    this._isRunning() ? this.pause() : this.start();
  }

  toggleMetronome() {
    this._isMetronomeEnabled.update(v => !v);

    // Als timer loopt, direct metronoom aan/uit zetten in de lopende sessie
    if (this._isRunning()) {
      if (this._isMetronomeEnabled()) {
        this.startMetronome();
      } else {
        this.stopMetronome();
      }
    }
  }

  start() {
    if (this._isRunning()) return;

    // Browser policy: AudioContext mag pas starten na user interactie
    if (this.audioCtx?.state === 'suspended') {
      this.audioCtx.resume();
    }

    this._isRunning.set(true);

    // 1. Start de tijd-teller
    this.timerIntervalId = setInterval(() => {
      this._seconds.update(s => s + 1);
      this.checkCycle();
    }, 1000);

    // 2. Start de metronoom (indien aan)
    if (this._isMetronomeEnabled()) {
      this.startMetronome();
    }

    this.requestWakeLock();
  }

  pause() {
    this._isRunning.set(false);
    clearInterval(this.timerIntervalId);
    this.stopMetronome();
  }

  reset() {
    this.pause();
    this._seconds.set(0);
    this._rounds.set(0);
  }

  // --- Interne Helpers ---

  private startMetronome() {
    // Speel direct eerste tik
    this.playBeep('low');

    // Start loop
    this.metronomeIntervalId = setInterval(() => {
      this.playBeep('low');
    }, this.BEAT_MS);
  }

  private stopMetronome() {
    clearInterval(this.metronomeIntervalId);
  }

  private checkCycle() {
    const currentSeconds = this._seconds();
    if (currentSeconds > 0 && currentSeconds % 120 === 0) {
      this._rounds.update(r => r + 1);
      this.playBeep('high'); // Hoog alarm geluid voor 2 min wissel
      if (navigator.vibrate) navigator.vibrate([500, 200, 500]);
    }
  }

  // Genereer geluid met Web Audio API (geen externe files nodig)
  private playBeep(type: 'low' | 'high') {
    if (!this.audioCtx) return;

    const oscillator = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);

    if (type === 'high') {
      // Alarm toon (2 min)
      oscillator.type = 'square';
      oscillator.frequency.value = 880; // A5
      gainNode.gain.setValueAtTime(0.5, this.audioCtx.currentTime); // Volume
      oscillator.start();
      oscillator.stop(this.audioCtx.currentTime + 0.5); // 0.5 sec lang
    } else {
      // Metronoom tik
      oscillator.type = 'sine';
      oscillator.frequency.value = 600; // Duidelijke tik
      gainNode.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(this.audioCtx.currentTime + 0.1); // Kort tikje
    }
  }

  private async requestWakeLock() {
    if ('wakeLock' in navigator) {
      try { await (navigator as any).wakeLock.request('screen'); } catch (e) {}
    }
  }
}
