import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Alle Ionic componenten die we in de HTML gebruiken
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonList, IonItem, IonInput, IonButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonLabel, IonNote, IonGrid, IonRow, IonCol, IonButtons,
  IonBadge,AlertController, IonIcon // <--- TOEGEVOEGD
} from '@ionic/angular/standalone';

// Onze eigen services
import { CalculatorService } from '../services/calculator';
import { PatientService } from '../services/patient';
import { addIcons } from 'ionicons';
import { informationCircleOutline } from 'ionicons/icons'; // <--- TOEGEVOEGD
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
    IonLabel, IonNote, IonGrid, IonRow, IonCol,
    IonBadge,IonIcon // <--- TOEGEVOEGD AAN IMPORTS
  ]
})
export class Tab2Page {

  // --- INPUTS ---
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

  // --- STATUS TEKSTEN & KLEUREN ---
  aaStatusTekst = '';
  aaStatusKleur = 'medium';
  aaVerwacht: number | null = null;

  pfStatusTekst = '';
  pfStatusKleur = 'medium';

  // NIEUW: SvO2 Status variabelen
  resSvO2Message = '';
  resSvO2Color = 'medium';

  // Helper om te zien of we resultaten moeten tonen
  toonResultaten = false;

  constructor(
    public patient: PatientService, // Voor de leeftijd (patient.current.leeftijd)
    private calc: CalculatorService, // Voor de formules
    private alertCtrl: AlertController // <--- TOEGEVOEGD
  ) {
    addIcons({
      informationCircleOutline
    });
  }

// --- AANGEPASTE INFO FUNCTIE (Nu zonder HTML tags) ---
  async toonInfo() {
    const alert = await this.alertCtrl.create({
      header: 'Parameter Info',
      // We gebruiken \n voor een nieuwe regel. Dit werkt altijd veilig.
      message:
        'PAO₂: Zuurstofspanning in de longblaasjes (Alveolair).\n\n' +
        'A-a Gradiënt: Het drukverschil tussen longblaasje en bloed. Maat voor diffusie.\n\n' +
        'P/F Ratio (Horowitz): Maat voor de ernst van longschade (ARDS).\n\n' +
        'CaO₂: Totale zuurstofinhoud in het arteriële bloed (gebonden + opgelost).\n\n' +
        'ScvO₂: Balans tussen zuurstofaanbod en zuurstofverbruik.',
      buttons: ['OK']
    });
    await alert.present();
  }

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
        this.pfStatusKleur = 'warning';
      } else {
        this.pfStatusTekst = 'Ernstige ARDS';
        this.pfStatusKleur = 'danger';
      }
    }

    // 3. Oxygen Content (CaO2) - Alleen als Hb en SaO2 er zijn
    if (this.hb != null && this.sao2 != null && this.pao2 != null) {
      this.resCaO2 = this.calc.calcCaO2(this.hb, this.sao2, this.pao2);
    }

    // 4. NIEUW: SvO2 / ScvO2 Interpretatie
    if (this.svo2 != null) {
      if (this.svo2 < 60) {
        this.resSvO2Color = 'danger';
        this.resSvO2Message = 'Laag! Verhoogde extractie (DD: Laag HMV/Shock, Laag Hb, Pijn/Koorts)';
      } else if (this.svo2 > 80) {
        this.resSvO2Color = 'warning';
        this.resSvO2Message = 'Hoog! Verlaagde extractie (DD: Sepsis/Shunting, Leverfalen)';
      } else {
        this.resSvO2Color = 'success';
        this.resSvO2Message = 'Normaal (Balans DO2/VO2 adequaat)';
      }
    } else {
      // Als veld leeg is, ook bericht leegmaken
      this.resSvO2Message = '';
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
    this.resAaRatio = null; // Ook even resetten
    this.resPFRatio = null;
    this.resCaO2 = null;

    // SvO2 resetten
    this.resSvO2Message = '';
    this.resSvO2Color = 'medium';

    this.toonResultaten = false;
  }
}
