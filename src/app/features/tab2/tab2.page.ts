import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonList, IonItem, IonInput, IonButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonLabel, IonNote, IonGrid, IonRow, IonCol, IonButtons,
  IonBadge, ModalController, IonIcon, IonText, IonMenuButton
} from '@ionic/angular/standalone';

import { CalculatorService } from '@core/services/calculator';
import { PatientService } from '@core/services/patient';
import { InfoModalComponent } from '../../shared/info-modal.component';

@Component({
  selector: 'app-tab2',
  templateUrl: './tab2.page.html',
  styleUrls: ['./tab2.page.scss'],
  standalone: true,
  imports: [
    IonButtons, CommonModule, FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonList, IonItem, IonInput, IonButton,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonLabel, IonNote, IonGrid, IonRow, IonCol,
    IonBadge, IonIcon, IonMenuButton
  ]
})
export class Tab2Page {
  // Services
  public patient = inject(PatientService);
  private calc = inject(CalculatorService);
  private modalCtrl = inject(ModalController);

  // --- INPUTS (Alleen relevant voor Gaswisseling/Circulatie) ---
  fio2: number | null = null;
  pao2: number | null = null;
  paco2: number | null = null;
  sao2: number | null = null;
  hb: number | null = null;
  svo2: number | null = null;

  // (RR en EtCO2 zijn verwijderd omdat die naar de ROX pagina zijn verhuisd)

  // --- RESULTATEN ---
  resPAO2: number | null = null;
  resAaGrad: number | null = null;
  resAaRatio: number | null = null;
  resPFRatio: number | null = null;
  resCaO2: number | null = null;

  aaStatusTekst = '';
  aaStatusKleur = 'medium';
  aaVerwacht: number | null = null;
  pfStatusTekst = '';
  pfStatusKleur = 'medium';
  resSvO2Message = '';
  resSvO2Color = 'medium';

  toonResultaten = false;

  // --- MODALS ---
  private async presentInfoModal(title: string, content: string) {
    const modal = await this.modalCtrl.create({
      component: InfoModalComponent,
      componentProps: { title, content },
      breakpoints: [0, 0.5, 1],
      initialBreakpoint: 1,
      handle: true
    });
    return await modal.present();
  }

  // Deze uitleg is BEHOUDEN
  async toonInfo() {
    const htmlContent = `
      <h3 style="color: #4db6ac; margin-bottom: 0.5em;">Zuurstofbalans & Diffusie</h3>

      <p><strong>1. Alveolaire O₂ (PAO₂)</strong><br>
      Berekende zuurstofdruk in de alveoli, afhankelijk van FiO₂ en atmosferische druk.<br>
      <em>Geeft aan hoeveel zuurstof beschikbaar is voor diffusie naar het bloed.</em><br>
      <small><strong>NW:</strong> varieert met FiO₂; bij 21% O₂ meestal 13–14 kPa.</small></p>

      <p><strong>2. A–a Gradiënt</strong><br>
      Verschil tussen alveolaire en arteriële zuurstofdruk.<br>
      <em>Verhoogd bij shunting, V/Q mismatch of diffusieproblemen.</em><br>
      <small><strong>NW:</strong> jong < 2 kPa, ouder < 4 kPa (neemt toe met leeftijd).</small></p>

      <p><strong>3. P/F Ratio (Horowitz)</strong><br>
      Verhouding tussen PaO₂ en FiO₂. Maatstaf voor oxygenatie-efficiëntie.<br>
      <em>Wordt gebruikt om de ernst van ARDS te bepalen.</em><br>
      <small><strong>NW:</strong> > 40 kPa (normale oxygenatie).</small></p>

      <p><strong>4. CaO₂ (O₂ Content)</strong><br>
      Totale zuurstofinhoud in arterieel bloed: Hb‑gebonden + opgelost O₂.<br>
      <em>Belangrijk voor weefseloxygenatie en perfusiebeoordeling.</em><br>
      <small><strong>NW:</strong> 16–22 mL/dL.</small></p>

      <p><strong>5. ScvO₂</strong><br>
      Centrale veneuze zuurstofsaturatie. Reflecteert balans tussen O₂‑aanbod en -verbruik.<br>
      <em>Laag bij verminderde cardiac output, laag Hb of verhoogde metabole vraag.</em><br>
      <small><strong>NW:</strong> 70–75%.</small></p>
    `;
    await this.presentInfoModal('Gaswisseling Info', htmlContent);
  }

  // --- BEREKENINGEN ---
  bereken() {
    if (this.fio2 == null || this.paco2 == null) return;

    this.resPAO2 = this.calc.calcPAO2(this.fio2, this.paco2);

    if (this.pao2 != null) {
      this.resAaGrad = this.calc.calcAaGradient(this.resPAO2, this.pao2);
      this.resAaRatio = this.calc.calcAaRatio(this.pao2, this.resPAO2);

      const leeftijd = this.patient.current.leeftijd || 20;
      this.aaVerwacht = 2.0 + (leeftijd * 0.03);

      this.aaStatusTekst = this.resAaGrad > this.aaVerwacht ? 'Verhoogd' : 'Normaal';
      this.aaStatusKleur = this.resAaGrad > this.aaVerwacht ? 'danger' : 'success';

      const fiO2Decimaal = this.fio2 / 100;
      this.resPFRatio = this.pao2 / fiO2Decimaal;

      if (this.resPFRatio > 40) {
        this.pfStatusTekst = 'Normaal';
        this.pfStatusKleur = 'success';
      } else if (this.resPFRatio > 13.3) {
        this.pfStatusTekst = 'Matige ARDS';
        this.pfStatusKleur = 'warning';
      } else {
        this.pfStatusTekst = 'Ernstige ARDS';
        this.pfStatusKleur = 'danger';
      }
    }

    if (this.hb != null && this.sao2 != null && this.pao2 != null) {
      this.resCaO2 = this.calc.calcCaO2(this.hb, this.sao2, this.pao2);
    }

    if (this.svo2 != null) {
      if (this.svo2 < 60) {
        this.resSvO2Color = 'danger';
        this.resSvO2Message = 'Laag! (Laag HMV/Hb/Pijn)';
      } else if (this.svo2 > 80) {
        this.resSvO2Color = 'warning';
        this.resSvO2Message = 'Hoog! (Sepsis/Shunt)';
      } else {
        this.resSvO2Color = 'success';
        this.resSvO2Message = 'Normaal';
      }
    }

    this.toonResultaten = true;
  }

  reset() {
    // ROX en CO2 variabelen verwijderd uit reset
    this.fio2 = this.pao2 = this.paco2 = this.hb = this.sao2 = this.svo2 = null;
    this.resPAO2 = this.resAaGrad = this.resAaRatio = this.resPFRatio = this.resCaO2 = null;
    this.resSvO2Message = '';
    this.toonResultaten = false;
  }
}
