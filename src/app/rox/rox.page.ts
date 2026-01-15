import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton,
  IonCard, IonCardHeader, IonCardContent, IonCardTitle, IonGrid, IonRow, IonCol,
  IonInput, IonButton, IonIcon, IonLabel, ModalController, IonModal } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calculatorOutline, cloudOutline, chevronForwardOutline, closeOutline } from 'ionicons/icons';

// Importeer de component die Tab 2 ook gebruikt
import { InfoModalComponent } from '../info-modal.component';
import { PatientService } from '../services/patient';

@Component({
  selector: 'app-rox',
  templateUrl: './rox.page.html',
  styleUrls: ['./rox.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton,
    IonCard, IonCardContent, IonGrid, IonRow, IonCol,
    IonInput, IonButton, IonIcon
  ]
})
export class RoxPage {
  // Injecteer de ModalController (net als in Tab 2)
  private modalCtrl = inject(ModalController);

  // Use shared patient service so header shows actual bed selection
  public patient = inject(PatientService);

  // Variabelen
  paco2: number | null = null;
  etCO2: number | null = null;
  sao2: number | null = null;
  fio2: number | null = null;
  rr: number | null = null;

  // Resultaten
  co2Gradient: number | null = null;
  deadSpacePerc: number | null = null;
  gapColor: string = 'black';
  vdColor: string = 'black';
  co2Advies: string = '';

  roxScore: number | null = null;
  roxColor: string = 'black';
  roxAdvies: string = '';

  constructor() {
    addIcons({cloudOutline,chevronForwardOutline,calculatorOutline,closeOutline});
  }

  // --- BEREKENINGEN ---

  calculateCO2() {
    if (this.paco2 !== null && this.etCO2 !== null) {
      this.co2Gradient = parseFloat((this.paco2 - this.etCO2).toFixed(1));

      if (this.co2Gradient > 1.0) this.gapColor = 'var(--ion-color-danger)';
      else if (this.co2Gradient > 0.7) this.gapColor = 'var(--ion-color-warning)';
      else this.gapColor = 'var(--ion-color-success)';

      // Formule: (PaCO2 - EtCO2) / PaCO2
      const ratio = (this.paco2 - this.etCO2) / this.paco2;
      this.deadSpacePerc = parseFloat((ratio * 100).toFixed(0));

      if (this.deadSpacePerc > 40) this.vdColor = 'var(--ion-color-danger)';
      else if (this.deadSpacePerc > 30) this.vdColor = 'var(--ion-color-warning)';
      else this.vdColor = 'var(--ion-color-success)';

      if (this.co2Gradient > 0.8) {
        this.co2Advies = 'Verhoogde gradiënt: mogelijk dode ruimte ventilatie (V/Q mismatch, PE, lage CO).';
      } else {
        this.co2Advies = 'Normale CO₂ gradiënt.';
      }
    } else {
      this.co2Gradient = null;
      this.deadSpacePerc = null;
      this.co2Advies = '';
    }
  }

  calculateROX() {
    if (this.sao2 && this.fio2 && this.rr && this.rr > 0) {
      const fractieFiO2 = this.fio2 / 100;
      const ratio = this.sao2 / fractieFiO2;
      const rox = ratio / this.rr;

      this.roxScore = parseFloat(rox.toFixed(2));

      if (this.roxScore >= 4.88) {
        this.roxColor = 'var(--ion-color-success)';
        this.roxAdvies = 'HFNO voortzetten, FiO₂ afbouwen indien mogelijk, regelmatige evaluatie.';
      } else if (this.roxScore < 3.85) {
        this.roxColor = 'var(--ion-color-danger)';
        this.roxAdvies = 'Voorbereiden op vroege intubatie of escalatie volgens lokaal protocol.';
      } else {
        this.roxColor = 'var(--ion-color-warning)';
        this.roxAdvies = 'HFNO optimaliseren, oorzaken behandelen, binnen 1–2 uur opnieuw beoordelen.';
      }
    } else {
      this.roxScore = null;
      this.roxAdvies = '';
    }
  }

  // --- MODALS (Precies zoals Tab 2) ---

  private async presentInfoModal(title: string, content: string) {
    const modal = await this.modalCtrl.create({
      component: InfoModalComponent,
      componentProps: { title, content },
      breakpoints: [0, 0.5, 1],
      initialBreakpoint: 1,
      handle: true
    });
    return await modal.present();
  }

