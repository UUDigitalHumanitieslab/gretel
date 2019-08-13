import { TestBed, inject } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';

import { Location, ExtractinatorService } from 'lassy-xpath/ng';

import { ResultsService } from './results.service';
import { HttpClientMock } from '../mocks/http-client.mock';
import { DomSanitizer } from '@angular/platform-browser';
import { ConfigurationService, ParseService } from './_index';
import { ConfigurationServiceMock } from './configuration.service.mock';

describe('ResultsService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                ResultsService,
                { provide: HttpClient, useValue: new HttpClientMock() },
                DomSanitizer,
                { provide: ConfigurationService, useValue: new ConfigurationServiceMock },
                ParseService,
                ExtractinatorService
            ]
        });
    });

    it('should be created', inject([ResultsService], (service: ResultsService) => {
        expect(service).toBeTruthy();
    }));

    it('create filtered query', inject([ResultsService], (service: ResultsService) => {
        const modified = service.createFilteredQuery(`//node[@cat="smain"
        and node[@rel="su" and @pt="vnw"]
        and node[@rel="hd" and @pt="ww"]
        and node[@rel="predc" and @cat="np"
            and node[@rel="det" and @pt="lid"]
            and node[@rel="hd" and @pt="n"]]]
`, [{
                type: 'xpath',
                location: new Location(3, 12, 16),
                contextXpath: 'should be ignored',
                attributeXpath: '[@test="test"]',
                field: 'test.test',
                label: 'test'
            }]);
        expect(modified).toEqual(`//node[@cat="smain"
        and node[@rel="su" and @pt="vnw"]
        and node[@test="test"][@rel="hd" and @pt="ww"]
        and node[@rel="predc" and @cat="np"
            and node[@rel="det" and @pt="lid"]
            and node[@rel="hd" and @pt="n"]]]`);
    }));
});
