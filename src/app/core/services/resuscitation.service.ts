import { Injectable, signal, computed } from '@angular/core';

// Interface voor een regel in het logboek
export interface LogEntry {
  time: string;
  message: string;
  type: 'medication' | 'shock' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ResuscitationService {
  // --- STATE (Timer) ---
  private _seconds = signal(0);
  private _isRunning = signal(false);
  private _rounds = signal(0);

  // --- STATE (Logboek & Tellers) ---
  private _logs = signal<LogEntry[]>([]);
  private _adrenalineCount = signal(0);
  private _shockCount = signal(0);

  // --- STATE (Metronoom) ---
  private _isMetronomeEnabled = signal(true);
  private metronomeIntervalId: any;
  private readonly BPM = 110;
  private readonly BEAT_MS = 60000 / this.BPM; // ~545ms

  // --- AUDIO ---
  private audioCtx: AudioContext | null = null;

  // Referentie naar de timer loop
  private timerIntervalId: any;

  // --- PUBLIEKE SIGNALS (Read-only voor de components) ---
  readonly seconds = this._seconds.asReadonly();
  readonly isRunning = this._isRunning.asReadonly();
  readonly rounds = this._rounds.asReadonly();
  readonly logs = this._logs.asReadonly();
  readonly adrenalineCount = this._adrenalineCount.asReadonly();
  readonly shockCount = this._shockCount.asReadonly();
  readonly isMetronomeEnabled = this._isMetronomeEnabled.asReadonly();

// Maak een nette tekststring voor export
  getLogExportData(): string {
    const header = `--- REANIMATIE LOGBOEK ---\nDatum: ${new Date().toLocaleDateString()}\n`;
    const rounds = `Totaal Ronden: ${this._rounds()}\n`;
    const shocks = `Totaal Schokken: ${this._shockCount()}\n`;
    const adre = `Totaal Adrenaline: ${this._adrenalineCount()}mg\n`;
    const separator = `--------------------------\n`;

    // De logs zelf (van nieuw naar oud, dus we draaien ze even om voor leesbaarheid van boven naar beneden)
    const logLines = this._logs()
      .slice() // kopie maken
      .reverse() // oudste eerst
      .map(l => `[${l.time}] ${l.message}`)
      .join('\n');

    return `${header}${rounds}${shocks}${adre}${separator}${logLines}`;
  }


  // Formatted Time (bijv. "02:05")
  readonly formattedTime = computed(() => {
    const mins = Math.floor(this._seconds() / 60);
    const secs = this._seconds() % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  });

  constructor() {
    // Init AudioContext (veilig voor SSR/Server side rendering)
    if (typeof window !== 'undefined') {
       // Support voor oudere browsers/Safari
       const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
       this.audioCtx = new AudioContext();
    }
  }

  // --- TIMER ACTIES ---

  toggleTimer() {
    this._isRunning() ? this.pause() : this.start();
  }

  start() {
    if (this._isRunning()) return;

    // Browser policy: AudioContext mag pas starten na user interactie
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    this._isRunning.set(true);

    // 1. Start de logica-loop (elke seconde)
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
    // Reset tijd
    this._seconds.set(0);
    this._rounds.set(0);
    // Reset data
    this._logs.set([]);
    this._adrenalineCount.set(0);
    this._shockCount.set(0);
  }

  // --- METRONOOM ACTIES ---

  toggleMetronome() {
    this._isMetronomeEnabled.update(v => !v);

    // Als timer loopt, direct schakelen
    if (this._isRunning()) {
      this._isMetronomeEnabled() ? this.startMetronome() : this.stopMetronome();
    }
  }

  // --- LOGBOEK ACTIES ---

  recordAdrenaline() {
    this._adrenalineCount.update(c => c + 1);
    this.logEvent(`Adrenaline 1mg (Dosis ${this._adrenalineCount()})`, 'medication');
  }

  recordShock(joules: number) {
    this._shockCount.update(c => c + 1);
    this.logEvent(`Schok ${this._shockCount()} toegediend (${joules}J)`, 'shock');
  }

  // Algemene log functie
  private logEvent(message: string, type: 'medication' | 'shock' | 'info' = 'info') {
    const now = new Date();
    const timeString = now.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    // Voeg toe aan begin van array (zodat nieuwste bovenaan staat)
    this._logs.update(current => [{ time: timeString, message, type }, ...current]);
  }

  // --- INTERNE LOGICA ---

  private startMetronome() {
    this.playBeep('low'); // Direct eerste tik
    this.metronomeIntervalId = setInterval(() => {
      this.playBeep('low');
    }, this.BEAT_MS);
  }

  private stopMetronome() {
    clearInterval(this.metronomeIntervalId);
  }

  private checkCycle() {
    const currentSeconds = this._seconds();
    // Elke 120 seconden (2 min)
    if (currentSeconds > 0 && currentSeconds % 120 === 0) {
      this._rounds.update(r => r + 1);
      this.playBeep('high'); // Alarm
      this.logEvent(`Ronde ${this._rounds()} voltooid - Wissel!`, 'info');

      // Tril signaal (als device het ondersteunt)
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([500, 200, 500]);
      }
    }
  }

  // Genereer geluidje (Oscillator)
  private playBeep(type: 'low' | 'high') {
    if (!this.audioCtx) return;

    const oscillator = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);

    if (type === 'high') {
      // Alarm (Hogere toon, iets langer)
      oscillator.type = 'square'; // 'Square' is de felste toon
      oscillator.frequency.value = 880; // A5

      // AANPASSING: Volume van 0.5 naar 1.0 (Maximaal)
      gainNode.gain.setValueAtTime(1.0, this.audioCtx.currentTime);

      oscillator.start();
      oscillator.stop(this.audioCtx.currentTime + 0.6);
    } else {
      // Metronoom tik (Kort, duidelijk)
      // AANPASSING: Van 'sine' naar 'triangle' (klinkt scherper/harder)
      oscillator.type = 'triangle';
      oscillator.frequency.value = 600;

      // AANPASSING: Volume van 0.3 naar 0.8 (Veel harder)
      gainNode.gain.setValueAtTime(0.8, this.audioCtx.currentTime);

      oscillator.start();
      oscillator.stop(this.audioCtx.currentTime + 0.1);
    }
  }
  // Wake Lock (Scherm aanhouden)
  private async requestWakeLock() {
    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
      try { await (navigator as any).wakeLock.request('screen'); } catch (e) {
        console.warn('Wake Lock niet beschikbaar', e);
      }
    }
  }
}
