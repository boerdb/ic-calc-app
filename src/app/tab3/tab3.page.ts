import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonBadge, IonButton, IonCard,
  IonCardContent, IonCardHeader, IonCardTitle,
  IonCol, IonContent, IonGrid, IonHeader,
  IonInput, IonItem, IonLabel, IonRow,
  IonSegment, IonSegmentButton, IonText,
  IonTitle, IonToolbar, IonList, IonNote, IonButtons,
  IonIcon, ModalController,IonMenuButton,IonMenuToggle
  // <--- HIER: ModalController ipv AlertController
} from '@ionic/angular/standalone';

import { PatientService } from '../services/patient';
import { CalculatorService } from '../services/calculator';
// Importeer je nieuwe Info Component
import { InfoModalComponent } from '../info-modal.component';

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
    IonIcon, IonMenuButton
  ]
})
export class Tab3Page {
  // Modern inject() function instead of constructor injection
  public patient = inject(PatientService);
  private calc = inject(CalculatorService);
  private modalCtrl = inject(ModalController);

  public mode: string = 'controlled';

  // Kleuren
  public dpKleur: string = 'medium';
  public mpKleur: string = 'medium';
  public pmusKleur: string = 'medium';
  public ptpKleur: string = 'medium';

  public segmentChanged(ev: any) {
    this.mode = ev.detail.value;
  }

  // --- NIEUW: De functie die de mooie HTML pagina opent ---
 async toonInfo() {
    let titel = '';
    let htmlContent = '';

    if (this.mode === 'controlled') {
      titel = 'Controlled Parameters';
      htmlContent = `
        <h3>Driving Pressure</h3>
        <p>Het verschil tussen P-Plat en PEEP. Dit is de 'drive' die de longblaasjes belast.</p>

        <div style="text-align: center; margin: 10px 0;">
           <img src="assets/driving.png" style= "display: block; "width: 100%; max-width: 350px; border-radius: 8px; border: 1px solid #444;">
           <div style="font-size: 0.8em; color: #888;">ΔP = Pplat - PEEP</div>
        </div>

        <ul>
          <li><strong>Formule:</strong> Pplat - PEEP</li>
          <li><strong>Doel:</strong> &lt; 15 cmH₂O (Amato et al, 2015)</li>
          <li><em>Risico:</em> > 15 geeft verhoogde kans op longschade (VILI).</li>
        </ul>

        <h3>Tijdconstante (RC)</h3>
        <p>De snelheid waarmee de long zich vult of leegt.</p>

        <div style="text-align: center; margin: 10px 0;">
           <img src="assets/rc.png" style= "display: block; "width: 100%; max-width: 350px; border-radius: 8px; border: 1px solid #444;">
           <div style="font-size: 0.8em; color: #888;">1x RC = 63% uitgeademd</div>
        </div>

        <p>Voor een volledige uitademing (zonder auto-PEEP) is minimaal <strong>3x tot 4x RC</strong> aan tijd nodig.</p>

        <h3>Dode Ruimte (Vd/Vt)</h3>
        <p>Het deel van de ademteug dat niet deelneemt aan gaswisseling (trachea + slangen).</p>

        <div style="text-align: center; margin: 10px 0;">
           <img src="assets/vdvt.jpg" style="display: block; "width: 100%; max-width: 350px; border-radius: 8px; border: 1px solid #444;">
        </div>

        <p>Streefwaarde bij ARDS vaak < 40-50%. Hoge Vd/Vt wijst op slechte doorbloeding (dode ruimte ventilatie).</p>
      `;
    } else {
      titel = 'Spontaneous / Weaning';
      htmlContent = `
        <h3>P-Nadir</h3>
        <p>De diepste negatieve druk tijdens een occlusie-manoeuvre (inspiratoire hold).</p>

        <div style="text-align: center; margin: 10px 0;">
           <img src="assets/pnadir.png" style="display: block; "width: 100%; max-width: 350px; border-radius: 8px; border: 1px solid #444;">
        </div>

        <h3>Pmus (Spierkracht)</h3>
        <p>Geschatte druk die het diafragma genereert (Pmus = Pnadir - 0.75).</p>

        <div style="text-align: center; margin: 10px 0;">
           <img src="assets/pmus.png" style="display: block; "width: 100%; max-width: 350px; border-radius: 8px; border: 1px solid #444;">
        </div>

        <ul>
          <li><strong>Target:</strong> Tussen 5 en 10-15 cmH₂O.</li>
          <li><strong>Te hoog:</strong> Risico op lung injury (SI-PILI).</li>
          <li><strong>Te laag:</strong> Risico op diafragma-atrofie.</li>
        </ul>

        <h3>Transpulmonale Druk (Ptp)</h3>
        <p>De daadwerkelijke stress op de alveoli (Ptp = Pplat - Pes). Doel < 25 cmH₂O.</p>

        <div style="text-align: center; margin: 10px 0;">
           <img src="assets/ptp.png" style="display: block; "width: 100%; max-width: 350px; border-radius: 8px; border: 1px solid #444;">
        </div>
      `;
    }

    // Maak de modal aan met jouw component
    const modal = await this.modalCtrl.create({
      component: InfoModalComponent,
      componentProps: {
        title: titel,
        content: htmlContent
      }
    });

    await modal.present();
  }

