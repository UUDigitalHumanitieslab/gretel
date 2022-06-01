import { TestBed } from '@angular/core/testing';

import { MWEQueryMakerService } from './mwe-query-maker.service';

describe('MWEQueryMakerService', () => {
    let service: MWEQueryMakerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MWEQueryMakerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should translate queries to dummy xpath', () => {
        let query = service.translate('placeholder expression').queries[0];
        expect(query.xpath).toEqual('//node');
    });
});
