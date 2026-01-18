import { Component, inject } from '@angular/core';
import { PatientService } from '@core/services/patient';

import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonGrid, IonRow, IonCol, IonInput, IonButton, IonItem, IonLabel, IonButtons, IonMenuButton
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-cvvhd',
  templateUrl: 'cvvhd.page.html',
  styleUrls: ['cvvhd.page.scss'],
  standalone: true,
  imports: [FormsModule, IonContent, IonHeader, IonToolbar, IonTitle, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonGrid, IonRow, IonCol, IonInput, IonButton, IonItem, IonLabel, IonButtons, IonMenuButton]
})
export class CVVHDPage {
  public patient = inject(PatientService);
  // Inputs
  target24h: number | null = null; // mL desired removal per 24h
  currentUFR: number | null = null; // mL per hour

  // Results
  current24h: number | null = null;
  requiredUFR: number | null = null; // mL/h

  calculate() {
    if (this.currentUFR != null) {
      this.current24h = Math.round(this.currentUFR * 24);
    } else {
      this.current24h = null;
    }

    if (this.target24h != null) {
      this.requiredUFR = Math.round(this.target24h / 24);
    } else {
      this.requiredUFR = null;
    }
  }

  reset() {
    this.target24h = this.currentUFR = this.current24h = this.requiredUFR = null;
  }
}
