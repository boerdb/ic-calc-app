import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CalculatorService {

  // CONSTANTEN
  private readonly PB = 101.3;
  private readonly PH2O = 6.3;

  constructor() { }

  // ==========================================
  // 1. OXYGENATIE FORMULES
  // ==========================================

  calcPAO2(fiO2_percent: number, paCO2: number): number {
    const fiO2 = fiO2_percent / 100;
    return (this.PB - this.PH2O) * fiO2 - (paCO2 / 0.8);
  }

  calcAaGradient(PAO2: number, PaO2: number): number {
    return PAO2 - PaO2;
  }

  calcAaRatio(PaO2: number, PAO2: number): number {
    if (PAO2 === 0) return 0;
    return PaO2 / PAO2;
  }

  calcCaO2(Hb: number, SaO2_percent: number, PaO2: number): number {
    const SaO2 = SaO2_percent / 100;
    const dissolvedFactor = 0.0225;
    return (Hb * 1.34 * SaO2) + (PaO2 * dissolvedFactor);
  }

  calcFiO2Nasal(liters: number): number {
    return 20 + (4 * liters);
  }

  // ==========================================
  // 2. VENTILATIE MECHANICA
  // ==========================================

  calcStaticCompliance(Vt: number, Pplat: number, PEEP: number): number {
    const driving = Pplat - PEEP;
    if (driving <= 0) return 0;
    return Vt / driving;
  }

  calcDynamicCompliance(Vt: number, Ppeak: number, PEEP: number): number {
    const driving = Ppeak - PEEP;
    if (driving <= 0) return 0;
    return Vt / driving;
  }

  calcVdVt(PaCO2: number, PeCO2: number): number {
    if (PaCO2 === 0) return 0;
    return (PaCO2 - PeCO2) / PaCO2;
  }

  /**
   * Tijdconstante (RC)
   * Formule: Compliance (L) * Weerstand
   * Omdat C meestal in ml is, delen we door 1000.
   */
  calcTimeConstant(compliance_ml: number, resistance: number): number {
    return (compliance_ml / 1000) * resistance;
  }

  // ==========================================
  // 3. METABOOL / NIEREN
  // ==========================================

  calcAnionGap(Na: number, Cl: number, HCO3: number): number {
    return Na - (Cl + HCO3);
  }

  // ==========================================
  // 4. HEMODYNAMIEK
  // ==========================================

  calcCI(CO: number, BSA: number): number {
    if (BSA === 0) return 0;
    return CO / BSA;
  }

  calcSVR(MAP: number, CVP: number, CO: number): number {
    if (CO === 0) return 0;
    return ((MAP - CVP) * 80) / CO;
  }

  calcSVRI(SVR: number, BSA: number): number {
    return SVR * BSA;
  }

  // ==========================================
  // 5. MEDICATIE / POMPEN
  // ==========================================

  calcPumpFlow(dosis: number, gewicht: number, concentratie_mcg_ml: number): number {
    if (concentratie_mcg_ml === 0) return 0;
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
    const drivingP = ppeak - peep;
    const pocc = pnadir - peep;
    const occComponent = (2 / 3) * pocc;
    return drivingP - occComponent;
  }
}
