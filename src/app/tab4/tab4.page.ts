import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, // <--- BELANGRIJK: Deze toegevoegd!
  IonList, IonItem, IonInput, IonLabel, IonNote, IonGrid, IonRow, IonCol,
  IonButton, IonButtons, IonIcon, IonToggle,
  ModalController
} from '@ionic/angular/standalone';

import { PatientService } from '../services/patient';
import { InfoModalComponent } from '../info-modal.component';

import { addIcons } from 'ionicons';
import { chevronForwardOutline, pulseOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent, // <--- EN HIER OOK
    IonList, IonItem, IonInput, IonLabel,  IonGrid, IonRow, IonCol,
    IonButton, IonButtons, IonToggle, IonIcon
  ]
})
export class Tab4Page {

  // Inputs: PiCCO Waarden
  public ci: number | null = null;
  public gedi: number | null = null;
  public elwi: number | null = null;
  public map: number | null = null;

  // Inputs: Huidige Therapie
  public hasVaso: boolean = false;
  public hasIno: boolean = false;

  // Resultaten
  public diagnose: string = '';
  public advies: string = '';
  public elwiWarning: string = '';
  public resultColor: string = 'medium';

  constructor(
    public patient: PatientService,
    private modalCtrl: ModalController
  ) {
    addIcons({ chevronForwardOutline, pulseOutline });
  }

// --- De Info Popup Functie ---
  async toonInfo() {
    const htmlContent = `
      <h3>PiCCO Interpretatie</h3>
      <p>Beslisboom op basis van Flow, Vulling en Longwater.</p>

      <h3>1. Cardiac Index (CI)</h3>
      <p>De 'motor' van het systeem (Pompfunctie).</p>
      <ul>
        <li><strong>Hoog:</strong> > 5.0 L/min/m² (Hyperdynamisch). Vaak sepsis/koorts.</li>
        <li><strong>Normaal:</strong> 3.0 - 5.0 L/min/m²</li>
        <li><strong>Kritisch:</strong> < 2.5 (Shock)</li>
      </ul>

      <div style="text-align: center; margin: 15px 0;">
         <img src="assets/starling.png" style="display: block"; width: 100%; max-width: 350px; border-radius: 8px; border: 1px solid #444;">
         <div style="font-size: 0.8em; color: #888;">Frank-Starling: Relatie Vulling & Output</div>
      </div>

      <h3>2. GEDI (Vulling)</h3>
      <p>Global End-Diastolic Volume Index. Geeft aan of het hart 'vol' of 'leeg' is (Preload).</p>
      <ul>
         <li><strong>Normaal:</strong> 640 - 800 ml/m²</li>
         <li><strong>Laag:</strong> Hypovolemie (Vullen)</li>
         <li><strong>Hoog:</strong> Overvulling of dilatatie</li>
      </ul>

      <h3>3. ELWI (Longwater)</h3>
      <p>Extravascular Lung Water Index. Is er longoedeem?</p>
      <ul>
         <li><strong>Veilig:</strong> < 10 ml/kg</li>
         <li><strong>Gevaar:</strong> > 10 (Pas op met vullen!)</li>
      </ul>

      <h3>Logica in deze app:</h3>
      <ul>
        <li><strong>Hypovolemie:</strong> Laag CI + Laag GEDI</li>
        <li><strong>Cardiaal Falen:</strong> Laag CI + Hoog GEDI</li>
        <li><strong>Vasoplegie:</strong> Normaal CI + Lage Bloeddruk</li>
      </ul>
    `;

    const modal = await this.modalCtrl.create({
      component: InfoModalComponent,
      componentProps: { title: 'PiCCO Info', content: htmlContent }
    });
    await modal.present();
  }

  // --- Jouw Analyse Functie ---
  public analyseer() {
    if (!this.ci || !this.gedi || !this.map) return;

    // 1. Check Longwater (Veiligheid)
    if (this.elwi && this.elwi > 10) {
      this.elwiWarning = '⚠️ Let op: Hoog ELWI (>10). Wees voorzichtig met vullen!';
    } else {
      this.elwiWarning = '';
    }

    // SCENARIO A: Laag Flow (CI < 2.5) -> Pomp of Vulling probleem
    if (this.ci < 2.5) {
      if (this.gedi < 640) {
        this.diagnose = 'Hypovolemie';
        this.resultColor = 'warning'; // Geel
        this.advies = (this.elwi && this.elwi > 10)
          ? 'Conflict: Patiënt is leeg maar longen zijn nat. Voorzichtig vullen!'
          : 'Volume toediening (Vullen).';
      } else {
        this.diagnose = 'Cardiaal Falen';
        this.resultColor = 'danger'; // Rood
        this.advies = this.hasIno
          ? 'Inotropie onvoldoende? Overweeg ophogen/switch.'
          : 'Start Inotropie (Dobutamine/Milrinone).';
      }
    }

    // SCENARIO B: Normaal of Hoog Flow (CI >= 2.5)
    else {
      // Check: Is het Hyperdynamisch?
      const isHyper = this.ci > 5.0; // Grenswaarde voor hyperdynamisch

      if (this.map < 65) {
        // Lage bloeddruk ondanks goede flow = Vasoplegie
        this.diagnose = isHyper ? 'Vasoplegie (Hyperdynamisch)' : 'Vasoplegie';
        this.resultColor = 'secondary'; // Blauw

        this.advies = this.hasVaso
          ? 'Vasoplegie houdt aan. Ophogen Noradrenaline of start Vasopressine?'
          : 'Start Vasopressie (Noradrenaline).';
      } else {
        // Goede bloeddruk + Goede flow
        if (isHyper) {
           // Wel stabiel qua druk, maar hart gaat te keer
           this.diagnose = 'Hyperdynamisch (Stabiel)';
           this.resultColor = 'warning'; // Oranje waarschuwing
           this.advies = 'Hoge Cardiac Output. Oorzaak? Pijn, onrust, koorts of beginnende sepsis?';
        } else {
           // Saai is goed
           this.diagnose = 'Hemodynamisch Stabiel';
           this.resultColor = 'success'; // Groen
           this.advies = 'Continueer beleid. Probeer medicatie af te bouwen.';
        }
      }
    }
  }

  public reset() {
    this.ci = null; this.gedi = null; this.elwi = null; this.map = null;
    this.hasVaso = false; this.hasIno = false;
    this.diagnose = ''; this.advies = ''; this.elwiWarning = '';
  }
}
