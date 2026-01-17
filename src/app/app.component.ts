import { Component, HostListener, inject } from '@angular/core';

import {
  IonApp, IonRouterOutlet, IonIcon, IonSplitPane,
  IonMenu, IonHeader, IonToolbar, IonTitle,
  IonContent, IonList, IonItem, IonLabel, IonMenuToggle, IonListHeader, IonFooter
} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';

// 1. Importeer addIcons en de standaard iconen die je gebruikt
import { addIcons } from 'ionicons';
import {
  homeOutline, flaskOutline, cloudOutline, medkitOutline,
  heartOutline, calculatorOutline, waterOutline, fitnessOutline,
  peopleOutline, informationCircleOutline, layersOutline
} from 'ionicons/icons';

interface MenuPage {
  title: string;
  url: string;
  icon: string;
}

interface MenuGroup {
  header: string;
  // 2. Nieuw: Icoon en Kleur voor de Groep (De Practitioner)
  icon?: string;
  color?: string;
  items: MenuPage[];
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonFooter, IonApp, IonRouterOutlet, IonIcon, IonSplitPane, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, RouterLink, IonMenuToggle, IonListHeader],
})
export class AppComponent {

  homeItem: MenuPage = { title: 'HOME', url: '/home', icon: 'home-outline' };

  menuGroups: MenuGroup[] = [
    {
      header: 'Ventilation Practitioner',
      icon: 'ventilation', // Jouw Custom SVG naam
      color: 'secondary',    // Blauw (of kies een custom kleur)
      items: [
        { title: 'ROX-index & CO₂ Gap', url: '/rox', icon: 'flask-outline' },
        { title: 'Ventilatie', url: '/ventilatie', icon: 'cloud-outline' },
        { title: 'Hamilton Wizard', url: '/hamilton', icon: 'medkit-outline' }
      ]
    },
    {
      header: 'Circulation Practitioner',
      icon: 'circulation', // Jouw Custom SVG naam
      color: 'danger',     // Rood
      items: [
        { title: 'Hemodynamiek', url: '/hemodynamiek', icon: 'heart-outline' },
        { title: 'Vaso-activa', url: '/medicatie', icon: 'medkit-outline' },
        { title: 'O₂ balans & diffusie', url: '/oxygen-gas', icon: 'calculator-outline' }
      ]
    },
    {
      header: 'Renal Practitioner',
      icon: 'renal',       // Jouw Custom SVG naam
      color: 'tertiary',   // Paars/Blauw
      items: [
        { title: 'Nierfunctie', url: '/nierfunctie', icon: 'water-outline' },
        { title: 'CVVHD balans', url: '/cvvhd', icon: 'fitness-outline' }
      ]
    }
    ,
    {
      header: 'Overige',
      icon: 'layers-outline',  // Het nieuwe icoon
      color: 'success',         // Grijs (neutraal) of 'success' (groen)
      items: [
        { title: 'Patiëntbeheer', url: '/patient', icon: 'people-outline' }
        //{ title: 'Smart Notes', url: '/shift-log', icon: 'clipboard' }
      ]
    }
  ];

  infoItem: MenuPage = { title: 'INFO', url: '/info', icon: 'information-circle-outline' };

  deferredPrompt: any = null;
  showInstallBanner = false;

  constructor() {
    // 3. REGISTREER ALLE ICONEN HIER
    // Dit koppelt de naam (string) aan het svg bestand
    addIcons({
      // Standaard iconen
      'home-outline': homeOutline,
      'flask-outline': flaskOutline,
      'cloud-outline': cloudOutline,
      'medkit-outline': medkitOutline,
      'heart-outline': heartOutline,
      'calculator-outline': calculatorOutline,
      'water-outline': waterOutline,
      'fitness-outline': fitnessOutline,
      'people-outline': peopleOutline,
      'information-circle-outline': informationCircleOutline,
      'layers-outline': layersOutline,

      // JOUW CUSTOM SVGs (Zorg dat de bestanden in src/assets/icons/ staan)
      'ventilation': 'assets/icons/ventilation.svg',
      'circulation': 'assets/icons/circulation.svg',
      'renal': 'assets/icons/renal.svg',
    });
  }

  @HostListener('window:beforeinstallprompt', ['$event'])
  onBeforeInstallPrompt(e: any) {
    e.preventDefault();
    this.deferredPrompt = e;
    this.showInstallBanner = true;
  }

  async installApp() {
    if (!this.deferredPrompt) return;
    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    console.log(`Gebruiker keuze: ${outcome}`);
    this.deferredPrompt = null;
    this.showInstallBanner = false;
  }

  closeBanner() {
    this.showInstallBanner = false;
  }
}
