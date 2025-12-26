import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonBadge, IonButton,  IonCard,
  IonCardContent, IonCardHeader, IonCardTitle,
  IonCol, IonContent, IonGrid, IonHeader,
  IonInput, IonItem, IonLabel, IonRow,
  IonSegment, IonSegmentButton, IonText,
  IonTitle, IonToolbar,IonList,IonNote, IonButtons } from '@ionic/angular/standalone';

import { PatientService } from '../services/patient';
import { CalculatorService } from '../services/calculator';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [IonButtons,
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonItem, IonInput, IonLabel, IonButton,
    IonText, IonBadge, IonGrid, IonRow, IonCol,
    IonSegment, IonSegmentButton,IonList,IonNote
  ]
})
export class Tab3Page {
  public mode: string = 'controlled';

  // --- CONTROLLED INPUTS ---
  public inputVt: number | null = null;
  public inputRR: number | null = null;
  public inputPeep: number | null = null;
  public inputPplat: number | null = null;
  public inputPpiek: number | null = null;

  // Nieuw voor Tijdconstante & Dode ruimte
  public inputResistance: number | null = null;
  public inputPaCO2: number | null = null;
  public inputPeCO2: number | null = null;

  // --- CONTROLLED RESULTATEN ---
  public resDrivingPressure: number | null = null;
  public resCstat: number | null = null;       // Static Compliance
  public resCdyn: number | null = null;        // Dynamic Compliance
  public resMechPower: number | null = null;
  public resVtPerKg: number | null = null;     // ml/kg

  public resTimeConstant: number | null = null; // Tijdconstante
  public resVdVt: number | null = null;         // Dode Ruimte Ratio

  // --- SPONTANEOUS INPUTS ---
  public inputSponPpeak: number | null = null;
  public inputSponPeepTot: number | null = null;
  public inputSponPnadir: number | null = null;

  // --- SPONTANEOUS RESULTATEN ---
  public resPocc: number | null = null;
  public resPmus: number | null = null;
  public resPtp: number | null = null;

  // Kleuren
  public dpKleur: string = 'medium';
  public mpKleur: string = 'medium';
  public pmusKleur: string = 'medium';
  public ptpKleur: string = 'medium';

  constructor(
    public patient: PatientService,
    private calc: CalculatorService
  ) {}

  public segmentChanged(ev: any) {
    this.mode = ev.detail.value;
  }

  // --- BEREKENING CONTROLLED ---
  public berekenControlled(): void {
    if (!this.inputVt || !this.inputPeep) return;

    // 1. Vt per kg
    if (this.patient.current.ibw) {
      this.resVtPerKg = this.inputVt / this.patient.current.ibw;
    }

    // 2. Driving Pressure & C-Stat
    if (this.inputPplat) {
      this.resDrivingPressure = this.inputPplat - this.inputPeep;
      this.dpKleur = this.resDrivingPressure > 15 ? 'danger' : 'success';

      if (this.resDrivingPressure > 0) {
        this.resCstat = this.calc.calcStaticCompliance(this.inputVt, this.inputPplat, this.inputPeep);
      }
    }

    // 3. C-Dyn
    if (this.inputPpiek) {
      this.resCdyn = this.calc.calcDynamicCompliance(this.inputVt, this.inputPpiek, this.inputPeep);
    }

    // 4. Mechanical Power
    if (this.inputRR && this.inputPpiek && this.inputPplat) {
      this.resMechPower = this.calc.calcMechanicalPower(
        this.inputVt, this.inputRR, this.inputPpiek, this.inputPplat, this.inputPeep
      );
      this.mpKleur = this.resMechPower > 17 ? 'warning' : 'success';
    }

    // 5. Tijdconstante (Compliance * Resistance)
    // We gebruiken bij voorkeur Cstat, anders Cdyn
    const compliance = this.resCstat || this.resCdyn;
    if (compliance && this.inputResistance) {
      this.resTimeConstant = this.calc.calcTimeConstant(compliance, this.inputResistance);
    }

    // 6. Dode Ruimte (Vd/Vt)
    if (this.inputPaCO2 && this.inputPeCO2) {
      this.resVdVt = this.calc.calcVdVt(this.inputPaCO2, this.inputPeCO2);
    }
  }

  // --- BEREKENING SPONTANEOUS ---
  public berekenSpontaneous(): void {
    if (this.inputSponPpeak !== null && this.inputSponPeepTot !== null && this.inputSponPnadir !== null) {
      this.resPocc = this.inputSponPnadir - this.inputSponPeepTot;
      this.resPmus = this.calc.calcPmus(this.inputSponPnadir, this.inputSponPeepTot);
      this.resPtp = this.calc.calcPtp(this.inputSponPpeak, this.inputSponPeepTot, this.inputSponPnadir);

      this.pmusKleur = (this.resPmus > 15) ? 'danger' : (this.resPmus > 10) ? 'warning' : 'success';
      this.ptpKleur = (this.resPtp > 25) ? 'danger' : 'success';
    }

    // NIEUW: Dode Ruimte berekening ook hier toestaan!
    if (this.inputPaCO2 && this.inputPeCO2) {
      this.resVdVt = this.calc.calcVdVt(this.inputPaCO2, this.inputPeCO2);
    }
  }

  public resetVelden(): void {
    this.inputVt = null; this.inputRR = null; this.inputPeep = null;
    this.inputPplat = null; this.inputPpiek = null;
    this.inputResistance = null; this.inputPaCO2 = null; this.inputPeCO2 = null;
    this.inputSponPpeak = null; this.inputSponPeepTot = null; this.inputSponPnadir = null;

    this.resDrivingPressure = null;
    this.resCstat = null; this.resCdyn = null;
    this.resVtPerKg = null; this.resMechPower = null;
    this.resTimeConstant = null; this.resVdVt = null;
    this.resPocc = null; this.resPmus = null; this.resPtp = null;

    this.dpKleur = 'medium'; this.mpKleur = 'medium';
    this.pmusKleur = 'medium'; this.ptpKleur = 'medium';
  }
}
