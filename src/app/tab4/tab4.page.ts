import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonList, IonItem, IonInput, IonLabel, IonNote, IonGrid, IonRow, IonCol,
  IonButton, IonButtons, IonIcon, IonToggle
} from '@ionic/angular/standalone';

import { PatientService } from '../services/patient';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonList, IonItem, IonInput, IonLabel,  IonGrid, IonRow, IonCol,
    IonButton, IonButtons, IonToggle
  ]
})
export class Tab4Page {

  // Inputs: PiCCO Waarden
  public ci: number | null = null;    // Cardiac Index (N: 3.0-5.0, Target > 2.5)
  public gedi: number | null = null;  // Preload (N: 640-800)
  public elwi: number | null = null;  // Lung Water (N: < 10)
  public map: number | null = null;   // Mean Arterial Pressure (Target > 65)

  // Inputs: Huidige Therapie (Context!)
  public hasVaso: boolean = false;    // Loopt er Noradrenaline?
  public hasIno: boolean = false;     // Loopt er Dobuta/Milrinone?

  // Resultaten
  public diagnose: string = '';
  public advies: string = '';
  public elwiWarning: string = '';
  public resultColor: string = 'medium';

  constructor(public patient: PatientService) {}

  public analyseer() {
    if (!this.ci || !this.gedi || !this.map) return;

    // 1. Check Longwater (Veiligheidsgrens)
    if (this.elwi && this.elwi > 10) {
      this.elwiWarning = '⚠️ Let op: Hoog ELWI (>10). Wees voorzichtig met vullen!';
    } else {
      this.elwiWarning = '';
    }

    // 2. De Beslisboom
    // SCENARIO A: Laag Flow (CI < 2.5)
    if (this.ci < 2.5) {
      if (this.gedi < 640) {
        // Laag CI + Laag GEDI = Hypovolemie (Te leeg)
        this.diagnose = 'Hypovolemie';
        this.resultColor = 'warning'; // Geel: Vullen

        if (this.elwi && this.elwi > 10) {
           this.advies = 'Conflict: Patiënt is leeg, maar longen zijn nat. Overweeg vullen met uiterste voorzichtigheid of start inotropie.';
        } else {
           this.advies = 'Volume toediening (Vullen).';
        }

      } else {
        // Laag CI + Normaal/Hoog GEDI = Cardiaal Falen (Pompfunctie)
        this.diagnose = 'Cardiaal Falen';
        this.resultColor = 'danger'; // Rood: Pomp

        if (this.hasIno) {
          this.advies = 'Huidige inotropie lijkt onvoldoende. Overweeg ophogen of switch van middel. Check Afterload.';
        } else {
          this.advies = 'Start Inotropie (bijv. Dobutamine, Milrinone).';
        }
      }
    }

    // SCENARIO B: Normaal/Hoog Flow (CI >= 2.5)
    else {
      if (this.map < 65) {
        // Goede Flow + Lage Druk = Vasoplegie (Open vaten)
        this.diagnose = 'Vasoplegie';
        this.resultColor = 'secondary'; // Blauw: Vaten

        if (this.hasVaso) {
          this.advies = 'Vasoplegie houdt aan ondanks pomp. Overweeg ophogen Noradrenaline, toevoegen Vasopressine of Hydrocortison?';
        } else {
          this.advies = 'Start Vasopressie (Noradrenaline).';
        }

      } else {
        // Goede Flow + Goede Druk = Stabiel
        this.diagnose = 'Hemodynamisch Stabiel';
        this.resultColor = 'success';
        this.advies = 'Huidige support continueren en monitoren.';

        // Nuance: Als stabiel is, maar wel met veel medicatie?
        if (this.hasVaso || this.hasIno) {
           this.advies += ' Probeer medicatie af te bouwen indien mogelijk.';
        }
      }
    }
  }

  public reset() {
    this.ci = null;
    this.gedi = null;
    this.elwi = null;
    this.map = null;
    this.hasVaso = false;
    this.hasIno = false;
    this.diagnose = '';
    this.advies = '';
    this.elwiWarning = '';
  }
}
