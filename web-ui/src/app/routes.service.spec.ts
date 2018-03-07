import { TestBed, inject } from '@angular/core/testing';

import { RoutesService } from './routes.service';

describe('RoutesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RoutesService]
    });
  });

  it('should be created', inject([RoutesService], (service: RoutesService) => {
    expect(service).toBeTruthy();
  }));
});
