import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonGrid, IonRow, IonCol, IonInput, IonButton,
  IonLabel,
  IonSelect, IonSelectOption, IonCardSubtitle, IonButtons } from '@ionic/angular/standalone';

import { PatientService } from '../services/patient';
import { CalculatorService } from '../services/calculator';
@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
  standalone: true,
  imports: [IonButtons, IonCardSubtitle,
    CommonModule, FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonGrid, IonRow, IonCol, IonInput, IonButton,
    IonLabel,
    IonSelect, IonSelectOption
  ]
})
export class Tab5Page {

  // Inputs voor Noradrenaline
  // Gewicht halen we uit PatientService, maar mag overschreven worden indien nodig?
  // Nee, laten we consistent de patient data gebruiken.

  dosis: number | null = null;          // mcg/kg/min
  concentratieMg: number = 5;           // mg (in 50ml)
  volume: number = 50;                  // ml spuit

  // Resultaat
  resStand: number | null = null;       // ml/uur

  constructor(
    public patient: PatientService,
    private calc: CalculatorService
  ) {}

  bereken() {
    const gewicht = this.patient.current.gewicht;

    if (this.dosis && gewicht && this.concentratieMg) {

      // Stap 1: Reken concentratie om naar mcg/ml
      // (mg * 1000) / ml = mcg/ml
      const mcgTotaal = this.concentratieMg * 1000;
      const concMcgMl = mcgTotaal / this.volume;

      // Stap 2: Reken pompstand uit via calculator service
      this.resStand = this.calc.calcPumpFlow(this.dosis, gewicht, concMcgMl);
    }
  }

  reset() {
    this.dosis = null;
    this.resStand = null;
    // Concentratie laten we staan, dat is handig
  }
}
