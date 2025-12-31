import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonButton, IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader, IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInput,
  IonRow,
  IonTitle,
  IonToolbar,
  ModalController
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { alertCircleOutline, chevronForwardOutline, pulseOutline } from 'ionicons/icons';
import { InfoModalComponent } from '../info-modal.component';
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
     IonInput, IonGrid, IonRow, IonCol,
    IonButton, IonButtons, IonIcon
  ]
})
export class Tab4Page {

  public diagnose: string = '';
  public advies: string = '';
  public elwiWarning: string = '';
  public resultColor: string = 'medium';

  constructor(
    public patient: PatientService,
    private modalCtrl: ModalController
  ) {
    addIcons({ chevronForwardOutline, pulseOutline, alertCircleOutline });

    if (!this.patient.current.picco) {
      this.patient.current.picco = { ci: null, svr: null, gedi: null, elwi: null, map: null };
    }
  }

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

  // --- HIER ZIT DE UPDATE ---
 public analyseer() {
    const p = this.patient.current.picco;

    // Check of minimale data er is
    if (!p || !p.ci || !p.svr) {
      this.diagnose = 'Vul in ieder geval CI en SVR in.';
      this.resultColor = 'medium';
      this.advies = '';
      return;
    }

    // Veiligheid: Zeker weten dat we met getallen rekenen (voorkomt string fouten)
    const ci = Number(p.ci);
    const svr = Number(p.svr);
    const gedi = p.gedi ? Number(p.gedi) : null;
    const elwi = p.elwi ? Number(p.elwi) : null;

    // 1. Veiligheidscheck Longwater
    if (elwi && elwi > 10) {
      this.elwiWarning = '⚠️ Let op: Hoog ELWI (>10). Wees voorzichtig met vullen!';
    } else {
      this.elwiWarning = '';
    }

    // --- DE LOGICA ---

    // SCENARIO A: Laag Flow (CI < 3.0) -> Contractiliteit of Vulling probleem
    if (ci < 3.0) {
      if (gedi && gedi < 640) {
         this.diagnose = 'Hypovolemie (Te leeg)';
         this.resultColor = 'warning'; // Geel
         this.advies = (elwi && elwi > 10)
           ? 'Let op: Patiënt is leeg maar natte longen. Voorzichtig vullen!'
           : 'Volume toediening (Vullen).';
      } else {
         this.diagnose = 'Cardiaal Falen (Pompfunctie)';
         this.resultColor = 'danger'; // Rood
         this.advies = 'Start Milrinon (1e keus) of Dobutamine.';
      }
    }

    // SCENARIO B: Hoog Flow (CI > 5.0) -> HYPERDYNAMISCH
    else if (ci > 5.0) {
        // Is de weerstand ook laag? Dan is het klassieke septische shock (Vasoplegie)
        if (svr < 1700) {
            this.diagnose = 'Vasoplegie (Hyperdynamisch)';
            this.resultColor = 'secondary'; // Blauw
            this.advies = 'Hoge output + Lage weerstand (Sepsis?). Start/Ophogen Noradrenaline.';
        } else {
            // Wel hoge output, maar weerstand is normaal.
            this.diagnose = 'Hyperdynamisch (Hoge Output)';
            this.resultColor = 'warning'; // Oranje
            this.advies = 'Het hart werkt hard. Oorzaak? Pijn, onrust, koorts of anemie?';
        }
    }

    // SCENARIO C: Normaal Flow (3.0 - 5.0), maar wel lage weerstand
    else if (svr < 1700) {
       this.diagnose = 'Vasoplegie (Vaten staan open)';
       this.resultColor = 'secondary'; // Blauw
       this.advies = 'Start/Ophogen Noradrenaline. Bij refractair: Argipressine (zie Tab 5).';
    }

    // SCENARIO D: Normaal Flow, maar HOGE weerstand (NIEUW TOEGEVOEGD)
    else if (svr > 2400) {
      this.diagnose = 'Vasoconstrictie (Hoge weerstand)';
      this.resultColor = 'warning'; // Oranje
      this.advies = 'Patiënt is "afgeknepen". Oorzaak? Pijn, kou, stress? Overweeg afbouw Nora.';
    }

    // SCENARIO E: Alles ok
    else {
       this.diagnose = 'Hemodynamisch Stabiel';
       this.resultColor = 'success'; // Groen
       this.advies = 'Continueer beleid. Probeer medicatie af te bouwen.';
    }
  }

  public reset() {
    if (this.patient.current.picco) {
       this.patient.current.picco = { ci: null, svr: null, gedi: null, elwi: null, map: null };
    }
    this.diagnose = ''; this.advies = ''; this.elwiWarning = '';
  }
}