  async toonCO2Info() {
    const htmlContent = `
      <div style="line-height: 1.5; color: white;">
        <p>Hier is een duidelijke, compacte uitleg over het CO₂‑verschil bij een beademde patiënt.</p>

        <h3 style="color: #4db6ac; margin-top: 20px;">🫁 CO₂‑verschil bij een beademde patiënt</h3>
        <p>Bij een beademde patiënt kijken we naar het verschil tussen:</p>
        <ul>
          <li><strong>PaCO₂:</strong> CO₂ in het bloed (via arterieel bloedgas)</li>
          <li><strong>EtCO₂:</strong> CO₂ in de uitgeademde lucht (via capnografie)</li>
        </ul>
        <p>Normaal liggen PaCO₂ en EtCO₂ dicht bij elkaar, met een verschil van ongeveer 0.5 – 0.8 kPa (2–5 mmHg). Dat verschil ontstaat door fysiologische dode ruimte.</p>

        <h3 style="color: #ff8a80; border-bottom: 1px solid #555; padding-bottom: 5px;">📉 Wanneer wordt het verschil groter?</h3>
        <p>Een groter verschil betekent meestal dat ventilatie en perfusie niet goed op elkaar aansluiten (V/Q‑mismatch). Dit kan wijzen op:</p>

        <p><strong>1. Toegenomen dode ruimte:</strong></p>
        <ul style="margin-top: -10px;">
          <li>COPD / emfyseem</li>
          <li>Longembolie</li>
          <li>Ernstige hypotensie of shock</li>
          <li>Overdistensie door te hoge beademingsdrukken (PEEP)</li>
        </ul>

        <h3 style="color: #4db6ac;">📌 Samenvatting</h3>
        <table border="1" style="width: 100%; border-collapse: collapse; font-size: 0.9em; border-color: #555;">
          <tr style="background-color: #333;">
            <th style="padding: 8px; text-align: left;">Parameter</th>
            <th style="padding: 8px; text-align: left;">Betekenis</th>
            <th style="padding: 8px; text-align: left;">Groot verschil?</th>
          </tr>
          <tr>
            <td style="padding: 8px;"><strong>PaCO₂</strong></td>
            <td style="padding: 8px;">CO₂ bloed</td>
            <td style="padding: 8px;">Slechte ventilatie</td>
          </tr>
          <tr>
            <td style="padding: 8px;"><strong>EtCO₂</strong></td>
            <td style="padding: 8px;">CO₂ uitademing</td>
            <td style="padding: 8px;">Lage perfusie</td>
          </tr>
          <tr>
            <td style="padding: 8px;"><strong>Verschil</strong></td>
            <td style="padding: 8px;">Pa-Et Gap</td>
            <td style="padding: 8px;">Dode ruimte ↑</td>
          </tr>
        </table>
      </div>
    `;

    await this.presentInfoModal('CO₂ Interpretatie', htmlContent);
  }

  async toonRoxInfo() {
    const htmlContent = `
      <div style="line-height: 1.6; color: white; padding-bottom: 60px;">
        <p>De ROX‑index helpt inschatten of <strong>High‑Flow Nasal Oxygen (HFNO)</strong> voldoende werkt bij patiënten met acuut hypoxemisch respiratoir falen.</p>

        <h3 style="color: #4db6ac; border-bottom: 1px solid #444; margin-top: 20px;">Formule</h3>

        <div style="background: #333; padding: 20px; border-radius: 8px; text-align: center; margin: 15px 0; border: 1px solid #444;">
          <div style="font-size: 1.3em; font-weight: bold;">
            (SpO₂ / FiO₂)
          </div>
          <div style="border-top: 2px solid white; width: 140px; margin: 5px auto; padding-top: 5px; font-size: 1.3em; font-weight: bold;">
            RR
          </div>
        </div>

        <ul style="list-style-type: none; padding-left: 0; margin-top: 20px;">
          <li>• <strong>SpO₂</strong> = zuurstofsaturatie (%)</li>
          <li>• <strong>FiO₂</strong> = zuurstoffractie (0.21–1.0)</li>
          <li>• <strong>RR</strong> = ademhalingsfrequentie (p/min)</li>
        </ul>

        <h3 style="color: #4db6ac; border-bottom: 1px solid #444; margin-top: 20px;">Klinische drempelwaarden</h3>
        <p style="color: #2dd36f; margin-bottom: 8px;"><strong>ROX ≥ 4.88</strong>: Grote kans dat HFNO succesvol is.</p>
        <p style="color: #eb445a;"><strong>ROX < 3.85</strong>: Verhoogd risico op falen, intubatie overwegen.</p>

        <p style="font-size: 0.85em; opacity: 0.8; font-style: italic; margin-top: 20px;">
          In studies werd een hogere ROX gezien bij patiënten die niet hoefden te worden geïntubeerd.
        </p>
      </div>
    `;
    await this.presentInfoModal('ROX‑index Uitleg', htmlContent);
  }
}
