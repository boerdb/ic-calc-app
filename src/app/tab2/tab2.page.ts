import { Component, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Alle Ionic componenten
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonList, IonItem, IonInput, IonButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonLabel, IonNote, IonGrid, IonRow, IonCol, IonButtons,
  IonBadge, ModalController, IonIcon
} from '@ionic/angular/standalone';

// Onze eigen services
import { CalculatorService } from '../services/calculator';
import { PatientService } from '../services/patient';

// De Info Component
import { InfoModalComponent } from '../info-modal.component';

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

  // Modern inject() function instead of constructor injection
  public patient = inject(PatientService);
  private calc = inject(CalculatorService);
  private modalCtrl = inject(ModalController);

  // --- INPUTS (Gedeeld) - now using signals ---
  fio2 = signal<number | null>(null);
  pao2 = signal<number | null>(null);
  paco2 = signal<number | null>(null);
  sao2 = signal<number | null>(null);

  // Nieuwe inputs voor uitgebreide berekening (boven)
  hb = signal<number | null>(null);
  svo2 = signal<number | null>(null);

  // --- INPUTS NIEUWE BLOKJES (onder) ---
  etCO2 = signal<number | null>(null);
  rr = signal<number | null>(null);

  // --- RESULTATEN BOVEN (Oxygenatie) ---
  resPAO2 = signal<number | null>(null);
  resAaGrad = signal<number | null>(null);
  resAaRatio = signal<number | null>(null);
  resPFRatio = signal<number | null>(null);
  resCaO2 = signal<number | null>(null);

  // --- RESULTATEN CO2 ONDER ---
  co2Gradient = signal<string | null>(null);
  deadSpacePerc = signal<string | null>(null);
  gapColor = signal<string>('white');
  vdColor = signal<string>('white');
  co2Advies = signal<string>('');

  // --- RESULTATEN ROX ONDER ---
  roxScore = signal<string | null>(null);
  roxColor = signal<string>('white');
  roxAdvies = signal<string>('');

  // --- STATUS TEKSTEN & KLEUREN ---
  aaStatusTekst = signal<string>('');
  aaStatusKleur = signal<string>('medium');
  aaVerwacht = signal<number | null>(null);

  pfStatusTekst = signal<string>('');
  pfStatusKleur = signal<string>('medium');

  resSvO2Message = signal<string>('');
  resSvO2Color = signal<string>('medium');

  toonResultaten = signal<boolean>(false);

  constructor() {
    // Set up reactive calculations using effect
    effect(() => {
      this.performCalculations();
    });
  }

  // --- 1. CO2 BEREKENING ---
  calculateCO2() {
    const paco2Val = this.paco2();
    const etCO2Val = this.etCO2();
    
    if (paco2Val != null && etCO2Val != null) {
      const gap = paco2Val - etCO2Val;
      this.co2Gradient.set(gap.toFixed(1));

      if (paco2Val > 0) {
        const vd = (gap / paco2Val) * 100;
        this.deadSpacePerc.set(vd.toFixed(0));
        this.vdColor.set(vd > 30 ? '#ffc409' : '#2dd36f');
      }

      if (gap < 0.8) {
        this.gapColor.set('#2dd36f');
        this.co2Advies.set('Normale gaswisseling');
      } else if (gap < 1.5) {
        this.gapColor.set('#ffc409');
        this.co2Advies.set('Verhoogde dode ruimte (mogelijke V/Q mismatch)');
      } else {
        this.gapColor.set('#eb445a');
        this.co2Advies.set('Ernstige dode ruimte ventilatie (o.a. Longembolie?)');
      }
    } else {
      this.co2Gradient.set(null);
      this.deadSpacePerc.set(null);
      this.co2Advies.set('');
    }
  }

  // --- 2. ROX BEREKENING ---
  calculateROX() {
    const sao2Val = this.sao2();
    const fio2Val = this.fio2();
    const rrVal = this.rr();
    
    if (sao2Val && fio2Val && rrVal && rrVal > 0) {
      const fio2Fraction = fio2Val / 100;
      const result = (sao2Val / fio2Fraction) / rrVal;

      this.roxScore.set(result.toFixed(2));

      if (result >= 4.88) {
        this.roxColor.set('#2dd36f');
        this.roxAdvies.set('Laag risico op falen HFNO');
      } else if (result < 3.85) {
        this.roxColor.set('#eb445a');
        this.roxAdvies.set('Hoge kans op falen → overweeg intubatie');
      } else {
        this.roxColor.set('#ffc409');
        this.roxAdvies.set('Grensgebied → opnieuw beoordelen na 1–2 uur');
      }
    } else {
      this.roxScore.set(null);
      this.roxAdvies.set('');
    }
  }

  // --- INFO MODAL (NU MET ALLE TEKST TERUG!) ---
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
      </ul>
      <div style="text-align: center; margin: 10px 0;">
           <img src="assets/VQ.png" style="width: 100%; max-width: 350px; border-radius: 8px; border: 1px solid #444;">
           <div style="font-size: 0.8em; color: #888;">V/Q mismatch</div>
      </div>

      <h3>3. CO₂ Gradiënt (Dode ruimte)</h3>
