import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Alle Ionic componenten die we in de HTML gebruiken
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonList, IonItem, IonInput, IonButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonLabel, IonNote, IonGrid, IonRow, IonCol, IonButtons } from '@ionic/angular/standalone';

// Onze eigen services
import { CalculatorService } from '../services/calculator';
import { PatientService } from '../services/patient';

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
    IonLabel, IonNote, IonGrid, IonRow, IonCol
  ]
})
export class Tab2Page {

  // --- INPUTS ---
  // We gebruiken korte namen die matchen met de HTML uit de vorige stap
  fio2: number | null = null;    // %
  pao2: number | null = null;    // kPa
  paco2: number | null = null;   // kPa

  // Nieuwe inputs voor uitgebreide berekening
  hb: number | null = null;      // Hb
  sao2: number | null = null;    // Saturatie arterieel
  svo2: number | null = null;    // Saturatie veneus (optioneel)

  // --- RESULTATEN ---
  resPAO2: number | null = null;
  resAaGrad: number | null = null;
  resAaRatio: number | null = null;
  resPFRatio: number | null = null;
  resCaO2: number | null = null;

  // --- STATUS TEKSTEN & KLEUREN (Jouw logica) ---
  aaStatusTekst = '';
  aaStatusKleur = 'medium';
  aaVerwacht: number | null = null;

  pfStatusTekst = '';
  pfStatusKleur = 'medium';

  // Helper om te zien of we resultaten moeten tonen
  toonResultaten = false;

  constructor(
    public patient: PatientService, // Voor de leeftijd (patient.current.leeftijd)
    private calc: CalculatorService // Voor de formules
  ) {}

  bereken() {
    // Minimale vereisten: FiO2 en PaCO2
    if (this.fio2 == null || this.paco2 == null) {
      return;
    }

    // 1. Bereken PAO2 (Alveolair) via de Service
    this.resPAO2 = this.calc.calcPAO2(this.fio2, this.paco2);

    // 2. Als PaO2 ook is ingevuld, kunnen we de gradiënt doen
    if (this.pao2 != null) {
      this.resAaGrad = this.calc.calcAaGradient(this.resPAO2, this.pao2);
      this.resAaRatio = this.calc.calcAaRatio(this.pao2, this.resPAO2);

      // --- JOUW LOGICA: Verwachte Gradiënt op basis van leeftijd ---
      // We pakken de leeftijd nu uit de PatientService
      const leeftijd = this.patient.current.leeftijd || 20; // Default 20 als niet ingevuld
      this.aaVerwacht = 2.0 + (leeftijd * 0.03);

      if (this.resAaGrad > this.aaVerwacht) {
        this.aaStatusTekst = 'Verhoogd';
        this.aaStatusKleur = 'danger';
      } else {
        this.aaStatusTekst = 'Normaal';
        this.aaStatusKleur = 'success';
      }

      // --- JOUW LOGICA: P/F Ratio (Horowitz) ---
      // FiO2 moet als fractie (0.5) voor deze som, input is % (50)
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
        this.pfStatusKleur = 'warning'; // Of orange als je die class hebt
      } else {
        this.pfStatusTekst = 'Ernstige ARDS';
        this.pfStatusKleur = 'danger';
      }
    }

    // 3. Oxygen Content (CaO2) - Alleen als Hb en SaO2 er zijn
    if (this.hb != null && this.sao2 != null && this.pao2 != null) {
      this.resCaO2 = this.calc.calcCaO2(this.hb, this.sao2, this.pao2);
    }

    this.toonResultaten = true;
  }

  reset() {
    this.fio2 = null;
    this.pao2 = null;
    this.paco2 = null;
    this.hb = null;
    this.sao2 = null;
    this.svo2 = null;

    this.resPAO2 = null;
    this.resAaGrad = null;
    this.resPFRatio = null;
    this.resCaO2 = null;

    this.toonResultaten = false;
  }
}
