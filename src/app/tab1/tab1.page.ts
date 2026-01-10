import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonSegment, IonSegmentButton, IonIcon, IonLabel,
  IonGrid, IonRow, IonCol, IonInput, IonItem, IonNote,
  IonSelect, IonSelectOption, IonButton, IonButtons, IonText,
  IonFooter, IonModal // <--- Toegevoegd
} from '@ionic/angular/standalone';

import { PatientService } from '../services/patient';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonSegment, IonSegmentButton, IonIcon, IonLabel,
    IonGrid, IonRow, IonCol, IonInput, IonItem, IonNote,
    IonSelect, IonSelectOption, IonButton, IonButtons, IonText,
    IonFooter, IonModal // <--- Toegevoegd aan imports array
  ]
})
export class Tab1Page {
  // Modernere injectie (vervangt constructor parameter)
  public patient = inject(PatientService);

  // Variabele voor de installatie-modal
  isModalOpen = false;

  // Functie om de modal te openen/sluiten
  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

  // Als je een ander bed kiest
  wisselBed(event: any) {
    this.patient.selectBed(event.detail.value);
  }

  // Als je typt (naam, lengte, gewicht), sla direct op
  dataGewijzigd() {
    this.patient.opslaan();
  }

  // Wis knop met bevestiging
  wisPatient() {
    if(confirm('Weet je zeker dat je de gegevens van dit bed wilt wissen?')) {
      this.patient.bedLeegmaken();
    }
  }
}
