import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
  IonIcon, ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';

import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-info-modal',
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ title }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="sluiten()">
            <ion-icon name="close-outline" slot="icon-only" style="font-size: 1.5em;"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div [innerHTML]="safeContent" style="font-size: 1.1em; line-height: 1.6; color: var(--ion-text-color);"></div>
    </ion-content>
  `,
  styles: [`
    /* Styling voor de HTML content */
    ::ng-deep h3 {
      color: #00796B;
      margin-top: 20px;
      font-size: 1.2em;
      font-weight: bold;
      border-bottom: 1px solid #444;
      padding-bottom: 5px;
    }
    ::ng-deep ul {
      padding-left: 20px;
      margin-bottom: 15px;
    }
    ::ng-deep li {
      margin-bottom: 8px;
    }
    ::ng-deep strong {
      color: #90caf9;
    }
    /* Zorg dat plaatjes altijd passen */
    ::ng-deep img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      display: block; /* Voorkomt rare witruimtes */
    }
    /* Zorg dat linkjes en knoppen er goed uitzien */
    ::ng-deep a {
      text-decoration: none;
    }
  `]
})
export class InfoModalComponent implements OnInit {
  @Input() title: string = 'Informatie';
  @Input() content: string = '';

  public safeContent: SafeHtml = '';

  private modalCtrl = inject(ModalController);
  private sanitizer = inject(DomSanitizer);

  constructor() {
    addIcons({ closeOutline });
  }

  // 3. Zodra de pagina laadt, keuren we de HTML goed
  ngOnInit() {
    // bypassSecurityTrustHtml vertelt Angular: "Vertrouw deze code, ik heb het zelf geschreven"
    this.safeContent = this.sanitizer.bypassSecurityTrustHtml(this.content);
  }

  sluiten() {
    this.modalCtrl.dismiss();
  }
}
