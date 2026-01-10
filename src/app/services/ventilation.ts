import { Injectable } from '@angular/core'; // <--- DEZE IS CRUCIAAL

export interface LungProfile {
  type: string;
  tExpRequired: number;
  description: string;
  color: string;
  imageTag: string;
}

// ZONDER DIT BLOKJE HIERONDER WERKT HET NIET:
@Injectable({
  providedIn: 'root'
})
export class VentilationService {  // <--- Zorg dat er 'export class' staat

  // De werkafspraken
  public readonly WERK_AFSPRAKEN = [
    { id: 1, text: 'Alle instellingen op automatisch', checked: false },
    { id: 2, text: 'PEEP limiet op 12', checked: false },
    { id: 3, text: 'Geen ziektebeelden aan', checked: false },
    { id: 4, text: 'ASV limiet max 30', checked: false },
    { id: 5, text: 'Vooraf nooit beademen op de testballon', checked: false }
  ];

  getProfileByRCexp(rcExp: number): LungProfile {
    const tExp = rcExp * 3;

    if (rcExp < 0.6) {
      return {
        type: 'Restrictief (ARDS)',
        tExpRequired: tExp,
        description: 'Stugge longen, snelle uitademing.',
        color: 'secondary',
        imageTag: 'restrictive'
      };
    } else if (rcExp > 0.9) {
      return {
        type: 'Obstructief (COPD)',
        tExpRequired: tExp,
        description: 'Hoge weerstand, trage uitademing.',
        color: 'warning',
        imageTag: 'obstructive'
      };
    } else {
      return {
        type: 'Normaal',
        tExpRequired: tExp,
        description: 'Normale longmechanica.',
        color: 'success',
        imageTag: 'normal'
      };
    }
  }

  calculateOtisFrequency(rcExp: number): number {
    const a = 0.33;
    const minVol = 8000;
    const vd = 150;

    const factor = a * rcExp;
    const numerator = Math.sqrt(1 + 2 * factor * (minVol / vd)) - 1;
    const frequency = numerator / factor;

    return Math.round(frequency);
  }
}
