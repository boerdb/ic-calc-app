import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common'; // Nodig voor algemene dingen
import { IonApp, IonRouterOutlet, IonIcon, IonFab, IonFabButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { downloadOutline, close } from 'ionicons/icons'; // 'close' toegevoegd voor het kruisje
import { registerAppIcons } from './utils/icon-registry'; // Import centralized icon registry

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  // IonFab en IonFabButton zijn weggehaald, want die gebruiken we niet meer
  imports: [IonApp, IonRouterOutlet, IonIcon, CommonModule],
})
export class AppComponent {

  deferredPrompt: any = null;
  showInstallBanner = false; // Hernoemd van 'Button' naar 'Banner'

  constructor() {
    // Register all app icons centrally
    registerAppIcons();
    // Register app-specific icons
    addIcons({ downloadOutline, close });
  }

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
