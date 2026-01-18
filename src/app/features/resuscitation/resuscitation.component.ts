import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { ResuscitationService } from '@core/services/resuscitation.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-resuscitation',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar color="dark">
        <ion-buttons slot="start">
          <ion-button (click)="goBack()" color="light">
            <ion-icon name="chevron-back"></ion-icon>
          </ion-button>
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
        <p class="subtitle">Ronde {{ timer.rounds() }}</p>
      </div>

      <div class="actions-container">

        <ion-card class="action-card">
          <ion-card-content>
            <div class="med-row">
              <div class="med-label">
                <h2>Adrenaline</h2>
                <span class="med-dose">1mg i.v.</span>
              </div>

              <div class="checkbox-group">
                @for (i of [1,2,3,4]; track i) {
                  <div class="check-box"
                       [class.checked]="timer.adrenalineCount() >= i"
                       (click)="timer.recordAdrenaline()">
                       {{ i }}
                  </div>
                }
              </div>
            </div>

            @if (timer.adrenalineCount() >= 4) {
              <div style="margin-top: 10px;">
                <ion-button fill="outline" size="small" expand="block" (click)="timer.recordAdrenaline()">
                  + Extra Dosis
                </ion-button>
              </div>
            }
          </ion-card-content>
        </ion-card>

        <ion-card class="action-card shock-card">
          <ion-card-content>
            <div class="shock-row">
              <div class="shock-controls">
                <ion-label>Energie (Joules)</ion-label>
                <div class="joules-selector">
                  <div class="joule-badge"
                       [class.selected]="selectedJoules === 150"
                       (click)="selectedJoules = 150">150J</div>
                  <div class="joule-badge"
                       [class.selected]="selectedJoules === 200"
                       (click)="selectedJoules = 200">200J</div>
                  <div class="joule-badge"
                       [class.selected]="selectedJoules === 360"
                       (click)="selectedJoules = 360">360J</div>
                </div>
              </div>

              <ion-button color="warning" class="shock-btn" (click)="timer.recordShock(selectedJoules)">
                <ion-icon name="flash" slot="start"></ion-icon>
                SCHOK ({{ selectedJoules }}J)
              </ion-button>
            </div>

            @if (timer.shockCount() > 0) {
              <div class="shock-counter">
                Totaal: {{ timer.shockCount() }}x geschokt
              </div>
            }
          </ion-card-content>
        </ion-card>

        <div class="controls-section">
           <ion-button [color]="timer.isRunning() ? 'medium' : 'success'"
                       expand="block" size="large" class="main-btn"
                       (click)="timer.toggleTimer()">
              <ion-icon [name]="timer.isRunning() ? 'pause' : 'play'" slot="start"></ion-icon>
              {{ timer.isRunning() ? 'PAUZE' : 'START REANIMATIE' }}
           </ion-button>

           <ion-button fill="clear" color="danger" (click)="timer.reset()">
             Alles Resetten
           </ion-button>
        </div>

        @if (timer.logs().length > 0) {
          <div class="log-list">
             <div class="log-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 10px;">
                <h3 style="margin:0;">Logboek</h3>

                <div style="display:flex; gap: 8px;">
                   <ion-button size="small" fill="outline" color="tertiary" (click)="downloadPDF()">
                      <ion-icon name="download-outline" slot="icon-only"></ion-icon>
                   </ion-button>

                   <ion-button size="small" fill="outline" (click)="copyLog()">
                      <ion-icon name="clipboard-outline" slot="icon-only"></ion-icon>
                   </ion-button>
                </div>
             </div>

             @for (log of timer.logs(); track log.time) {
               <div class="log-item" [class.shock-log]="log.type === 'shock'">
                 <span class="log-time">{{ log.time }}</span>
                 <span class="log-msg">{{ log.message }}</span>
               </div>
             }
          </div>
        }

      </div>
    </ion-content>
  `,
  styles: [`
    .timer-content { --background: #121212; --color: white; }

    .clock-section {
      text-align: center; padding: 1.5rem 0; background: #1e1e1e;
      border-bottom: 2px solid #333;
    }
    .clock-section.running { border-bottom-color: var(--ion-color-success); }
    .huge-time { font-size: 4.5rem; font-weight: 800; margin: 0; font-variant-numeric: tabular-nums; line-height: 1; }
    .subtitle { opacity: 0.6; font-size: 1.1rem; text-transform: uppercase; letter-spacing: 1px; }

    .actions-container { padding: 0.8rem; max-width: 600px; margin: 0 auto; }
    .action-card { --background: #2a2a2a; margin-bottom: 0.8rem; border-radius: 12px; }

    .med-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.2rem; }

    /* AANGEPAST: Iets kleinere tekst */
    .med-label h2 { margin: 0; font-size: 1.2rem; font-weight: bold; }
    .med-dose { opacity: 0.7; font-size: 0.85rem; }

    /* AANGEPAST: Compactere checkboxes */
    .checkbox-group { display: flex; gap: 4px; } /* Gap verkleind van 8 naar 4 */
    .check-box {
      width: 38px; height: 38px; /* Verkleind van 42 naar 38 */
      border: 2px solid #555; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-weight: bold; font-size: 1.1rem; color: #777;
      cursor: pointer; transition: all 0.2s;
    }
    .check-box.checked {
      background: var(--ion-color-primary);
      border-color: var(--ion-color-primary);
      color: white; transform: scale(1.05);
    }

    .shock-card { border: 1px solid #b38519; }
    .shock-row { display: flex; flex-direction: column; gap: 0.8rem; }

    /* AANGEPAST: Handmatige Joule Badges ipv ion-chip */
    .joules-selector { display: flex; gap: 8px; margin-top: 0.5rem; }
    .joule-badge {
      padding: 6px 12px;
      border-radius: 16px;
      background: #333;
      color: #aaa;
      border: 1px solid #555; /* Harde border! */
      font-weight: bold;
      font-size: 0.9rem;
      cursor: pointer;
    }
    .joule-badge.selected {
      background: var(--ion-color-warning);
      color: black;
      border-color: var(--ion-color-warning);
    }

    .shock-btn { height: 3.5rem; font-size: 1.2rem; font-weight: bold; --border-radius: 8px; margin-top: 0.5rem; }
    .shock-counter { text-align: center; margin-top: 0.5rem; font-size: 0.9rem; opacity: 0.8; }

    .controls-section { margin: 1.5rem 0; display: flex; flex-direction: column; gap: 8px; }
    .main-btn { height: 4rem; font-weight: bold; --border-radius: 12px; }

    .log-list { margin-top: 2rem; border-top: 1px solid #333; padding-top: 1rem; }
    .log-item {
      display: flex; gap: 1rem; padding: 0.6rem 0;
      border-bottom: 1px solid #2a2a2a; font-size: 0.9rem;
    }
    .shock-log { color: var(--ion-color-warning); }
    .log-time { opacity: 0.5; font-family: monospace; }
    .log-msg { font-weight: 500; }
  `]
})
export class ResuscitationComponent {
  public timer = inject(ResuscitationService);
  private navCtrl = inject(NavController);
  private toastCtrl = inject(ToastController);

  public selectedJoules = 200;

  goBack() {
    this.navCtrl.navigateBack('/home');
  }

  async copyLog() {
    const text = this.timer.getLogExportData();
    await navigator.clipboard.writeText(text);
    const toast = await this.toastCtrl.create({
      message: 'Logboek gekopieerd naar klembord!',
      duration: 2000,
      color: 'success',
      icon: 'clipboard',
      position: 'bottom'
    });
    toast.present();
  }

  async downloadPDF() {
    const doc = new jsPDF();
    const logs = this.timer.logs();
    const now = new Date().toLocaleDateString('nl-NL');

    doc.setFontSize(18);
    doc.text('Reanimatie Verslag ICU Dijklander', 14, 20);

    doc.setFontSize(11);
    doc.text(`Datum: ${now}`, 14, 30);
    doc.text(`Rondes: ${this.timer.rounds()}`, 14, 36);
    doc.text(`Totaal Adrenaline: ${this.timer.adrenalineCount()} mg`, 14, 42);
    doc.text(`Totaal Schokken: ${this.timer.shockCount()}`, 14, 48);

    const tableData = logs.slice().reverse().map(log => [
      log.time,
      log.type.toUpperCase(),
      log.message
    ]);

    autoTable(doc, {
      startY: 55,
      head: [['Tijd', 'Type', 'Gebeurtenis']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [22, 160, 133] },
      styles: { fontSize: 10 },
      columnStyles: { 0: { cellWidth: 25 }, 1: { cellWidth: 30 } }
    });

    doc.save(`reanimatie_${now.replace(/\//g, '-')}.pdf`);

    const toast = await this.toastCtrl.create({
      message: 'PDF Rapport gedownload',
      duration: 2000,
      color: 'success',
      icon: 'download-outline',
      position: 'bottom'
    });
    toast.present();
  }
}
