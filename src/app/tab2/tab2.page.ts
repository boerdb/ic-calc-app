import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonList, IonItem, IonInput, IonButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonLabel, IonNote, IonGrid, IonRow, IonCol, IonButtons,
  IonBadge, ModalController, IonIcon, IonText,IonMenuButton
} from '@ionic/angular/standalone';

import { CalculatorService } from '../services/calculator';
import { PatientService } from '../services/patient';
import { InfoModalComponent } from '../info-modal.component';

@Component({
  selector: 'app-tab2',
  templateUrl: './tab2.page.html',
  styleUrls: ['./tab2.page.scss'],
  standalone: true,
  imports: [
    IonButtons, CommonModule, FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonList, IonItem, IonInput, IonButton,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonLabel, IonNote, IonGrid, IonRow, IonCol,
    IonBadge, IonIcon, IonMenuButton
  ]
})
export class Tab2Page {
  // Services geïnjecteerd via de moderne inject() functie
  public patient = inject(PatientService);
  private calc = inject(CalculatorService);
  private modalCtrl = inject(ModalController);

  // --- INPUTS ---
  fio2: number | null = null;
  pao2: number | null = null;
  paco2: number | null = null;
  sao2: number | null = null;
  hb: number | null = null;
  svo2: number | null = null;
  etCO2: number | null = null;
  rr: number | null = null;

  // --- RESULTATEN ---
  resPAO2: number | null = null;
  resAaGrad: number | null = null;
  resAaRatio: number | null = null;
  resPFRatio: number | null = null;
  resCaO2: number | null = null;

  co2Gradient: string | null = null;
  deadSpacePerc: string | null = null;
  gapColor: string = 'white';
  vdColor: string = 'white';
  co2Advies: string = '';

  roxScore: string | null = null;
  roxColor: string = 'white';
  roxAdvies: string = '';

  aaStatusTekst = '';
  aaStatusKleur = 'medium';
  aaVerwacht: number | null = null;
  pfStatusTekst = '';
  pfStatusKleur = 'medium';
  resSvO2Message = '';
  resSvO2Color = 'medium';

  toonResultaten = false;

  // --- BEREKENINGEN ---

  calculateCO2() {
    if (this.paco2 != null && this.etCO2 != null) {
      const gap = this.paco2 - this.etCO2;
      this.co2Gradient = gap.toFixed(1);

      if (this.paco2 > 0) {
        const vd = (gap / this.paco2) * 100;
        this.deadSpacePerc = vd.toFixed(0);
        this.vdColor = vd > 30 ? '#ffc409' : '#2dd36f';
      }

      if (gap < 0.8) {
        this.gapColor = '#2dd36f';
        this.co2Advies = 'Normale gaswisseling';
      } else if (gap < 1.5) {
        this.gapColor = '#ffc409';
        this.co2Advies = 'Verhoogde dode ruimte (mogelijke V/Q mismatch)';
      } else {
        this.gapColor = '#eb445a';
        this.co2Advies = 'Ernstige dode ruimte ventilatie (o.a. Longembolie?)';
      }
    } else {
      this.co2Gradient = null;
      this.deadSpacePerc = null;
      this.co2Advies = '';
    }
  }

  calculateROX() {
    if (this.sao2 && this.fio2 && this.rr && this.rr > 0) {
      const fio2Fraction = this.fio2 / 100;
      const result = (this.sao2 / fio2Fraction) / this.rr;
      this.roxScore = result.toFixed(2);

      if (result >= 4.88) {
        this.roxColor = '#2dd36f';
        this.roxAdvies = 'Laag risico op falen HFNO';
      } else if (result < 3.85) {
        this.roxColor = '#eb445a';
        this.roxAdvies = 'Hoge kans op falen → overweeg intubatie';
      } else {
        this.roxColor = '#ffc409';
        this.roxAdvies = 'Grensgebied → opnieuw beoordelen na 1–2 uur';
      }
    } else {
      this.roxScore = null;
      this.roxAdvies = '';
    }
  }

