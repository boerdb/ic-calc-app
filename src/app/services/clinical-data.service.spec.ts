import { TestBed } from '@angular/core/testing';
import { ClinicalDataService } from './clinical-data.service';

describe('ClinicalDataService', () => {
  let service: ClinicalDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClinicalDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with null values', () => {
    expect(service.getPaCO2()).toBeNull();
    expect(service.getEtCO2()).toBeNull();
  });

  it('should set and get PaCO2 value', () => {
    service.setPaCO2(5.5);
    expect(service.getPaCO2()).toBe(5.5);
  });

  it('should set and get EtCO2 value', () => {
    service.setEtCO2(4.8);
    expect(service.getEtCO2()).toBe(4.8);
  });

  it('should emit PaCO2 changes to subscribers', (done) => {
    service.paCO2$.subscribe(value => {
      if (value === 6.2) {
        expect(value).toBe(6.2);
        done();
      }
    });
    service.setPaCO2(6.2);
  });

  it('should emit EtCO2 changes to subscribers', (done) => {
    service.etCO2$.subscribe(value => {
      if (value === 5.1) {
        expect(value).toBe(5.1);
        done();
      }
    });
    service.setEtCO2(5.1);
  });

  it('should reset all values to null', () => {
    service.setPaCO2(5.5);
    service.setEtCO2(4.8);
    
    service.reset();
    
    expect(service.getPaCO2()).toBeNull();
    expect(service.getEtCO2()).toBeNull();
  });

  it('should allow setting null values', () => {
    service.setPaCO2(5.5);
    service.setPaCO2(null);
    expect(service.getPaCO2()).toBeNull();
    
    service.setEtCO2(4.8);
    service.setEtCO2(null);
    expect(service.getEtCO2()).toBeNull();
  });
});