  public berekenControlled(): void {
    if (!this.patient.current.ventilation) return;
    const v = this.patient.current.ventilation;
    
    if (!v.controlled.vt || !v.controlled.peep) return;

    if (this.patient.current.ibw) {
      v.calculated.vtPerKg = v.controlled.vt / this.patient.current.ibw;
    }

    if (v.controlled.pplat) {
      v.calculated.drivingPressure = v.controlled.pplat - v.controlled.peep;
      this.dpKleur = v.calculated.drivingPressure > 15 ? 'danger' : 'success';
      if (v.calculated.drivingPressure > 0) {
        v.calculated.cstat = this.calc.calcStaticCompliance(v.controlled.vt, v.controlled.pplat, v.controlled.peep);
      }
    }

    if (v.controlled.ppiek) {
      v.calculated.cdyn = this.calc.calcDynamicCompliance(v.controlled.vt, v.controlled.ppiek, v.controlled.peep);
    }

    if (v.controlled.rr && v.controlled.ppiek && v.controlled.pplat) {
      v.calculated.mechPower = this.calc.calcMechanicalPower(v.controlled.vt, v.controlled.rr, v.controlled.ppiek, v.controlled.pplat, v.controlled.peep);
      this.mpKleur = v.calculated.mechPower > 17 ? 'warning' : 'success';
    }

    const compliance = v.calculated.cstat || v.calculated.cdyn;
    if (compliance && v.controlled.resistance) {
      v.calculated.timeConstant = this.calc.calcTimeConstant(compliance, v.controlled.resistance);
      // Check eerst of het mapje bestaat (voor de zekerheid), en sla het dan op
      if (this.patient.current.ademhaling) {
        this.patient.current.ademhaling.rcExp = v.calculated.timeConstant;
      }
    }

    if (v.controlled.paco2 && v.controlled.peco2) {
      v.calculated.vdVt = this.calc.calcVdVt(v.controlled.paco2, v.controlled.peco2);
    }

    this.patient.opslaan();
  }

  public berekenSpontaneous(): void {
    if (!this.patient.current.ventilation) return;
    const v = this.patient.current.ventilation;
    
    if (v.spontaneous.sponPpeak !== null && v.spontaneous.sponPeepTot !== null && v.spontaneous.sponPnadir !== null) {
      v.spontaneous.pocc = v.spontaneous.sponPnadir - v.spontaneous.sponPeepTot;
      v.spontaneous.pmus = this.calc.calcPmus(v.spontaneous.sponPnadir, v.spontaneous.sponPeepTot);
      v.spontaneous.ptp = this.calc.calcPtp(v.spontaneous.sponPpeak, v.spontaneous.sponPeepTot, v.spontaneous.sponPnadir);
      this.pmusKleur = (v.spontaneous.pmus > 15) ? 'danger' : (v.spontaneous.pmus > 10) ? 'warning' : 'success';
      this.ptpKleur = (v.spontaneous.ptp > 25) ? 'danger' : 'success';
    }
    if (v.controlled.paco2 && v.controlled.peco2) {
      v.calculated.vdVt = this.calc.calcVdVt(v.controlled.paco2, v.controlled.peco2);
    }

    this.patient.opslaan();
  }

  public resetVelden(): void {
    if (!this.patient.current.ventilation) return;
    const v = this.patient.current.ventilation;
    
    // Reset controlled
    v.controlled.vt = null; v.controlled.rr = null; v.controlled.peep = null;
    v.controlled.pplat = null; v.controlled.ppiek = null;
    v.controlled.resistance = null; v.controlled.paco2 = null; v.controlled.peco2 = null;
    
    // Reset spontaneous
    v.spontaneous.sponPpeak = null; v.spontaneous.sponPeepTot = null; v.spontaneous.sponPnadir = null;
    v.spontaneous.pocc = null; v.spontaneous.pmus = null; v.spontaneous.ptp = null;
    
    // Reset calculated
    v.calculated.drivingPressure = null; v.calculated.cstat = null; v.calculated.cdyn = null;
    v.calculated.vtPerKg = null; v.calculated.mechPower = null; v.calculated.timeConstant = null;
    v.calculated.vdVt = null;
    
    this.dpKleur = 'medium'; this.mpKleur = 'medium'; this.pmusKleur = 'medium'; this.ptpKleur = 'medium';
    
    this.patient.opslaan();
  }
}