<p>Verschil tussen PaCO₂ en EtCO₂.</p>

<p><strong>Formule:</strong><br>
CO₂‑gradiënt = PaCO₂ − EtCO₂
</p>

<ul>
  <li><strong>Normaal (< 0.8 kPa):</strong> Goede match tussen ventilatie en perfusie.</li>
  <li><strong>Verhoogd:</strong> Dode ruimte ventilatie (wel lucht, geen bloed). Denk aan longembolie, lage cardiac output of hoge PEEP.</li>
</ul>



      <h3>4. ROX Index (HFNO)</h3>
<p>Voorspeller voor falen van High Flow therapie.</p>

<p><strong>Formule:</strong><br>
ROX = (SpO₂ / FiO₂) / Ademfrequentie
</p>

<ul>
  <li><strong>&lt; 3.85:</strong> Hoog risico op falen (Overweeg intubatie).</li>
  <li><strong>&gt; 4.88:</strong> Laag risico op falen.</li>
</ul>


    `;

    const modal = await this.modalCtrl.create({
      component: InfoModalComponent,
      componentProps: {
        title: 'Gaswisseling Info',
        content: htmlContent
      }
    });
    await modal.present();
  }

  // --- BEREKEN ALLES (Automatically via effect) ---
  performCalculations() {
    const fio2Val = this.fio2();
    const paco2Val = this.paco2();
    
    if (fio2Val == null || paco2Val == null) {
      return;
    }

    // 1. PAO2
    this.resPAO2.set(this.calc.calcPAO2(fio2Val, paco2Val));

    // 2. Gradiënten & P/F
    const pao2Val = this.pao2();
    const resPAO2Val = this.resPAO2();
    
    if (pao2Val != null && resPAO2Val != null) {
      this.resAaGrad.set(this.calc.calcAaGradient(resPAO2Val, pao2Val));
      this.resAaRatio.set(this.calc.calcAaRatio(pao2Val, resPAO2Val));

      const leeftijd = this.patient.current.leeftijd || 20;
      const aaVerwachtVal = 2.0 + (leeftijd * 0.03);
      this.aaVerwacht.set(aaVerwachtVal);

      const resAaGradVal = this.resAaGrad();
      if (resAaGradVal && resAaGradVal > aaVerwachtVal) {
        this.aaStatusTekst.set('Verhoogd');
        this.aaStatusKleur.set('danger');
      } else {
        this.aaStatusTekst.set('Normaal');
        this.aaStatusKleur.set('success');
      }

      const fiO2Decimaal = fio2Val / 100;
      const pfRatioVal = pao2Val / fiO2Decimaal;
      this.resPFRatio.set(pfRatioVal);

      if (pfRatioVal > 40) {
        this.pfStatusTekst.set('Normaal');
        this.pfStatusKleur.set('success');
      } else if (pfRatioVal > 26.6) {
        this.pfStatusTekst.set('Milde ARDS');
        this.pfStatusKleur.set('warning');
      } else if (pfRatioVal > 13.3) {
        this.pfStatusTekst.set('Matige ARDS');
        this.pfStatusKleur.set('warning');
      } else {
        this.pfStatusTekst.set('Ernstige ARDS');
        this.pfStatusKleur.set('danger');
      }
    }

    // 3. CaO2
    const hbVal = this.hb();
    const sao2Val = this.sao2();
    
    if (hbVal != null && sao2Val != null && pao2Val != null) {
      this.resCaO2.set(this.calc.calcCaO2(hbVal, sao2Val, pao2Val));
    }

    // 4. SvO2
    const svo2Val = this.svo2();
    if (svo2Val != null) {
      if (svo2Val < 60) {
        this.resSvO2Color.set('danger');
        this.resSvO2Message.set('Laag! (Laag HMV/Hb/Pijn)');
      } else if (svo2Val > 80) {
        this.resSvO2Color.set('warning');
        this.resSvO2Message.set('Hoog! (Sepsis/Shunt)');
      } else {
        this.resSvO2Color.set('success');
        this.resSvO2Message.set('Normaal');
      }
    } else {
      this.resSvO2Message.set('');
    }

    // Trigger ook de andere berekeningen
    this.calculateROX();
    this.calculateCO2();

    this.toonResultaten.set(true);
  }

  reset() {
    this.fio2.set(null);
    this.pao2.set(null);
    this.paco2.set(null);
    this.hb.set(null);
    this.sao2.set(null);
    this.svo2.set(null);
    this.etCO2.set(null);
    this.rr.set(null);

    this.resPAO2.set(null);
    this.resAaGrad.set(null);
    this.resAaRatio.set(null);
    this.resPFRatio.set(null);
    this.resCaO2.set(null);
    this.resSvO2Message.set('');
    this.resSvO2Color.set('medium');

    this.co2Gradient.set(null);
    this.deadSpacePerc.set(null);
    this.co2Advies.set('');

    this.roxScore.set(null);
    this.roxAdvies.set('');

    this.toonResultaten.set(false);
  }
}
