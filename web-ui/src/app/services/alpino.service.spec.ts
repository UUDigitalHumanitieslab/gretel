import { TestBed, inject } from '@angular/core/testing';

import { AlpinoService } from './alpino.service';

describe('AlpinoService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AlpinoService]
    });
  });

  it('should be created', inject([AlpinoService], (service: AlpinoService) => {
    expect(service).toBeTruthy();
  }));
});
