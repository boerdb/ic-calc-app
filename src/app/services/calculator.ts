import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CalculatorService {

  // CONSTANTEN
  private readonly PB = 101.3; // Barometric pressure (kPa)
  private readonly PH2O = 6.3; // Water vapor pressure (kPa)
  private readonly RESPIRATORY_QUOTIENT = 0.8; // Standard RQ
  private readonly OXYGEN_CARRYING_CAPACITY = 1.34; // Hb oxygen binding (mL O2/g Hb)
  private readonly OXYGEN_DISSOLVED_FACTOR = 0.0225; // O2 dissolved in plasma
  private readonly NASAL_FIO2_BASE = 20; // Base FiO2 for room air (%)
  private readonly NASAL_FIO2_INCREMENT = 4; // FiO2 increase per liter/min

  constructor() { }

  // ==========================================
  // 1. OXYGENATIE FORMULES
  // ==========================================

  calcPAO2(fiO2_percent: number, paCO2: number): number {
    if (fiO2_percent <= 0 || fiO2_percent > 100 || paCO2 < 0) return 0;
    const fiO2 = fiO2_percent / 100;
    return (this.PB - this.PH2O) * fiO2 - (paCO2 / this.RESPIRATORY_QUOTIENT);
  }

  calcAaGradient(PAO2: number, PaO2: number): number {
    if (PAO2 < 0 || PaO2 < 0) return 0;
    return PAO2 - PaO2;
  }

  calcAaRatio(PaO2: number, PAO2: number): number {
    if (PAO2 === 0 || PaO2 < 0 || PAO2 < 0) return 0;
    return PaO2 / PAO2;
  }

  calcCaO2(Hb: number, SaO2_percent: number, PaO2: number): number {
    if (Hb <= 0 || SaO2_percent < 0 || SaO2_percent > 100 || PaO2 < 0) return 0;
    const SaO2 = SaO2_percent / 100;
    return (Hb * this.OXYGEN_CARRYING_CAPACITY * SaO2) + (PaO2 * this.OXYGEN_DISSOLVED_FACTOR);
  }

  calcFiO2Nasal(liters: number): number {
    if (liters < 0) return this.NASAL_FIO2_BASE;
    return this.NASAL_FIO2_BASE + (this.NASAL_FIO2_INCREMENT * liters);
  }

  // ==========================================
  // 2. VENTILATIE MECHANICA
  // ==========================================

  calcStaticCompliance(Vt: number, Pplat: number, PEEP: number): number {
    if (Vt <= 0 || Pplat < 0 || PEEP < 0) return 0;
    const driving = Pplat - PEEP;
    if (driving <= 0) return 0;
    return Vt / driving;
  }

  calcDynamicCompliance(Vt: number, Ppeak: number, PEEP: number): number {
    if (Vt <= 0 || Ppeak < 0 || PEEP < 0) return 0;
    const driving = Ppeak - PEEP;
    if (driving <= 0) return 0;
    return Vt / driving;
  }

  calcVdVt(PaCO2: number, PeCO2: number): number {
    if (PaCO2 === 0 || PaCO2 < 0 || PeCO2 < 0) return 0;
    return (PaCO2 - PeCO2) / PaCO2;
  }

  /**
   * Tijdconstante (RC)
   * Formule: Compliance (L) * Weerstand
   * Omdat C meestal in ml is, delen we door 1000.
   */
  calcTimeConstant(compliance_ml: number, resistance: number): number {
    if (compliance_ml <= 0 || resistance < 0) return 0;
    return (compliance_ml / 1000) * resistance;
  }

  // ==========================================
  // 3. METABOOL / NIEREN
  // ==========================================

  calcAnionGap(Na: number, Cl: number, HCO3: number): number {
    if (Na < 0 || Cl < 0 || HCO3 < 0) return 0;
    return Na - (Cl + HCO3);
  }

  // ==========================================
  // 4. HEMODYNAMIEK
  // ==========================================

  calcCI(CO: number, BSA: number): number {
    if (BSA === 0 || CO < 0 || BSA < 0) return 0;
    return CO / BSA;
  }

  calcSVR(MAP: number, CVP: number, CO: number): number {
    if (CO === 0 || MAP < 0 || CVP < 0 || CO < 0) return 0;
    return ((MAP - CVP) * 80) / CO;
  }

  calcSVRI(SVR: number, BSA: number): number {
    if (SVR < 0 || BSA < 0) return 0;
    return SVR * BSA;
  }

  // ==========================================
  // 5. MEDICATIE / POMPEN
  // ==========================================

  calcPumpFlow(dosis: number, gewicht: number, concentratie_mcg_ml: number): number {
    if (concentratie_mcg_ml === 0 || dosis < 0 || gewicht <= 0 || concentratie_mcg_ml < 0) return 0;
    return (dosis * gewicht * 60) / concentratie_mcg_ml;
  }
// ==========================================
  // 6. VENTICALC & POWER (JOUW SPECIFIEKE FORMULES)
  // ==========================================

  /**
   * Mechanical Power (Gattinoni)
   * Formule: 0.098 * RR * Vt(L) * (Ppeak - 0.5 * DP)
   */
  calcMechanicalPower(vt_ml: number, rr: number, ppeak: number, pplat: number, peep: number): number {
    if (vt_ml <= 0 || rr <= 0 || ppeak < 0 || pplat < 0 || peep < 0) return 0;
    const vt_l = vt_ml / 1000;
    const dp = pplat - peep;
    const drukComp = ppeak - (0.5 * dp);
    return 0.098 * rr * vt_l * drukComp;
  }

  /**
   * Pmus (Spierkracht voorspelling)
   * Formule: -0.75 * (Pnadir - PEEP)
   */
  calcPmus(pnadir: number, peep: number): number {
    const pocc = pnadir - peep; // Delta Pocc
    return -0.75 * pocc;
  }

  /**
   * Ptp (Transpulmonale druk voorspelling)
   * Formule: (Ppeak - PEEP) - (2/3 * Pocc)
   */
  calcPtp(ppeak: number, peep: number, pnadir: number): number {
    if (ppeak < 0 || peep < 0) return 0;
    const drivingP = ppeak - peep;
    const pocc = pnadir - peep;
    const occComponent = (2 / 3) * pocc;
    return drivingP - occComponent;
  }
}
