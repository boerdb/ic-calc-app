import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // Nodig voor algemene dingen
import {
  IonApp, IonRouterOutlet, IonIcon, IonSplitPane,
  IonMenu, IonHeader, IonToolbar, IonTitle,
  IonContent, IonList, IonItem, IonLabel, IonMenuToggle, IonListHeader
} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';

interface MenuPage {
  title: string;
  url: string;
  icon: string;
}

interface MenuGroup {
  header: string;
  items: MenuPage[];
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    IonApp, IonRouterOutlet, IonIcon, IonSplitPane,
    IonMenu, IonHeader, IonToolbar, IonTitle,
    IonContent, IonList, IonItem, IonLabel,
    CommonModule, RouterLink, IonMenuToggle, IonListHeader
  ],
})
export class AppComponent {

  homeItem: MenuPage = { title: 'HOME', url: '/home', icon: 'home-outline' };

  menuGroups: MenuGroup[] = [
    {
      header: 'Ventilation Practitioner',
      items: [
        { title: 'ROX-index', url: '/rox', icon: 'flask-outline' },
        { title: 'Co2 gap', url: '/oxygen-gas', icon: 'analytics-outline' },
        { title: 'Ventilatie', url: '/ventilatie', icon: 'cloud-outline' }
      ]
    },
    {
      header: 'Circulation Practitioner',
      items: [
        { title: 'Hemodynamiek', url: '/hemodynamiek', icon: 'heart-outline' },
        { title: 'Medicatie', url: '/medicatie', icon: 'medkit-outline' }
      ]
    },
    {
      header: 'Renal Practitioner',
      items: [
        { title: 'Nierfunctie', url: '/patient', icon: 'water-outline' },
        { title: 'CVVHD balans', url: '/patient', icon: 'fitness-outline' }
      ]
    }
  ];

  // Voeg extra menu groep toe: Overige
  // 'Patiëntbeheer' linkt naar /tab1 (placeholder)
  // We append programmatically to keep the static menuGroups decl concise
  constructor() {
    this.menuGroups.push({
      header: 'Overige',
      items: [
        { title: 'Patiëntbeheer', url: '/tab1', icon: 'people-outline' }
      ]
    });
  }

  infoItem: MenuPage = { title: 'INFO', url: '/info', icon: 'information-circle-outline' };

  deferredPrompt: any = null;
  showInstallBanner = false; // Hernoemd van 'Button' naar 'Banner'

  @HostListener('window:beforeinstallprompt', ['$event'])
  onBeforeInstallPrompt(e: any) {
    e.preventDefault();
    this.deferredPrompt = e;
    this.showInstallBanner = true; // Toon de balk
  }

  async installApp() {
    if (!this.deferredPrompt) return;

    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    console.log(`Gebruiker keuze: ${outcome}`);

    this.deferredPrompt = null;
    this.showInstallBanner = false;
  }

  // NIEUW: Functie om de balk weg te klikken via het kruisje
  closeBanner() {
    this.showInstallBanner = false;
  }
}
