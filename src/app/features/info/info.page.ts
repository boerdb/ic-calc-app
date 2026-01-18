import { Component } from '@angular/core';

import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonMenuButton, IonText } from '@ionic/angular/standalone';

@Component({
  selector: 'app-info',
  templateUrl: 'info.page.html',
  styleUrls: ['info.page.scss'],
  standalone: true,
  imports: [IonText, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton]
})
export class InfoPage {
  constructor() {}
}
