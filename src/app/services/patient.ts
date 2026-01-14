import { Injectable } from '@angular/core';

// Hier definiëren we ALLES wat we willen onthouden per patiënt
export interface BedData {
  // --- 1. Basis Gegevens (Tab 1) ---
  bedId: string;
  naam: string;
  leeftijd: number | null;
  geslacht: string;
  gewicht: number | null;
  lengte: number | null;

  // Berekende basis waarden
  ibw?: number;
  bmi?: number;
  bsa?: number;

  // --- 2. Gaswisseling & Bloedgas (Tab 2) ---
  gas?: {
    fio2: number | null;
    pao2: number | null;
    paco2: number | null;
    sao2: number | null;
    hb: number | null;
    svo2: number | null;
  };

  // --- 3. Ademhaling & Capno (ROX / CO2) ---
  ademhaling?: {
    rr: number | null;    // Ademhalingsfrequentie
    etco2: number | null; // End-tidal CO2
    rcExp: number | null; // Expiratoire weerstand
  };

  // --- 4. PiCCO / Circulatie ---
  picco?: {
    ci: number | null;
    svr: number | null;
    gedi?: number | null;
    elwi?: number | null;
    map?: number | null;
    gef?: number | null;
  };

  // --- 5. Overige (Nierfunctie etc.) ---
  nier?: {
    creat: number | null;
    ureum: number | null;
    urine24u: number | null;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PatientService {

  // LIJST MET BEDDEN
  private bedNames = ['1-1', '1-2', '1-3', '1-4', '2-1', '2-2', '3-1', '3-2', '4-1', '4-2', '5', '6', '7', '8'];

  beds: BedData[] = [];
  current!: BedData;

  constructor() {
    this.loadFromStorage();
  }

  // --- OPSLAAN & LADEN ---

  private loadFromStorage() {
    const savedBeds = localStorage.getItem('icu_beds_data');
    const savedSelectedId = localStorage.getItem('icu_selected_bed');

    if (savedBeds) {
      this.beds = JSON.parse(savedBeds);

      // CRUCIAAL: Als je nieuwe velden toevoegt aan de interface hierboven,
      // moet je hier checken of ze bestaan in de oude data, anders crasht de app.
      this.beds.forEach(bed => {
        if (!bed.gas) bed.gas = { fio2: null, pao2: null, paco2: null, sao2: null, hb: null, svo2: null };
        if (!bed.ademhaling) bed.ademhaling = { rr: null, etco2: null, rcExp: null };
        if (!bed.picco) bed.picco = { ci: null, svr: null, gedi: null, elwi: null, map: null, gef: null };
        if (!bed.nier) bed.nier = { creat: null, ureum: null, urine24u: null };
      });

    } else {
      this.resetAllBeds();
    }

    // Zet het juiste bed actief
    if (savedSelectedId) {
      const found = this.beds.find(b => b.bedId === savedSelectedId);
      this.current = found ? found : this.beds[0];
    } else {
      this.current = this.beds[0];
    }
  }

  private saveToStorage() {
    localStorage.setItem('icu_beds_data', JSON.stringify(this.beds));
    localStorage.setItem('icu_selected_bed', this.current.bedId);
  }

  // --- INTERACTIE ---

  selectBed(id: string) {
    const found = this.beds.find(b => b.bedId === id);
    if (found) {
      this.current = found;
      this.saveToStorage();
    }
  }

  opslaan() {
    this.calculateDerivedValues();
    this.saveToStorage();
  }

  bedLeegmaken() {
    // Reset alles naar leeg/null
    this.current.naam = '';
    this.current.leeftijd = null;
    this.current.geslacht = 'M';
    this.current.gewicht = null;
    this.current.lengte = null;
    this.current.ibw = 0;
    this.current.bmi = 0;
    this.current.bsa = 0;

    // Reset de sub-groepen
    this.current.gas = { fio2: null, pao2: null, paco2: null, sao2: null, hb: null, svo2: null };
    this.current.ademhaling = { rr: null, etco2: null, rcExp: null };
    this.current.picco = { ci: null, svr: null, gedi: null, elwi: null, map: null, gef: null };
    this.current.nier = { creat: null, ureum: null, urine24u: null };

    this.saveToStorage();
  }

  // --- BEREKENINGEN ---

  calculateDerivedValues() {
    if (!this.current.lengte || !this.current.geslacht) return;

    const l = this.current.lengte;
    const isMan = this.current.geslacht === 'M';

    // IBW
    if (l > 0) {
      const base = isMan ? 50 : 45.5;
      this.current.ibw = base + 0.91 * (l - 152.4);
      this.current.ibw = Math.round(this.current.ibw * 10) / 10;
    }

    // BMI
    if (this.current.gewicht && this.current.gewicht > 0 && l > 0) {
      const l_meter = l / 100;
      this.current.bmi = this.current.gewicht / (l_meter * l_meter);
      this.current.bmi = Math.round(this.current.bmi * 10) / 10;
    }

    // BSA (Du Bois)
    if (this.current.gewicht && this.current.gewicht > 0 && l > 0) {
      this.current.bsa = 0.007184 * Math.pow(this.current.gewicht, 0.425) * Math.pow(l, 0.725);
      this.current.bsa = Math.round(this.current.bsa * 100) / 100;
    }
  }

  // Maak alle bedden leeg aan (alleen bij eerste installatie of hard reset)
  resetAllBeds() {
    this.beds = this.bedNames.map(id => ({
      bedId: id,
      naam: '',
      leeftijd: null,
      geslacht: 'M',
      gewicht: null,
      lengte: null,
      ibw: 0,
      bmi: 0,
      bsa: 0,
      gas: { fio2: null, pao2: null, paco2: null, sao2: null, hb: null, svo2: null },
      ademhaling: { rr: null, etco2: null, rcExp: null },
      picco: { ci: null, svr: null, gedi: null, elwi: null, map: null, gef: null },
      nier: { creat: null, ureum: null, urine24u: null }
    }));
  }

  get selectedBedId(): string {
    return this.current ? this.current.bedId : this.bedNames[0];
  }
}
