import { APP_BASE_HREF } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ClipboardModule, ClipboardService } from 'ngx-clipboard';

import { declarations, imports, providers } from './app.module';
import { AppRoutingModule } from './app-routing/app-routing.module';
import { routes } from './app-routing/routes';

import { ClipboardServiceMock } from './mocks/clipboard.service.mock';

import { ConfigurationService, UploadedTreebankResponse } from './services/_index';
import { HttpClientMock } from './mocks/http-client.mock';
import { ConfigurationServiceMock } from './services/configuration.service.mock';

export function commonTestBed() {
    const httpClientMock = new HttpClientMock();

    const filteredImports = imports.filter(value => !(value in [AppRoutingModule, ClipboardModule, HttpClientModule]));
    filteredImports.push(
        RouterTestingModule.withRoutes(routes));

    const filteredProviders = providers.filter(provider => provider !== ConfigurationService);
    filteredProviders.push(
        {
            provide: APP_BASE_HREF,
            useValue: '/'
        }, {
            provide: ClipboardService,
            useClass: ClipboardServiceMock
        }, {
            provide: ConfigurationService,
            useValue: new ConfigurationServiceMock()
        }, {
            provide: HttpClient,
            useValue: httpClientMock
        });

    // common mock data
    httpClientMock.setData('get', '/gretel-upload/index.php/api/treebank', () => {
        return [] as UploadedTreebankResponse[];
    });

    httpClientMock.setData('get', '/gretel/api/src/router.php/configured_treebanks', () => {
        return {};
    });

    httpClientMock.setData('post', '/gretel/api/src/router.php/treebank_counts', (body: any) => {
        return { 'TEST_DATABASE1_COMPONENT1': '42' };
    });

    httpClientMock.setData('post', '/gretel/api/src/router.php/results', (body: any) => {
        return false;
    });

    return {
        testingModule: TestBed.configureTestingModule({
            declarations,
            imports: filteredImports,
            providers: filteredProviders
        }),
        httpClientMock
    };
}
