import { Component, HostListener } from '@angular/core'; // HostListener toegevoegd
import { IonApp, IonRouterOutlet, IonFab, IonFabButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons'; // Nodig voor iconen in standalone
import { downloadOutline } from 'ionicons/icons'; // Het specifieke icoontje

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  // BELANGRIJK: Hier voegen we de UI elementen toe die we in de HTML gebruiken
  imports: [IonApp, IonRouterOutlet, IonFab, IonFabButton, IonIcon],
})
export class AppComponent {

  // Variabelen om de status bij te houden
  deferredPrompt: any = null;
  showInstallButton = false;

  constructor() {
    // Registreer het icoontje dat we willen gebruiken
    addIcons({ downloadOutline });
  }

  // 1. Luister naar het 'beforeinstallprompt' event van de browser
  @HostListener('window:beforeinstallprompt', ['$event'])
  onBeforeInstallPrompt(e: any) {
    // Voorkom dat Chrome meteen de standaard balk toont (wij willen onze eigen knop)
    e.preventDefault();

    // Bewaar het event voor later, zodat we het kunnen activeren als de gebruiker klikt
    this.deferredPrompt = e;

    // Toon nu onze eigen knop
    this.showInstallButton = true;
  }

  // 2. De functie die wordt uitgevoerd als je op de knop klikt
  async installApp() {
    if (!this.deferredPrompt) {
      return;
    }

    // Trigger de browser popup
    this.deferredPrompt.prompt();

    // Wacht op de keuze van de gebruiker
    const { outcome } = await this.deferredPrompt.userChoice;
    console.log(`Gebruiker keuze: ${outcome}`);

    // Opruimen
    this.deferredPrompt = null;
    this.showInstallButton = false;
  }
}
