import { inject } from '@angular/core/testing';

import { commonTestBed } from '../common-test-bed';
import { TreebankService } from './treebank.service';

describe('TreebankService', () => {
    beforeEach(() => {
        let testBed = commonTestBed();
        testBed.testingModule.compileComponents();
    });

    it('should be created', inject([TreebankService], async (service: TreebankService) => {
        expect(service).toBeTruthy();
        let subTreebanks = (await service.getComponentGroups('test-treebank'))
            .groups
            .reduce((banks, group) => banks.concat(Object.values(group.components)), []);
        expect(subTreebanks.length).toEqual(2);
        expect(subTreebanks.map(s => s.databaseId)).toEqual(['test_database1', 'test_database2']);
        expect(subTreebanks.map(s => s.sentenceCount)).toEqual([250, 500]);
    }));
});
