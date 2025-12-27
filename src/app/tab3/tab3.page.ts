import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonBadge, IonButton, IonCard,
  IonCardContent, IonCardHeader, IonCardTitle,
  IonCol, IonContent, IonGrid, IonHeader,
  IonInput, IonItem, IonLabel, IonRow,
  IonSegment, IonSegmentButton, IonText,
  IonTitle, IonToolbar, IonList, IonNote, IonButtons,
  IonIcon, AlertController // <--- AlertController & IonIcon toegevoegd
} from '@ionic/angular/standalone';

import { PatientService } from '../services/patient';
import { CalculatorService } from '../services/calculator';

// Icoon registreren
import { addIcons } from 'ionicons';
import { informationCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonItem, IonInput, IonLabel, IonButton,
    IonText, IonBadge, IonGrid, IonRow, IonCol,
    IonSegment, IonSegmentButton, IonList, IonNote, IonButtons,
    IonIcon // <--- Vergeet deze niet
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
  public inputResistance: number | null = null;
  public inputPaCO2: number | null = null;
  public inputPeCO2: number | null = null;

  // --- RESULTATEN ---
  public resDrivingPressure: number | null = null;
  public resCstat: number | null = null;
  public resCdyn: number | null = null;
  public resMechPower: number | null = null;
  public resVtPerKg: number | null = null;
  public resTimeConstant: number | null = null;
  public resVdVt: number | null = null;

  // --- SPONTANEOUS INPUTS ---
  public inputSponPpeak: number | null = null;
  public inputSponPeepTot: number | null = null;
  public inputSponPnadir: number | null = null;
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
    private calc: CalculatorService,
    private alertCtrl: AlertController // <--- Injecteren
  ) {
    // Icoon registreren
    addIcons({ informationCircleOutline });
  }

  public segmentChanged(ev: any) {
    this.mode = ev.detail.value;
  }

  // --- NIEUW: Info Pop-up die meeschakelt ---
  async toonInfo() {
    let header = 'Ventilatie Info';
    let message = '';

    if (this.mode === 'controlled') {
      header = 'Controlled Parameters';
      message =
        'Driving Pressure: De "drive" die de long belast (Pplat - PEEP). Doel < 15.\n\n' +
        'C-Stat: Statische compliantie (rekbaarheid) van de long.\n\n' +
        'Mech. Power: De hoeveelheid energie die per minuut in de longen wordt gepompt. Doel < 17 J/min.\n\n' +
        'Tijdconstante (RC): Hoe snel de long vult/leegt (RxC). 3x RC is tijd voor 95% uitademing.\n\n' +
        'Vd/Vt: Dode ruimte ratio. Het deel van de ademteug dat niet deelneemt aan gaswisseling.';
    } else {
      header = 'Spontaneous (VentICalc)';
      message =
        'P-nadir: De diepste negatieve druk tijdens een occlusie-manoeuvre (inspiratoire hold).\n\n' +
        'Pmus: Geschatte spierkracht van het diafragma. Doel < 10-15.\n\n' +
        'Ptp: Transpulmonale druk (stress op de longblaasjes). Doel < 25.\n\n' +
        'Doel: Beoordelen of de ademarbeid te hoog is (lung injury) of te laag (atrofie).';
    }

    const alert = await this.alertCtrl.create({
      header: header,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  public berekenControlled(): void {
    if (!this.inputVt || !this.inputPeep) return;

    if (this.patient.current.ibw) {
      this.resVtPerKg = this.inputVt / this.patient.current.ibw;
    }

    if (this.inputPplat) {
      this.resDrivingPressure = this.inputPplat - this.inputPeep;
      this.dpKleur = this.resDrivingPressure > 15 ? 'danger' : 'success';
      if (this.resDrivingPressure > 0) {
        this.resCstat = this.calc.calcStaticCompliance(this.inputVt, this.inputPplat, this.inputPeep);
      }
    }

    if (this.inputPpiek) {
      this.resCdyn = this.calc.calcDynamicCompliance(this.inputVt, this.inputPpiek, this.inputPeep);
    }

    if (this.inputRR && this.inputPpiek && this.inputPplat) {
      this.resMechPower = this.calc.calcMechanicalPower(this.inputVt, this.inputRR, this.inputPpiek, this.inputPplat, this.inputPeep);
      this.mpKleur = this.resMechPower > 17 ? 'warning' : 'success';
    }

    const compliance = this.resCstat || this.resCdyn;
    if (compliance && this.inputResistance) {
      this.resTimeConstant = this.calc.calcTimeConstant(compliance, this.inputResistance);
    }

    if (this.inputPaCO2 && this.inputPeCO2) {
      this.resVdVt = this.calc.calcVdVt(this.inputPaCO2, this.inputPeCO2);
    }
  }

  public berekenSpontaneous(): void {
    if (this.inputSponPpeak !== null && this.inputSponPeepTot !== null && this.inputSponPnadir !== null) {
      this.resPocc = this.inputSponPnadir - this.inputSponPeepTot;
      this.resPmus = this.calc.calcPmus(this.inputSponPnadir, this.inputSponPeepTot);
      this.resPtp = this.calc.calcPtp(this.inputSponPpeak, this.inputSponPeepTot, this.inputSponPnadir);
      this.pmusKleur = (this.resPmus > 15) ? 'danger' : (this.resPmus > 10) ? 'warning' : 'success';
      this.ptpKleur = (this.resPtp > 25) ? 'danger' : 'success';
    }
    if (this.inputPaCO2 && this.inputPeCO2) {
      this.resVdVt = this.calc.calcVdVt(this.inputPaCO2, this.inputPeCO2);
    }
  }

  public resetVelden(): void {
    this.inputVt = null; this.inputRR = null; this.inputPeep = null;
    this.inputPplat = null; this.inputPpiek = null;
    this.inputResistance = null; this.inputPaCO2 = null; this.inputPeCO2 = null;
    this.inputSponPpeak = null; this.inputSponPeepTot = null; this.inputSponPnadir = null;

    this.resDrivingPressure = null; this.resCstat = null; this.resCdyn = null;
    this.resVtPerKg = null; this.resMechPower = null; this.resTimeConstant = null;
    this.resVdVt = null; this.resPocc = null; this.resPmus = null; this.resPtp = null;
    this.dpKleur = 'medium'; this.mpKleur = 'medium'; this.pmusKleur = 'medium'; this.ptpKleur = 'medium';
  }
}
