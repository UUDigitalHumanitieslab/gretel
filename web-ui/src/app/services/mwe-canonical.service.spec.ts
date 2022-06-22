import { TestBed } from '@angular/core/testing';

import { MweCanonicalService } from './mwe-canonical.service';

describe('MweCanonicalService', () => {
  let service: MweCanonicalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MweCanonicalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
