import { TestBed, inject } from '@angular/core/testing';

import { TreebankService } from './treebank.service';
import { HttpClientMock } from '../mocks/http-client.mock';
import { HttpClient } from '@angular/common/http';
import { commonTestBed } from '../common-test-bed';

describe('TreebankService', () => {
    beforeEach(() => {
        let testBed = commonTestBed();
        testBed.testingModule.compileComponents();
    });

    it('should be created', inject([TreebankService], async (service: TreebankService) => {
        expect(service).toBeTruthy();
        let subTreebanks = await service.getSubTreebanks({ title: 'test-treebank' });
        expect(subTreebanks.length).toEqual(2);
        expect(subTreebanks.map(s => s.databaseId)).toEqual(['test_database1', 'test_database2']);
        expect(subTreebanks.map(s => s.sentenceCount)).toEqual([250, 500]);
    }));
});
