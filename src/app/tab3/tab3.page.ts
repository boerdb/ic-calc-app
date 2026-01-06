import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonBadge, IonButton, IonCard,
  IonCardContent, IonCardHeader, IonCardTitle,
  IonCol, IonContent, IonGrid, IonHeader,
  IonInput, IonItem, IonLabel, IonRow,
  IonSegment, IonSegmentButton, IonText,
  IonTitle, IonToolbar, IonList, IonNote, IonButtons,
  IonIcon, ModalController // <--- HIER: ModalController ipv AlertController
} from '@ionic/angular/standalone';

import { PatientService } from '../services/patient';
import { CalculatorService } from '../services/calculator';
import { ClinicalDataService } from '../services/clinical-data.service';
// Importeer je nieuwe Info Component
import { InfoModalComponent } from '../info-modal.component';

// Icoon registreren
import { addIcons } from 'ionicons';
import { informationCircleOutline, chevronForwardOutline } from 'ionicons/icons';
import { Subscription } from 'rxjs';

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
    IonIcon
  ]
})
export class Tab3Page implements OnInit, OnDestroy {
  public mode: string = 'controlled';

  private subscriptions: Subscription[] = [];

  // --- CONTROLLED INPUTS ---
  public inputVt: number | null = null;
  public inputRR: number | null = null;
  public inputPeep: number | null = null;
  public inputPplat: number | null = null;
  public inputPpiek: number | null = null;
  public inputResistance: number | null = null;
  public inputPaCO2: number | null = null;
  public inputPeCO2: number | null = null;

  // --- RESULTATEN ---
  public resDrivingPressure: number | null = null;
  public resCstat: number | null = null;
  public resCdyn: number | null = null;
  public resMechPower: number | null = null;
  public resVtPerKg: number | null = null;
  public resTimeConstant: number | null = null;
  public resVdVt: number | null = null;

  // --- SPONTANEOUS INPUTS ---
  public inputSponPpeak: number | null = null;
  public inputSponPeepTot: number | null = null;
  public inputSponPnadir: number | null = null;
  public resPocc: number | null = null;
  public resPmus: number | null = null;
  public resPtp: number | null = null;

  // Kleuren
  public dpKleur: string = 'medium';
  public mpKleur: string = 'medium';
  public pmusKleur: string = 'medium';
  public ptpKleur: string = 'medium';

  constructor(
    public patient: PatientService,
    private calc: CalculatorService,
    private modalCtrl: ModalController, // <--- Injecteer de ModalController
    private clinicalData: ClinicalDataService
  ) {
    // Iconen registreren (ook de chevron voor de knop)
    addIcons({ informationCircleOutline, chevronForwardOutline });
  }

  ngOnInit() {
    // Initialize with current values from the shared service
    this.inputPaCO2 = this.clinicalData.getPaCO2();
    this.inputPeCO2 = this.clinicalData.getEtCO2();
    
    // Subscribe to shared PaCO2 and EtCO2 values
    // Update local values when they change in other components
    const paco2Sub = this.clinicalData.paCO2$.subscribe(value => {
      if (this.inputPaCO2 !== value) {
        this.inputPaCO2 = value;
        // Recalculate Vd/Vt if we have both values
        if (this.inputPaCO2 && this.inputPeCO2) {
          this.resVdVt = this.calc.calcVdVt(this.inputPaCO2, this.inputPeCO2);
        }
      }
    });
    
    const etco2Sub = this.clinicalData.etCO2$.subscribe(value => {
      if (this.inputPeCO2 !== value) {
        this.inputPeCO2 = value;
        // Recalculate Vd/Vt if we have both values
        if (this.inputPaCO2 && this.inputPeCO2) {
          this.resVdVt = this.calc.calcVdVt(this.inputPaCO2, this.inputPeCO2);
        }
      }
    });

    this.subscriptions.push(paco2Sub, etco2Sub);
  }

  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

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
    // Update shared service with PaCO2 and EtCO2 values
    this.clinicalData.setPaCO2(this.inputPaCO2);
    this.clinicalData.setEtCO2(this.inputPeCO2);
    
    if (!this.inputVt || !this.inputPeep) return;

    if (this.patient.current.ibw) {
      this.resVtPerKg = this.inputVt / this.patient.current.ibw;
    }

    if (this.inputPplat) {
      this.resDrivingPressure = this.inputPplat - this.inputPeep;
      this.dpKleur = this.resDrivingPressure > 15 ? 'danger' : 'success';
      if (this.resDrivingPressure > 0) {
        this.resCstat = this.calc.calcStaticCompliance(this.inputVt, this.inputPplat, this.inputPeep);
      }
    }

    if (this.inputPpiek) {
      this.resCdyn = this.calc.calcDynamicCompliance(this.inputVt, this.inputPpiek, this.inputPeep);
    }

    if (this.inputRR && this.inputPpiek && this.inputPplat) {
      this.resMechPower = this.calc.calcMechanicalPower(this.inputVt, this.inputRR, this.inputPpiek, this.inputPplat, this.inputPeep);
      this.mpKleur = this.resMechPower > 17 ? 'warning' : 'success';
    }

    const compliance = this.resCstat || this.resCdyn;
    if (compliance && this.inputResistance) {
      this.resTimeConstant = this.calc.calcTimeConstant(compliance, this.inputResistance);
    this.patient.current.rcExp = this.resTimeConstant;
      this.patient.opslaan();

    }

    if (this.inputPaCO2 && this.inputPeCO2) {
      this.resVdVt = this.calc.calcVdVt(this.inputPaCO2, this.inputPeCO2);
    }
  }

  public berekenSpontaneous(): void {
    // Update shared service with PaCO2 and EtCO2 values
    this.clinicalData.setPaCO2(this.inputPaCO2);
    this.clinicalData.setEtCO2(this.inputPeCO2);
    
    if (this.inputSponPpeak !== null && this.inputSponPeepTot !== null && this.inputSponPnadir !== null) {
      this.resPocc = this.inputSponPnadir - this.inputSponPeepTot;
      this.resPmus = this.calc.calcPmus(this.inputSponPnadir, this.inputSponPeepTot);
      this.resPtp = this.calc.calcPtp(this.inputSponPpeak, this.inputSponPeepTot, this.inputSponPnadir);
      this.pmusKleur = (this.resPmus > 15) ? 'danger' : (this.resPmus > 10) ? 'warning' : 'success';
      this.ptpKleur = (this.resPtp > 25) ? 'danger' : 'success';
    }
    if (this.inputPaCO2 && this.inputPeCO2) {
      this.resVdVt = this.calc.calcVdVt(this.inputPaCO2, this.inputPeCO2);
    }
  }

  public resetVelden(): void {
    this.inputVt = null; this.inputRR = null; this.inputPeep = null;
    this.inputPplat = null; this.inputPpiek = null;
    this.inputResistance = null; this.inputPaCO2 = null; this.inputPeCO2 = null;
    this.inputSponPpeak = null; this.inputSponPeepTot = null; this.inputSponPnadir = null;

    // Update shared service
    this.clinicalData.setPaCO2(null);
    this.clinicalData.setEtCO2(null);

    this.resDrivingPressure = null; this.resCstat = null; this.resCdyn = null;
    this.resVtPerKg = null; this.resMechPower = null; this.resTimeConstant = null;
    this.resVdVt = null; this.resPocc = null; this.resPmus = null; this.resPtp = null;
    this.dpKleur = 'medium'; this.mpKleur = 'medium'; this.pmusKleur = 'medium'; this.ptpKleur = 'medium';
  }
}
