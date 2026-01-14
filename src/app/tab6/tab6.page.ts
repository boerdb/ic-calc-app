import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../services/patient';
import { LungProfile, VentilationService } from '../services/ventilation';

// 1. We hebben ModalController hier nodig
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
  IonTitle, IonToolbar,
  ModalController , IonMenuButton // <--- DEZE TOEGEVOEGD
} from '@ionic/angular/standalone';

// 2. We importeren je nieuwe Wizard Component
import { PvWizardComponent } from '../components/pv-wizard/pv-wizard.component';

@Component({
  selector: 'app-tab6',
  templateUrl: './tab6.page.html',
  styleUrls: ['./tab6.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons,
    IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonCardSubtitle,
    IonItem, IonLabel, IonList, IonCheckbox, IonRow, IonCol,
    IonRange, IonAccordion, IonAccordionGroup, IonGrid, IonAlert, IonMenuButton
  ]
})
export class Tab6Page implements OnInit {

  // Modern inject() function instead of constructor injection
  private ventService = inject(VentilationService);
  public patient = inject(PatientService);
  private modalCtrl = inject(ModalController);

  currentRC: number = 0.75; // Standaardwaarde
  analysis: LungProfile | null = null;
  afspraken: any[] = [];
  idealFreq: number = 0;
  isAlertOpen = false;
  alertButtons = ['Begrepen'];

  constructor() {
    this.afspraken = this.ventService.WERK_AFSPRAKEN;
  }

  ngOnInit() {
    this.updateAnalysis();
  }

  // 4. DEZE FUNCTIE WERKT NU ECHT
  async openPVWizard() {
    const modal = await this.modalCtrl.create({
      component: PvWizardComponent
    });
    return await modal.present();
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
