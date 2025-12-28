import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Alle Ionic componenten
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonList, IonItem, IonInput, IonButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonLabel, IonNote, IonGrid, IonRow, IonCol, IonButtons,
  IonBadge, ModalController, IonIcon // <--- 1. ModalController ipv AlertController
} from '@ionic/angular/standalone';

// Onze eigen services
import { CalculatorService } from '../services/calculator';
import { PatientService } from '../services/patient';

// De Info Component (die mooie popup)
import { InfoModalComponent } from '../info-modal.component'; // <--- 2. Importeren

import { addIcons } from 'ionicons';
import { informationCircleOutline, chevronForwardOutline } from 'ionicons/icons'; // <--- 3. Chevron icoon erbij

@Component({
  selector: 'app-tab2',
  templateUrl: './tab2.page.html',
  styleUrls: ['./tab2.page.scss'],
  standalone: true,
  imports: [IonButtons,
    CommonModule, FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonList, IonItem, IonInput, IonButton,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonLabel, IonNote, IonGrid, IonRow, IonCol,
    IonBadge, IonIcon
  ]
})
export class Tab2Page {

  // --- INPUTS ---
  fio2: number | null = null;    // %
  pao2: number | null = null;    // kPa
  paco2: number | null = null;   // kPa

  // Nieuwe inputs voor uitgebreide berekening
  hb: number | null = null;      // Hb
  sao2: number | null = null;    // Saturatie arterieel
  svo2: number | null = null;    // Saturatie veneus (optioneel)

  // --- RESULTATEN ---
  resPAO2: number | null = null;
  resAaGrad: number | null = null;
  resAaRatio: number | null = null;
  resPFRatio: number | null = null;
  resCaO2: number | null = null;

  // --- STATUS TEKSTEN & KLEUREN ---
  aaStatusTekst = '';
  aaStatusKleur = 'medium';
  aaVerwacht: number | null = null;

  pfStatusTekst = '';
  pfStatusKleur = 'medium';

  // SvO2 Status variabelen
  resSvO2Message = '';
  resSvO2Color = 'medium';

  // Helper om te zien of we resultaten moeten tonen
  toonResultaten = false;

  constructor(
    public patient: PatientService,
    private calc: CalculatorService,
    private modalCtrl: ModalController // <--- 4. ModalController injecteren
  ) {
    addIcons({
      informationCircleOutline,
      chevronForwardOutline
    });
  }

  // --- NIEUWE INFO FUNCTIE (Met mooie HTML Modal) ---
  async toonInfo() {
    const htmlContent = `
      <h3>Zuurstofbalans & Diffusie</h3>
      <p>Interpretatie van de parameters.</p>

      <h3>1. P/F Ratio (Horowitz)</h3>
      <p>De maat voor longschade (ARDS) bij PEEP ≥ 5.</p>
      <ul>
        <li><strong>> 40 kPa:</strong> Normaal</li>
        <li><strong>26.6 - 40:</strong> Milde ARDS</li>
        <li><strong>13.3 - 26.6:</strong> Matige ARDS</li>
        <li><strong>< 13.3:</strong> Ernstige ARDS / overweeg buikligging</li>
      </ul>

      <h3>2. A-a Gradiënt</h3>
      <p>Verschil tussen O₂ in longblaasje (A) en bloed (a). Maat voor diffusieprobleem.</p>
      <ul>
         <li><strong>Verhoogd:</strong> Probleem in de long (V/Q mismatch, shunt, fibrose).</li>
         <li><strong>Normaal:</strong> Oorzaak buiten de long (bijv. hypoventilatie).</li>
      <div style="text-align: center; margin: 10px 0;">
           <img src="assets/VQ.png" style="width: 100%; max-width: 350px; border-radius: 8px; border: 1px solid #444;">
           <div style="font-size: 0.8em; color: #888;">V/Q mismatch</div>
        </div>


         </ul>

      <h3>3. SvO₂ (Veneuze Saturatie)</h3>
      <p>De balans tussen aanbod (DO₂) en verbruik (VO₂).</p>
      <ul>
        <li><strong>Laag (< 60%):</strong> Het weefsel pakt alles wat het pakken kan. Oorzaak: Laag Hb, Lage Output, Koorts, Pijn.</li>
        <li><strong>Hoog (> 80%):</strong> Bloed stroomt te snel (Sepsis) of cellen kunnen O₂ niet gebruiken.</li>
      </ul>
    `;

    const modal = await this.modalCtrl.create({
      component: InfoModalComponent,
      componentProps: {
        title: 'Oxygenatie Info',
        content: htmlContent
      }
    });
    await modal.present();
  }

