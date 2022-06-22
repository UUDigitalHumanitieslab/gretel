import { TestBed } from '@angular/core/testing';

import { MweQueryMakerService } from './mwe-query-maker.service';

describe('MweQueryMakerService', () => {
    let service: MweQueryMakerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MweQueryMakerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
