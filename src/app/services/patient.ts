import { Injectable } from '@angular/core';

// Zo ziet een Bed eruit in het geheugen
interface BedData {
  id: number;
  naam?: string; // Optioneel: "Jansen" of "Mvr de Vries"
  geslacht: 'male' | 'female';
  leeftijd?: number;
  lengte: number | null;
  gewicht: number | null;
  ibw: number | null;
  bsa: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class PatientService {

  // We beheren 13 bedden
  public beds: BedData[] = [];

  // Welk bed is er NU geselecteerd? (Standaard Bed 1)
  public selectedBedId: number = 1;

  constructor() {
    this.laadGegevens();
  }

  // Huidige patiënt ophalen (zodat Tab 3 makkelijk data kan lezen)
  get current(): BedData {
    return this.beds.find(b => b.id === this.selectedBedId)!;
  }

  // Gegevens laden uit telefoon geheugen
  private laadGegevens() {
    const opgeslagen = localStorage.getItem('mijn_patienten_data');

    if (opgeslagen) {
      this.beds = JSON.parse(opgeslagen);
    } else {
      // Eerste keer? Maak 13 lege bedden aan
      for (let i = 1; i <= 13; i++) {
        this.beds.push({
          id: i,
          naam: '',
          geslacht: 'male',
          lengte: null,
          gewicht: null,
          ibw: null,
          bsa: null
        });
      }
    }

    // Onthoud ook welk bed als laatste open stond
    const lastBed = localStorage.getItem('last_selected_bed');
    if (lastBed) this.selectedBedId = parseInt(lastBed);
  }

  // Gegevens opslaan (Automatisch aanroepen bij elke wijziging)
  public opslaan() {
    this.herbereken(); // Eerst zorgen dat BSA/IBW kloppen
    localStorage.setItem('mijn_patienten_data', JSON.stringify(this.beds));
    localStorage.setItem('last_selected_bed', this.selectedBedId.toString());
  }

  // De rekenmachine (nu voor de HUIDIGE patiënt)
  public herbereken() {
    const p = this.current; // Werk met de geselecteerde patiënt

    if (!p.lengte) {
      p.ibw = null;
      p.bsa = null;
      return;
    }

    // 1. IBW
    const lengteBoven152 = Math.max(0, p.lengte - 152.4);
    if (p.geslacht === 'male') {
      p.ibw = 50 + (0.91 * lengteBoven152);
    } else {
      p.ibw = 45.5 + (0.91 * lengteBoven152);
    }

    // 2. BSA
    if (p.gewicht) {
      p.bsa = 0.007184 * Math.pow(p.gewicht, 0.425) * Math.pow(p.lengte, 0.725);
    }
  }

  // Bed wisselen
  public kiesBed(id: number) {
    this.selectedBedId = id;
    this.opslaan(); // Sla keuze op
  }

  // Patiënt ontslaan (Bed leegmaken)
  public bedLeegmaken() {
    const index = this.beds.findIndex(b => b.id === this.selectedBedId);
    if (index > -1) {
      this.beds[index] = {
        id: this.selectedBedId,
        naam: '',
        geslacht: 'male',
        leeftijd: undefined,
        lengte: null,
        gewicht: null,
        ibw: null,
        bsa: null
      };
      this.opslaan();
    }
  }
}
