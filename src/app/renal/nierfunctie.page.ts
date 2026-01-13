import { Component, inject } from '@angular/core';
import { PatientService } from '../services/patient';
import { CommonModule } from '@angular/common';
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
  imports: [CommonModule, FormsModule, IonContent, IonHeader, IonToolbar, IonTitle, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonGrid, IonRow, IonCol, IonInput, IonButton, IonNote, IonButtons, IonMenuButton]
})
export class NierfunctiePage {
  public patient = inject(PatientService);
  // Inputs
  creatinine: number | null = null; // µmol/L
  age: number | null = null;
  female: boolean = false;

  // Result
  egfr: number | null = null;

  // Calculate approximate eGFR using MDRD-like formula (demo purposes only)
  calculateEGFR() {
    if (this.creatinine == null || this.age == null || this.creatinine <= 0 || this.age <= 0) {
      this.egfr = null;
      return;
    }

    const creatMgDl = this.creatinine / 88.4; // µmol/L -> mg/dL
    const result = 186 * Math.pow(creatMgDl, -1.154) * Math.pow(this.age, -0.203) * (this.female ? 0.742 : 1);
    this.egfr = Math.round(result);
  }

  reset() {
    this.creatinine = this.age = null;
    this.female = false;
    this.egfr = null;
  }
}
