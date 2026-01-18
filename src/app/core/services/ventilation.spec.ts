import { TestBed } from '@angular/core/testing';

import { VentilationService } from './ventilation';

describe('VentilationService', () => {
  let service: VentilationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VentilationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
