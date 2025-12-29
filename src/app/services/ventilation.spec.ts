import { TestBed } from '@angular/core/testing';

import { Ventilation } from './ventilation';

describe('Ventilation', () => {
  let service: Ventilation;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Ventilation);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
