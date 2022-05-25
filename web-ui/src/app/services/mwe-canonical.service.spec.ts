import { TestBed } from '@angular/core/testing';

import { MWECanonicalService } from './mwe-canonical.service';

describe('MWECanonicalService', () => {
  let service: MWECanonicalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MWECanonicalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
