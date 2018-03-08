import { TestBed, inject } from '@angular/core/testing';

import { XPathSearchService } from './x-path-search.service';

describe('XPathSearchService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [XPathSearchService]
    });
  });

  it('should be created', inject([XPathSearchService], (service: XPathSearchService) => {
    expect(service).toBeTruthy();
  }));
});
