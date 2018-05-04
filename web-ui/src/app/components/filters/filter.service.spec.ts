import { TestBed, inject } from '@angular/core/testing';

import { filtersTestBed } from './filters-test-bed';
import { FilterService } from './filter.service';

describe('FilterService', () => {
    beforeEach(() => {
        filtersTestBed();
    });

    it('should be created', inject([FilterService], (service: FilterService) => {
        expect(service).toBeTruthy();
    }));
});
