import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Directive, Input } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { declarations, imports, providers, FiltersModule } from './filters.module';

import { HttpClientMock } from '../../mocks/http-client.mock';

export function filtersTestBed() {
    let httpClientMock = new HttpClientMock();

    let filteredImports = imports.filter(value => !(value in [HttpClientModule]));

    providers.push({
        provide: HttpClient,
        useValue: httpClientMock
    });

    return {
        testingModule: TestBed.configureTestingModule({
            declarations,
            imports: filteredImports,
            providers
        }),
        httpClientMock
    };
}
