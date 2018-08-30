import { APP_BASE_HREF } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Directive, Input } from '@angular/core';
import { TestModuleMetadata, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { ClipboardModule, ClipboardService } from 'ngx-clipboard';

import { declarations, imports, providers, AppModule } from './app.module';
import { AppRoutingModule } from './app-routing/app-routing.module';
import { routes } from './app-routing/routes';

import { ClipboardServiceMock } from './mocks/clipboard.service.mock';

import { ConfigurationService } from './services/_index';
import { HttpClientMock } from './mocks/http-client.mock';
import { ConfigurationServiceMock } from './services/configuration.service.mock';

export function commonTestBed() {
    let httpClientMock = new HttpClientMock();

    let filteredImports = imports.filter(value => !(value in [AppRoutingModule, ClipboardModule, HttpClientModule]));
    filteredImports.push(
        RouterTestingModule.withRoutes(routes));

    let filteredProviders = providers.filter(provider => provider != ConfigurationService);
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
    httpClientMock.setData('get', '/gretel/api/src/router.php/configured_treebanks', () => {
        return {}
    });
    httpClientMock.setData('get', '/gretel-upload/index.php/api/treebank',
        [{
            "id": "42",
            "title": "test-treebank",
            "user_id": "24",
            "email": "test@test.nl",
            "uploaded": "2017-09-01 14:18:41",
            "processed": "2017-09-01 14:21:32",
            "public": "1"
        }]);

    httpClientMock.setData('get', '/gretel-upload/index.php/api/treebank/metadata/test-treebank',
        [{
            id: 'test_database1',
            treebank_id: 'test_database1',
            field: 'test_field1',
            type: 'text',
            facet: 'checkbox',
            min_value: null,
            max_value: null,
            show: '1'
        }]);

    httpClientMock.setData('get', '/gretel-upload/index.php/api/treebank/show/test-treebank', [{
        basex_db: 'test_database1',
        nr_sentences: '250',
        nr_words: '500',
        slug: 'TestSlug1',
        title: 'TestTitle1'
    }, {
        basex_db: 'test_database2',
        nr_sentences: '500',
        nr_words: '750',
        slug: 'TestSlug2',
        title: 'TestTitle2'
    }]);

    httpClientMock.setData('post', '/gretel/api/src/router.php/treebank_counts', (body) => {
        return { 'TEST_DATABASE1_COMPONENT1': '42' }
    });

    httpClientMock.setData('post', '/gretel/api/src/router.php/results', (body) => {
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
