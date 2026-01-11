import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // Nodig voor algemene dingen
import {
  IonApp, IonRouterOutlet, IonIcon, IonSplitPane,
  IonMenu, IonHeader, IonToolbar, IonTitle,
  IonContent, IonList, IonItem, IonLabel,IonMenuToggle
} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';

interface MenuPage {
  title: string;
  url: string;
  icon: string;
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
    CommonModule, RouterLink, IonMenuToggle
  ],
})
export class AppComponent {

  pages: MenuPage[] = [
    { title: 'Home', url: '/home', icon: 'home-outline' },
    { title: 'Patiënt', url: '/patient', icon: 'flash' },
    { title: 'O2/Gas & ROX', url: '/oxygen-gas', icon: 'flask' },
    { title: 'Ventilatie', url: '/ventilatie', icon: 'cloud' },
    { title: 'PiCCO & Hemodynamiek', url: '/hemodynamiek', icon: 'heart' },
    { title: 'Medicatie & Advies', url: '/medicatie', icon: 'medkit' },
    { title: 'Hamilton iASV', url: '/hamilton', icon: 'settings' },
  ];

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
