import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../services/patient';
import { LungProfile, VentilationService } from '../services/ventilation';

import {
  IonAccordion, IonAccordionGroup,
  IonAlert,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCheckbox,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem, IonLabel, IonList,
  IonRange,
  IonRow,
  IonTitle, IonToolbar
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { informationCircleOutline, medkitOutline, pulseOutline, reorderTwoOutline, stopCircleOutline, warning } from 'ionicons/icons';

@Component({
  selector: 'app-tab6',
  templateUrl: './tab6.page.html',
  styleUrls: ['./tab6.page.scss'],
  standalone: true,
  imports: [IonCardSubtitle,
    CommonModule, FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons,
    IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonItem, IonLabel, IonList, IonCheckbox, IonRow, IonCol,
    IonRange, IonAccordion, IonAccordionGroup, IonGrid, IonAlert

  ]
})
export class Tab6Page implements OnInit {
  currentRC: number = 0.75; // Standaardwaarde
  analysis: LungProfile | null = null;
  afspraken: any[] = [];
  idealFreq: number = 0;
  isAlertOpen = false;
  alertButtons = ['Begrepen'];

  constructor(
    private ventService: VentilationService,
    public patient: PatientService
  ) {
    this.afspraken = this.ventService.WERK_AFSPRAKEN;
    addIcons({ pulseOutline, reorderTwoOutline, informationCircleOutline, warning, stopCircleOutline, medkitOutline });
  }

  ngOnInit() {
    this.updateAnalysis();
  }

  // --- NIEUW: DEZE FUNCTIE ONTVANGT DE DATA ---
  // Dit draait elke keer als je op Tab 6 klikt
  ionViewWillEnter() {
    // Check of er een RC-waarde is berekend in Tab 3 (en of die geldig is)
    if (this.patient.current.rcExp && this.patient.current.rcExp > 0) {

      // We nemen de waarde over
      this.currentRC = this.patient.current.rcExp;

      // We zorgen dat de slider niet buiten beeld raakt (max 2.0 op de slider)
      if (this.currentRC > 2.0) this.currentRC = 2.0;
      if (this.currentRC < 0.1) this.currentRC = 0.1;

      // Update direct de analyse (kleurtjes, Otis frequentie etc.)
      this.updateAnalysis();
    }
  }
  // ---------------------------------------------

  setOpen(isOpen: boolean) {
    this.isAlertOpen = isOpen;
  }

  updateAnalysis() {
    this.analysis = this.ventService.getProfileByRCexp(this.currentRC);
    this.idealFreq = this.ventService.calculateOtisFrequency(this.currentRC);
  }
}
