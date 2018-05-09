import { TestBed, inject } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';

import { ResultsService } from './results.service';
import { HttpClientMock } from '../mocks/http-client.mock';
import { DomSanitizer } from '@angular/platform-browser';
import { ConfigurationService, XmlParseService } from './_index';
import { ConfigurationServiceMock } from './configuration.service.mock';

describe('ResultsService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                ResultsService,
                { provide: HttpClient, useValue: new HttpClientMock() },
                DomSanitizer,
                { provide: ConfigurationService, useValue: new ConfigurationServiceMock },
                XmlParseService
            ]
        });
    });

    it('should be created', inject([ResultsService], (service: ResultsService) => {
        expect(service).toBeTruthy();
    }));
});
