import { TestBed, inject } from '@angular/core/testing';

import { AlpinoService } from './alpino.service';
import { commonTestBed } from '../common-test-bed';

describe('AlpinoService', () => {
    beforeEach(() => {
        commonTestBed().testingModule.compileComponents();
    });

    it('should be created', inject([AlpinoService], (service: AlpinoService) => {
        expect(service).toBeTruthy();
    }));
});
