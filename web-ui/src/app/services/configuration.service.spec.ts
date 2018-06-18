import { TestBed, inject } from '@angular/core/testing';

import { ConfigurationService } from './configuration.service';
import { commonTestBed } from '../common-test-bed';

describe('ConfigurationService', () => {
    beforeEach(() => {
        let testBed = commonTestBed();
        testBed.testingModule.compileComponents();
    });

    it('should be created', inject([ConfigurationService], (service: ConfigurationService) => {
        expect(service).toBeTruthy();
    }));
});
