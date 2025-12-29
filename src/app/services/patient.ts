import { Injectable } from '@angular/core';

export interface BedData {
  bedId: string;
  naam: string;
  leeftijd: number | null;
  geslacht: string;
  gewicht: number | null;
  lengte: number | null;

  // Berekende waarden
  ibw?: number;
  bmi?: number;
  bsa?: number;

  // PiCCO data
  picco?: {
    ci: number | null;
    svr: number | null;
    gedi?: number | null;
    elwi?: number | null;
    map?: number | null;
    gef?: number | null;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PatientService {

  // DEZE LIJST BEPAALT DE BEDNUMMERS:
  private bedNames = ['1-1', '1-2', '1-3', '1-4', '2-1', '2-2', '3-1', '3-2', '4-1', '4-2', '5', '6', '7', '8'];

  // Hier maken we de bedden aan op basis van bovenstaande lijst
  beds: BedData[] = this.bedNames.map(id => ({
    bedId: id,
    naam: '',
    leeftijd: null,
    geslacht: 'M',
    gewicht: null,
    lengte: null,
    ibw: 0,
    bmi: 0,
    bsa: 0,
    picco: { ci: null, svr: null, gedi: null, elwi: null, map: null }
  }));

  // Huidige selectie (standaard het eerste bed: 1-1)
  current: BedData = this.beds[0];

  constructor() { }

  selectBed(id: string) {
    const found = this.beds.find(b => b.bedId === id);
    if (found) {
      this.current = found;
      // Safety check voor picco object
      if (!this.current.picco) {
        this.current.picco = { ci: null, svr: null, gedi: null, elwi: null, map: null };
      }
    }
  }

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

  opslaan() {
    this.calculateDerivedValues();
    // Hier zou je eventueel data naar een echte database sturen later
  }

  bedLeegmaken() {
    this.current.naam = '';
    this.current.leeftijd = null;
    this.current.geslacht = 'M';
    this.current.gewicht = null;
    this.current.lengte = null;
    this.current.ibw = 0;
    this.current.bmi = 0;
    this.current.bsa = 0;
    this.current.picco = { ci: null, svr: null, gedi: null, elwi: null, map: null };
  }

  get selectedBedId(): string {
    return this.current.bedId;
  }
}
