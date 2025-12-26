import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonGrid, IonRow, IonCol, IonInput, IonButton,
  IonList, IonItem, IonLabel, IonNote, IonIcon, IonButtons } from '@ionic/angular/standalone';

// --- DEZE REGELS WAREN NODIG ---
import { addIcons } from 'ionicons';
import { informationCircleOutline } from 'ionicons/icons';

import { PatientService } from '../services/patient';
import { CalculatorService } from '../services/calculator';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
  standalone: true,
  imports: [IonButtons,
    CommonModule, FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonGrid, IonRow, IonCol, IonInput, IonButton,
    IonList, IonItem, IonLabel, IonNote, IonIcon

  ]
})
export class Tab4Page {

  // --- INVOER VARIABELEN ---
  map: number | null = null;    // mmHg
  cvp: number | null = null;    // mmHg
  co: number | null = null;     // L/min

  // --- RESULTAAT VARIABELEN ---
  resSvr: number | null = null;
  resCi: number | null = null;
  resSvri: number | null = null;

  // --- UI STATUS ---
  toonResultaten: boolean = false;

  svrStatus: string = '';
  svrKleur: string = 'medium';
  svrAdvies: string = '';

  ciStatus: string = '';
  ciKleur: string = 'medium';

  constructor(
    public patient: PatientService,
    private calc: CalculatorService
  ) {
    // --- HIER REGISTREREN WE HET ICOON ---
    // Zonder dit weet de HTML niet welk plaatje 'information-circle-outline' is
    addIcons({ informationCircleOutline });
  }

  analyseer() {
    // Check of we genoeg data hebben (MAP, CVP, CO zijn verplicht)
    if (this.map == null || this.cvp == null || this.co == null) {
      return;
    }

    // 1. SVR Berekenen
    this.resSvr = this.calc.calcSVR(this.map, this.cvp, this.co);

    // --- INTERPRETATIE SVR ---
    if (this.resSvr < 800) {
      this.svrStatus = 'Laag (Vasodilatatie)';
      this.svrKleur = 'danger';
      this.svrAdvies = 'Denk aan: Distributieve shock (Sepsis, Anafylaxie).';
    } else if (this.resSvr > 1200) {
      this.svrStatus = 'Hoog (Vasoconstrictie)';
      this.svrKleur = 'warning';
      this.svrAdvies = 'Compensatie voor lage flow of hypovolemie.';
    } else {
      this.svrStatus = 'Normaal';
      this.svrKleur = 'success';
      this.svrAdvies = 'Vaattonus is adequaat.';
    }

    // 2. Cardiac Index (CI) & SVRI Berekenen
    const bsa = this.patient.current.bsa;

    if (bsa) {
      this.resCi = this.calc.calcCI(this.co, bsa);
      this.resSvri = this.calc.calcSVRI(this.resSvr, bsa);

      // --- INTERPRETATIE CI ---
      if (this.resCi < 2.2) {
        this.ciStatus = 'Laag (Low Flow)';
        this.ciKleur = 'danger';
      } else if (this.resCi > 4.5) {
        this.ciStatus = 'Hyperdynamisch';
        this.ciKleur = 'warning';
      } else {
        this.ciStatus = 'Normaal';
        this.ciKleur = 'success';
      }
    }

    this.toonResultaten = true;
  }

  reset() {
    this.map = null;
    this.cvp = null;
    this.co = null;

    this.resSvr = null;
    this.resCi = null;
    this.resSvri = null;
    this.toonResultaten = false;
  }
}
