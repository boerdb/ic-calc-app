import { Component, inject, ChangeDetectionStrategy } from '@angular/core'; // inject toegevoegd
 // Nodig voor @for en *ngIf
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonMenuButton, IonButton, IonIcon, IonCol, IonCard,
  IonGrid, IonRow, IonCardHeader, IonCardSubtitle, IonCardContent
} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { PatientService } from '../../services/patient'; // Check even of dit pad klopt!

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonRow,
    IonGrid,
    IonCol,
    IonContent,
    IonIcon,
    IonMenuButton,
    RouterLink
]
})
export class HomePage {
  // Gebruik de moderne inject methode zoals je gevraagd hebt
  public patient = inject(PatientService);

  // De lijst met pagina's voor je dashboard-tegels
 public pages = [
  { title: 'Patiëntbeheer', url: '/patient', icon: 'people-outline' }, // Nu als eerste blokje
  { title: 'O₂ balans & diffusie', url: '/oxygen-gas', icon: 'calculator-outline' },
  { title: 'Ventilatie', url: '/ventilatie', icon: 'cloud-outline' },
  { title: 'Hemodynamiek', url: '/hemodynamiek', icon: 'pulse-outline' },
  { title: 'Medicatie', url: '/medicatie', icon: 'medkit-outline' },
  { title: 'Hamilton Wizard', url: '/hamilton', icon: 'analytics-outline' }
];

  constructor() {}
}