  // --- MODALS ---
private async presentInfoModal(title: string, content: string) {
  const modal = await this.modalCtrl.create({
    component: InfoModalComponent,
    componentProps: { title, content },
    // Voeg 'handle="true"' toe voor een visuele indicator bovenin de sheet
    breakpoints: [0, 0.5, 1],
    initialBreakpoint: 1, // Open direct op volledig scherm voor leesbaarheid
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

async toonInfo() {
  const htmlContent = `
    <h3 style="color: #4db6ac; margin-bottom: 0.5em;">Zuurstofbalans & Diffusie</h3>

    <p><strong>1. Alveolaire O₂ (PAO₂)</strong><br>
    Berekende zuurstofdruk in de alveoli, afhankelijk van FiO₂ en atmosferische druk.<br>
    <em>Geeft aan hoeveel zuurstof beschikbaar is voor diffusie naar het bloed.</em><br>
    <small><strong>NW:</strong> varieert met FiO₂; bij 21% O₂ meestal 13–14 kPa.</small></p>

    <p><strong>2. A–a Gradiënt</strong><br>
    Verschil tussen alveolaire en arteriële zuurstofdruk.<br>
    <em>Verhoogd bij shunting, V/Q mismatch of diffusieproblemen.</em><br>
    <small><strong>NW:</strong> jong < 2 kPa, ouder < 4 kPa (neemt toe met leeftijd).</small></p>

    <p><strong>3. P/F Ratio (Horowitz)</strong><br>
    Verhouding tussen PaO₂ en FiO₂. Maatstaf voor oxygenatie-efficiëntie.<br>
    <em>Wordt gebruikt om de ernst van ARDS te bepalen.</em><br>
    <small><strong>NW:</strong> > 40 kPa (normale oxygenatie).</small></p>

    <p><strong>4. CaO₂ (O₂ Content)</strong><br>
    Totale zuurstofinhoud in arterieel bloed: Hb‑gebonden + opgelost O₂.<br>
    <em>Belangrijk voor weefseloxygenatie en perfusiebeoordeling.</em><br>
    <small><strong>NW:</strong> 16–22 mL/dL.</small></p>

    <p><strong>5. ScvO₂</strong><br>
    Centrale veneuze zuurstofsaturatie. Reflecteert balans tussen O₂‑aanbod en -verbruik.<br>
    <em>Laag bij verminderde cardiac output, laag Hb of verhoogde metabole vraag.</em><br>
    <small><strong>NW:</strong> 70–75%.</small></p>
  `;
  await this.presentInfoModal('Gaswisseling Info', htmlContent);
}



  // --- ALGEMENE LOGICA ---

  bereken() {
    if (this.fio2 == null || this.paco2 == null) return;

    this.resPAO2 = this.calc.calcPAO2(this.fio2, this.paco2);

    if (this.pao2 != null) {
      this.resAaGrad = this.calc.calcAaGradient(this.resPAO2, this.pao2);
      this.resAaRatio = this.calc.calcAaRatio(this.pao2, this.resPAO2);

      const leeftijd = this.patient.current.leeftijd || 20;
      this.aaVerwacht = 2.0 + (leeftijd * 0.03);

      this.aaStatusTekst = this.resAaGrad > this.aaVerwacht ? 'Verhoogd' : 'Normaal';
      this.aaStatusKleur = this.resAaGrad > this.aaVerwacht ? 'danger' : 'success';

      const fiO2Decimaal = this.fio2 / 100;
      this.resPFRatio = this.pao2 / fiO2Decimaal;

      if (this.resPFRatio > 40) {
        this.pfStatusTekst = 'Normaal';
        this.pfStatusKleur = 'success';
      } else if (this.resPFRatio > 13.3) {
        this.pfStatusTekst = 'Matige ARDS';
        this.pfStatusKleur = 'warning';
      } else {
        this.pfStatusTekst = 'Ernstige ARDS';
        this.pfStatusKleur = 'danger';
      }
    }

    if (this.hb != null && this.sao2 != null && this.pao2 != null) {
      this.resCaO2 = this.calc.calcCaO2(this.hb, this.sao2, this.pao2);
    }

    if (this.svo2 != null) {
      if (this.svo2 < 60) {
        this.resSvO2Color = 'danger';
        this.resSvO2Message = 'Laag! (Laag HMV/Hb/Pijn)';
      } else if (this.svo2 > 80) {
        this.resSvO2Color = 'warning';
        this.resSvO2Message = 'Hoog! (Sepsis/Shunt)';
      } else {
        this.resSvO2Color = 'success';
        this.resSvO2Message = 'Normaal';
      }
    }

    this.calculateROX();
    this.calculateCO2();
    this.toonResultaten = true;
  }

  reset() {
    this.fio2 = this.pao2 = this.paco2 = this.hb = this.sao2 = this.svo2 = this.etCO2 = this.rr = null;
    this.resPAO2 = this.resAaGrad = this.resAaRatio = this.resPFRatio = this.resCaO2 = null;
    this.co2Gradient = this.deadSpacePerc = this.roxScore = null;
    this.resSvO2Message = this.co2Advies = this.roxAdvies = '';
    this.toonResultaten = false;
  }
}
