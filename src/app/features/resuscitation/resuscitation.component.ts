import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
// Let op dit pad: we gaan 2 mappen terug naar core
import { ResuscitationService } from '@core/services/resuscitation.service';

@Component({
  selector: 'app-resuscitation',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar color="dark">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Reanimatie</ion-title>
        <ion-buttons slot="end">
            <ion-button (click)="timer.toggleMetronome()">
                <ion-icon [name]="timer.isMetronomeEnabled() ? 'volume-high' : 'volume-mute'"></ion-icon>
            </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" class="timer-content">

      <div class="clock-section" [class.running]="timer.isRunning()">
        <h1 class="huge-time">{{ timer.formattedTime() }}</h1>
        <p class="subtitle">Verstreken tijd</p>
      </div>

      <div class="info-grid">
        <div class="info-card">
          <ion-icon name="refresh-circle" color="primary"></ion-icon>
          <div class="data">
            <span class="label">Ronde</span>
            <span class="value">{{ timer.rounds() }}</span>
          </div>
        </div>

        <div class="info-card">
           <ion-icon name="timer" color="warning"></ion-icon>
           <div class="data">
             <span class="label">Wissel over</span>
             <span class="value">{{ 120 - (timer.seconds() % 120) }}s</span>
           </div>
        </div>
      </div>

      <div class="controls-section">
        <ion-button
            [color]="timer.isRunning() ? 'warning' : 'success'"
            expand="block"
            class="action-btn"
            (click)="timer.toggleTimer()">
            <ion-icon [name]="timer.isRunning() ? 'pause' : 'play'" slot="start"></ion-icon>
            {{ timer.isRunning() ? 'STOP' : 'START' }}
        </ion-button>

        <ion-button
            fill="clear"
            color="danger"
            (click)="timer.reset()"
            [disabled]="timer.seconds() === 0">
            Reset Timer
        </ion-button>
      </div>
    </ion-content>
  `,
  styles: [`
    .timer-content { --background: #121212; --color: white; }
    .clock-section {
      text-align: center; padding: 3rem 0; background: #1e1e1e;
      border-bottom: 2px solid #333; transition: background 0.3s;
    }
    .clock-section.running {
        background: rgba(40, 180, 99, 0.1);
        border-bottom-color: var(--ion-color-success);
    }
    .huge-time {
      font-size: 6rem; font-weight: 800; margin: 0;
      line-height: 1; font-variant-numeric: tabular-nums;
    }
    .subtitle { opacity: 0.6; text-transform: uppercase; letter-spacing: 2px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; padding: 1.5rem; }
    .info-card { background: #2a2a2a; border-radius: 12px; padding: 1rem; display: flex; align-items: center; gap: 1rem; }
    .info-card ion-icon { font-size: 2.5rem; }
    .data { display: flex; flex-direction: column; }
    .data .value { font-size: 1.5rem; font-weight: bold; }
    .controls-section { padding: 1rem 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
    .action-btn { height: 4rem; font-size: 1.5rem; --border-radius: 12px; }
  `]
})
export class ResuscitationComponent implements OnDestroy {
  public timer = inject(ResuscitationService);

  ngOnDestroy() {
    // Optioneel: resetten als je de pagina verlaat?
    // Of juist niet, zodat de timer doorloopt als je naar protocollen zoekt.
    // Voor nu doen we niets, dus hij loopt door op de achtergrond.
  }
}
