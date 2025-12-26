import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonSegment, IonSegmentButton, IonIcon, IonLabel,
  IonGrid, IonRow, IonCol, IonInput, IonItem, IonNote,
  IonSelect, IonSelectOption, IonButton, IonButtons, IonText } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { maleOutline, femaleOutline, trashOutline, bedOutline } from 'ionicons/icons';
import { PatientService } from '../services/patient';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonText,
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonSegment, IonSegmentButton, IonIcon, IonLabel,
    IonGrid, IonRow, IonCol, IonInput, IonItem, IonNote,
    IonSelect, IonSelectOption, IonButton, IonButtons
  ]
})
export class Tab1Page {

  constructor(public patient: PatientService) {
    addIcons({ maleOutline, femaleOutline, trashOutline, bedOutline });
  }

  // Als je een ander bed kiest
  wisselBed(event: any) {
    this.patient.kiesBed(event.detail.value);
  }

  // Als je typt (naam, lengte, gewicht), sla direct op
  dataGewijzigd() {
    this.patient.opslaan();
  }

  // Wis knop
  wisPatient() {
    if(confirm('Weet je zeker dat je de gegevens van dit bed wilt wissen?')) {
      this.patient.bedLeegmaken();
    }
  }
}
