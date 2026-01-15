import { Component, inject } from '@angular/core';
import { PatientService } from '../services/patient';

import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonGrid, IonRow, IonCol, IonInput, IonButton, IonNote, IonButtons, IonMenuButton
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-nierfunctie',
  templateUrl: './nierfunctie.page.html',
  styleUrls: ['./nierfunctie.page.scss'],
  standalone: true,
  imports: [FormsModule, IonContent, IonHeader, IonToolbar, IonTitle, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonGrid, IonRow, IonCol, IonInput, IonButton, IonNote, IonButtons, IonMenuButton]
})
export class NierfunctiePage {
  public patient = inject(PatientService);
  // Inputs
  creatinine: number | null = null; // µmol/L
  // age is stored on the shared patient: patient.current.leeftijd
  female: boolean = false;

  // Result
  egfr: number | null = null; // legacy; computed getter used for live updates

  // Live computed eGFR so page updates when shared patient age/sex change
  get computedEgfr(): number | null {
    const age = this.patient.current?.leeftijd ?? null;
    if (this.creatinine == null || age == null || this.creatinine <= 0 || age <= 0) return null;
    const creatMgDl = this.creatinine / 88.4;
    const isFemale = (this.patient.current?.geslacht || 'M') === 'V';
    const result = 186 * Math.pow(creatMgDl, -1.154) * Math.pow(age, -0.203) * (isFemale ? 0.742 : 1);
    return Math.round(result);
  }

  // Calculate approximate eGFR using MDRD-like formula (demo purposes only)
  calculateEGFR() {
    const age = this.patient.current?.leeftijd ?? null;
    if (this.creatinine == null || age == null || this.creatinine <= 0 || age <= 0) {
      this.egfr = null;
      return;
    }

    const creatMgDl = this.creatinine / 88.4; // µmol/L -> mg/dL
    const result = 186 * Math.pow(creatMgDl, -1.154) * Math.pow(age, -0.203) * (this.female ? 0.742 : 1);
    this.egfr = Math.round(result);
  }

  reset() {
    // Only clear local inputs — do NOT clear shared patient age
    this.creatinine = null;
    this.female = false;
    this.egfr = null;
  }
}
