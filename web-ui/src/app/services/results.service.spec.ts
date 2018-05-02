import { TestBed, inject } from '@angular/core/testing';

import { ResultsService } from './results.service';

describe('DataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ResultsService]
    });
  });

  it('should be created', inject([ResultsService], (service: ResultsService) => {
    expect(service).toBeTruthy();
  }));
});
