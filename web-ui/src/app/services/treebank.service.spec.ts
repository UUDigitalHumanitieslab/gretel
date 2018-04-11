import { TestBed, inject } from '@angular/core/testing';

import { TreebankService } from './treebank.service';

describe('TreebankService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TreebankService]
    });
  });

  it('should be created', inject([TreebankService], (service: TreebankService) => {
    expect(service).toBeTruthy();
  }));
});
