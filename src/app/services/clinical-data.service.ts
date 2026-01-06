import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * ClinicalDataService provides shared state management for clinical values
 * that are used across multiple tabs/components in the application.
 * 
 * This service uses RxJS BehaviorSubjects to enable reactive updates,
 * ensuring that when a value is updated in one tab, all subscribed
 * components are notified and can update their displays accordingly.
 */
@Injectable({
  providedIn: 'root'
})
export class ClinicalDataService {

  // Private BehaviorSubjects to hold the state
  private paCO2Subject = new BehaviorSubject<number | null>(null);
  private etCO2Subject = new BehaviorSubject<number | null>(null);

  // Public observables for components to subscribe to
  public paCO2$: Observable<number | null> = this.paCO2Subject.asObservable();
  public etCO2$: Observable<number | null> = this.etCO2Subject.asObservable();

  constructor() { }

  /**
   * Get the current PaCO2 value (synchronous)
   */
  getPaCO2(): number | null {
    return this.paCO2Subject.value;
  }

  /**
   * Set the PaCO2 value
   * This will notify all subscribers
   */
  setPaCO2(value: number | null): void {
    this.paCO2Subject.next(value);
  }

  /**
   * Get the current EtCO2 value (synchronous)
   */
  getEtCO2(): number | null {
    return this.etCO2Subject.value;
  }

  /**
   * Set the EtCO2 value
   * This will notify all subscribers
   */
  setEtCO2(value: number | null): void {
    this.etCO2Subject.next(value);
  }

  /**
   * Reset all values to null
   * Useful when clearing patient data
   */
  reset(): void {
    this.paCO2Subject.next(null);
    this.etCO2Subject.next(null);
  }
}