  bereken() {
    // Minimale vereisten: FiO2 en PaCO2
    if (this.fio2 == null || this.paco2 == null) {
      return;
    }

    // 1. Bereken PAO2 (Alveolair) via de Service
    this.resPAO2 = this.calc.calcPAO2(this.fio2, this.paco2);

    // 2. Als PaO2 ook is ingevuld, kunnen we de gradiënt doen
    if (this.pao2 != null) {
      this.resAaGrad = this.calc.calcAaGradient(this.resPAO2, this.pao2);
      this.resAaRatio = this.calc.calcAaRatio(this.pao2, this.resPAO2);

      // Verwachte Gradiënt op basis van leeftijd
      const leeftijd = this.patient.current.leeftijd || 20;
      this.aaVerwacht = 2.0 + (leeftijd * 0.03);

      if (this.resAaGrad > this.aaVerwacht) {
        this.aaStatusTekst = 'Verhoogd';
        this.aaStatusKleur = 'danger';
      } else {
        this.aaStatusTekst = 'Normaal';
        this.aaStatusKleur = 'success';
      }

      // P/F Ratio (Horowitz)
      const fiO2Decimaal = this.fio2 / 100;
      this.resPFRatio = this.pao2 / fiO2Decimaal;

      if (this.resPFRatio > 40) {
        this.pfStatusTekst = 'Normaal';
        this.pfStatusKleur = 'success';
      } else if (this.resPFRatio > 26.6) {
        this.pfStatusTekst = 'Milde ARDS';
        this.pfStatusKleur = 'warning';
      } else if (this.resPFRatio > 13.3) {
        this.pfStatusTekst = 'Matige ARDS';
        this.pfStatusKleur = 'warning';
      } else {
        this.pfStatusTekst = 'Ernstige ARDS';
        this.pfStatusKleur = 'danger';
      }
    }

    // 3. Oxygen Content (CaO2)
    if (this.hb != null && this.sao2 != null && this.pao2 != null) {
      this.resCaO2 = this.calc.calcCaO2(this.hb, this.sao2, this.pao2);
    }

    // 4. SvO2 / ScvO2 Interpretatie
    if (this.svo2 != null) {
      if (this.svo2 < 60) {
        this.resSvO2Color = 'danger';
        this.resSvO2Message = 'Laag! Verhoogde extractie (DD: Laag HMV/Shock, Laag Hb, Pijn/Koorts)';
      } else if (this.svo2 > 80) {
        this.resSvO2Color = 'warning';
        this.resSvO2Message = 'Hoog! Verlaagde extractie (DD: Sepsis/Shunting, Leverfalen)';
      } else {
        this.resSvO2Color = 'success';
        this.resSvO2Message = 'Normaal (Balans DO2/VO2 adequaat)';
      }
    } else {
      this.resSvO2Message = '';
    }

    this.toonResultaten = true;
  }

  reset() {
    this.fio2 = null;
    this.pao2 = null;
    this.paco2 = null;
    this.hb = null;
    this.sao2 = null;
    this.svo2 = null;

    this.resPAO2 = null;
    this.resAaGrad = null;
    this.resAaRatio = null;
    this.resPFRatio = null;
    this.resCaO2 = null;

    this.resSvO2Message = '';
    this.resSvO2Color = 'medium';

    this.toonResultaten = false;
  }
}
