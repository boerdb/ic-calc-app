import { Component, Input, OnInit, inject } from '@angular/core';

import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
  IonIcon, ModalController
} from '@ionic/angular/standalone';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-info-modal',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>{{ title }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="sluiten()">
            <ion-icon name="close-outline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="leather-bg ion-padding" [scrollY]="true">
      <div [innerHTML]="safeContent" class="modal-body"></div>
    </ion-content>
  `,
  styles: [`
    /* 1. Donkere Leerstructuur */
    .leather-bg {
      --background: #0a0a0a;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E");
      background-color: #0a0a0a;
    }

    ion-toolbar {
      --background: #121212;
      --color: white;
      --border-color: #222;
      font-weight: 600;
    }

    /* 2. Content Styling */
    .modal-body {
      color: rgba(255, 255, 255, 0.9);
      font-size: 1.05em;
      line-height: 1.6;
      padding-bottom: 40px;
    }

    ::ng-deep h3 {
      color: #4db6ac; /* Subtiel Teal */
      margin-top: 25px;
      font-size: 1.25em;
      font-weight: 600;
      border-bottom: 1px solid #333;
      padding-bottom: 8px;
    }

    ::ng-deep strong {
      color: #4db6ac;
    }

    /* Tabel styling voor de CO2-uitleg op zwart leer */
    ::ng-deep table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      background: rgba(255,255,255,0.03);
      border-radius: 8px;
      overflow: hidden;
    }

    ::ng-deep th, ::ng-deep td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #222;
    }

    ::ng-deep th {
      background: #1a1a1a;
      color: #4db6ac;
      font-size: 0.9em;
      text-transform: uppercase;
    }
  `]
})
export class InfoModalComponent implements OnInit {
  @Input() title: string = 'Informatie';
  @Input() content: string = '';

  private modalCtrl = inject(ModalController);
  private sanitizer = inject(DomSanitizer);

  public safeContent: SafeHtml = '';

  constructor() {
    // Registreer het sluit-icoon centraal
    addIcons({ 'close-outline': closeOutline });
  }

  ngOnInit() {
    this.safeContent = this.sanitizer.bypassSecurityTrustHtml(this.content);
  }

  sluiten() {
    this.modalCtrl.dismiss();
  }
}
