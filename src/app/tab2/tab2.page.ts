import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { ClinicalDataService } from '../services/clinical-data.service';

// De Info Component
import { InfoModalComponent } from '../info-modal.component';

// Importeer de Subscription type voor proper cleanup
import { Subscription } from 'rxjs';

import { addIcons } from 'ionicons';
import { informationCircleOutline, chevronForwardOutline, cloudOutline, calculatorOutline } from 'ionicons/icons';

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
export class Tab2Page implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = [];

  // --- INPUTS (Gedeeld) ---
  fio2: number | null = null;
  pao2: number | null = null;
  paco2: number | null = null;
  sao2: number | null = null;

  // Nieuwe inputs voor uitgebreide berekening (boven)
  hb: number | null = null;
  svo2: number | null = null;

  // --- INPUTS NIEUWE BLOKJES (onder) ---
  etCO2: number | null = null;
  rr: number | null = null;

  // --- RESULTATEN BOVEN (Oxygenatie) ---
  resPAO2: number | null = null;
  resAaGrad: number | null = null;
  resAaRatio: number | null = null;
  resPFRatio: number | null = null;
  resCaO2: number | null = null;

  // --- RESULTATEN CO2 ONDER ---
  co2Gradient: string | null = null;
  deadSpacePerc: string | null = null;
  gapColor: string = 'white';
  vdColor: string = 'white';
  co2Advies: string = '';

  // --- RESULTATEN ROX ONDER ---
  roxScore: string | null = null;
  roxColor: string = 'white';
  roxAdvies: string = '';

  // --- STATUS TEKSTEN & KLEUREN ---
  aaStatusTekst = '';
  aaStatusKleur = 'medium';
  aaVerwacht: number | null = null;

  pfStatusTekst = '';
  pfStatusKleur = 'medium';

  resSvO2Message = '';
  resSvO2Color = 'medium';

  toonResultaten = false;

  constructor(
    public patient: PatientService,
    private calc: CalculatorService,
    private modalCtrl: ModalController,
    private clinicalData: ClinicalDataService
  ) {
    addIcons({chevronForwardOutline,cloudOutline,calculatorOutline,informationCircleOutline});
  }

  ngOnInit() {
    // Initialize with current values from the shared service
    this.paco2 = this.clinicalData.getPaCO2();
    this.etCO2 = this.clinicalData.getEtCO2();
    
    // Subscribe to shared PaCO2 and EtCO2 values
    // Update local values when they change in other components
    const paco2Sub = this.clinicalData.paCO2$.subscribe(value => {
      if (this.paco2 !== value) {
        this.paco2 = value;
        // Trigger recalculation if needed
        if (this.toonResultaten) {
          this.performCO2Calculation();
          this.calculateROX();
        }
      }
    });
    
    const etco2Sub = this.clinicalData.etCO2$.subscribe(value => {
      if (this.etCO2 !== value) {
        this.etCO2 = value;
        // Trigger recalculation if needed  
        if (this.toonResultaten) {
          this.performCO2Calculation();
          this.calculateROX();
        }
      }
    });

    this.subscriptions.push(paco2Sub, etco2Sub);
  }

  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // --- 1. CO2 BEREKENING ---
  calculateCO2() {
    // Update shared service when PaCO2 or EtCO2 changes locally
    this.clinicalData.setPaCO2(this.paco2);
    this.clinicalData.setEtCO2(this.etCO2);
    
    this.performCO2Calculation();
  }

  // Perform CO2 calculation without updating shared service
  private performCO2Calculation() {
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

  // --- 2. ROX BEREKENING ---
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
        this.roxAdvies = 'HOOG RISICO! Overweeg intubatie';
      } else {
        this.roxColor = '#ffc409';
        this.roxAdvies = 'Grijs gebied: Monitor nauwgezet';
      }
    } else {
      this.roxScore = null;
      this.roxAdvies = '';
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
      <ul>
        <li><strong>Normaal (< 0.8 kPa):</strong> Goede match tussen ventilatie en perfusie.</li>
        <li><strong>Verhoogd:</strong> Dode ruimte ventilatie (wel lucht, geen bloed). Denk aan longembolie, lage cardiac output of hoge PEEP.</li>
      </ul>

      <h3>4. ROX Index (HFNO)</h3>
      <p>Voorspeller voor falen van High Flow therapie.</p>
      <ul>
         <li><strong>< 3.85:</strong> Hoog risico op falen (Overweeg intubatie).</li>
         <li><strong>> 4.88:</strong> Laag risico op falen.</li>
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

  // --- BEREKEN ALLES (Grote knop) ---
  bereken() {
    if (this.fio2 == null || this.paco2 == null) {
      return;
    }

    // 1. PAO2
    this.resPAO2 = this.calc.calcPAO2(this.fio2, this.paco2);

    // 2. Gradiënten & P/F
    if (this.pao2 != null) {
      this.resAaGrad = this.calc.calcAaGradient(this.resPAO2, this.pao2);
      this.resAaRatio = this.calc.calcAaRatio(this.pao2, this.resPAO2);

      const leeftijd = this.patient.current.leeftijd || 20;
      this.aaVerwacht = 2.0 + (leeftijd * 0.03);

      if (this.resAaGrad > this.aaVerwacht) {
        this.aaStatusTekst = 'Verhoogd';
        this.aaStatusKleur = 'danger';
      } else {
        this.aaStatusTekst = 'Normaal';
        this.aaStatusKleur = 'success';
      }

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

    // 3. CaO2
    if (this.hb != null && this.sao2 != null && this.pao2 != null) {
      this.resCaO2 = this.calc.calcCaO2(this.hb, this.sao2, this.pao2);
    }

    // 4. SvO2
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
    } else {
      this.resSvO2Message = '';
    }

    // Trigger ook de andere berekeningen
    this.calculateROX();
    this.calculateCO2();

    this.toonResultaten = true;
  }

  reset() {
    this.fio2 = null;
    this.pao2 = null;
    this.paco2 = null;
    this.hb = null;
    this.sao2 = null;
    this.svo2 = null;
    this.etCO2 = null;
    this.rr = null;

    // Update shared service
    this.clinicalData.setPaCO2(null);
    this.clinicalData.setEtCO2(null);

    this.resPAO2 = null;
    this.resAaGrad = null;
    this.resAaRatio = null;
    this.resPFRatio = null;
    this.resCaO2 = null;
    this.resSvO2Message = '';
    this.resSvO2Color = 'medium';

    this.co2Gradient = null;
    this.deadSpacePerc = null;
    this.co2Advies = '';

    this.roxScore = null;
    this.roxAdvies = '';

    this.toonResultaten = false;
  }
}
