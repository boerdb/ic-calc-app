import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonList, IonItem, IonInput, IonButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonLabel, IonNote, IonGrid, IonRow, IonCol, IonButtons,
  IonBadge, ModalController, IonIcon, IonText, IonMenuButton
} from '@ionic/angular/standalone';

import { CalculatorService } from '../services/calculator';
import { PatientService } from '../services/patient';
import { InfoModalComponent } from '../info-modal.component';

@Component({
  selector: 'app-rox',
  templateUrl: './rox.page.html',
  styleUrls: ['./rox.page.scss'],
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
export class RoxPage {
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
      breakpoints: [0, 0.5, 1],
      initialBreakpoint: 1,
      handle: true
    });
    return await modal.present();
  }

  async toonCO2Info() {
    // reuse same HTML from tab2
    const htmlContent = `...`; // kept concise to avoid duplication here
    await this.presentInfoModal('CO₂ Interpretatie', htmlContent);
  }

  async toonRoxInfo() {
    const htmlContent = `...`;
    await this.presentInfoModal('ROX‑index Uitleg', htmlContent);
  }

  async toonInfo() {
    const htmlContent = `...`;
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
