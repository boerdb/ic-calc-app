import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonRow,
  IonSegment, IonSegmentButton,
  IonSelect, IonSelectOption,
  IonTitle,
  IonToolbar,
  ModalController, IonMenuButton
} from '@ionic/angular/standalone';

import { InfoModalComponent } from '@shared/info-modal.component';
import { CalculatorService } from '@core/services/calculator';
import { PatientService } from '@core/services/patient';

@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
  standalone: true,
  imports: [
    IonButtons, IonCardSubtitle, IonItem,
    IonIcon,
    CommonModule, FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonGrid, IonRow, IonCol, IonInput, IonButton,
    IonLabel,
    IonSelect, IonSelectOption,
    IonSegment, IonSegmentButton, IonMenuButton
  ]
})
export class Tab5Page {

  // Modern inject() function instead of constructor injection
  public patient = inject(PatientService);
  private calc = inject(CalculatorService);
  private modalCtrl = inject(ModalController);

  // HIER IS HET SLOTJE:
  private hasCalculated: boolean = false;

  // Nora variabelen
  noraMode: string = 'naarMl';
  noraDosis: number | null = null;
  noraConcMg: number = 5;
  noraVolume: number = 50;
  noraResStand: number | null = null;

  noraInputMl: number | null = null;
  noraResultGamma: number | null = null;

  // Argi variabelen
  argiConc: number = 0.8;
  argiDosis: number | null = null;
  argiResStand: number | null = null;

  argiOptions = [
    { value: 0.01, label: 'Start: 0,01 IE/min' },
    { value: 0.02, label: 'Stap 2: 0,02 IE/min' },
    { value: 0.03, label: 'Max: 0,03 IE/min' }
  ];

  // --- Info Popup ---
  async toonInfo() {
    const htmlContent = `
      <h3>Argipressine Protocol</h3>
      <p>Vasopressor (V1-agonist). Alleen bij refractaire septische shock.</p>

      <h3>1. Indicatie</h3>
      <ul>
        <li><strong>SVR:</strong> Laag (< 1700)</li>
        <li><strong>Nor:</strong> > 0,20 mcg/kg/min</li>
        <li><strong>CI:</strong> > 3.0 (geen hartfalen)</li>
      </ul>

      <h3>2. Dosering</h3>
      <p><i>Onafhankelijk van gewicht.</i></p>
      <ul>
        <li><strong>Start:</strong> 0,01 IE/min</li>
        <li><strong>Stap:</strong> + 0,01 per 15-30 min</li>
        <li><strong>Max:</strong> 0,03 IE/min</li>
      </ul>

      <h3>3. Afbouwen</h3>
      <div style="background: #006666; padding: 5px; border-radius: 4px; border-left: 3px solid #ff9800;">
        <strong>Let op:</strong> Bouw eerst Noradrenaline af tot < 0,10.
      </div>
      <p>Daarna Argipressine verlagen met 0,01 IE/min per uur.</p>
    `;

    const modal = await this.modalCtrl.create({
      component: InfoModalComponent,
      componentProps: { title: 'Protocol Info', content: htmlContent }
    });
    await modal.present();
  }

  // --- PiCCO Advies Logica ---
  get piccoAdvies(): string | null {
    const p = this.patient.current.picco;
    const nora = this.noraDosis || 0;

    if (!p || !p.svr || !p.ci) return null;

    if (p.svr < 1700) {
      // Pas waarschuwen over Nor > 0.20 als er berekend is
      if (nora > 0.20 && this.hasCalculated) {
        return 'SVR is laag (<1700) en Nor > 0,20. Protocol: Overweeg Argipressine (Refractaire shock).';
      }
      return 'SVR is laag (<1700). Noradrenaline is geïndiceerd om de afterload te verhogen.';
    }

    if (p.ci < 3.0) {
      return 'CI is laag (<3.0). Dit duidt op een contractiliteitsprobleem. Protocol: Start Enoximon (1e keus).';
    }

    return 'PiCCO waarden lijken stabiel (SVR > 1700, CI > 3.0).';
  }

  get isArgiIndicated(): boolean {
    // Checkt of er op de knop is gedrukt
    if (!this.hasCalculated) return false;
    return (this.noraDosis || 0) > 0.20 || (this.noraResultGamma || 0) > 0.20;
  }

  get isArgiAfbouwIndicated(): boolean {
    if (!this.hasCalculated) return false;
    return (this.noraDosis !== null) && (this.noraDosis <= 0.10) && (this.argiDosis !== null);
  }

  // --- Berekeningen ---

  updateGewicht() {
    // Alleen opslaan, niet direct herberekenen/tonen
    this.patient.opslaan();
  }

  modeChanged() {
    this.reset();
  }

  bereken() {
    // NU pas mag alles getoond worden
    this.hasCalculated = true;
    this.patient.opslaan(); // Veiligheidshalve nog eens opslaan

    this.berekenNora();
    this.berekenArgi();
  }

  private berekenNora() {
    const gewicht = this.patient.current.gewicht;

    if (!gewicht || !this.noraConcMg) {
      this.noraResStand = null;
      this.noraResultGamma = null;
      return;
    }

    const mcgTotaal = this.noraConcMg * 1000;
    const concMcgMl = mcgTotaal / this.noraVolume;

    // SITUATIE 1: Gamma -> ml/uur
    if (this.noraMode === 'naarMl') {
      if (this.noraDosis) {
        this.noraResStand = (this.noraDosis * gewicht * 60) / concMcgMl;
      } else {
        this.noraResStand = null;
      }
    }
    // SITUATIE 2: ml/uur -> Gamma
    else {
      if (this.noraInputMl) {
        this.noraResultGamma = (this.noraInputMl * concMcgMl) / (gewicht * 60);
      } else {
        this.noraResultGamma = null;
      }
    }
  }

  private berekenArgi() {
    if (this.argiDosis) {
      this.argiResStand = (this.argiDosis * 60) / this.argiConc;
    } else {
      this.argiResStand = null;
    }
  }

  reset() {
    this.hasCalculated = false; // Reset het slotje
    this.noraDosis = null;
    this.noraResStand = null;
    this.argiDosis = null;
    this.argiResStand = null;
    this.noraInputMl = null;
    this.noraResultGamma = null;
  }
}
