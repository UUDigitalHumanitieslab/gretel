import { TestBed, inject } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';

import { AlpinoService } from './alpino.service';
import { HttpClientMock } from './http-client.mock';
import { commonTestBed } from '../common-test-bed';

describe('AlpinoService', () => {
    beforeEach(() => {
        commonTestBed().testingModule.compileComponents();
    });

    it('should be created', inject([AlpinoService], (service: AlpinoService) => {
        expect(service).toBeTruthy();
    }));
});
