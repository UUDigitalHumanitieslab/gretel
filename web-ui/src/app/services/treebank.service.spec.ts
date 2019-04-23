import { inject } from '@angular/core/testing';

import { commonTestBed } from '../common-test-bed';
import { TreebankService } from './treebank.service';
import { TreebankComponent, ComponentGroup, FuzzyNumber } from '../treebank';
import { filter, take, flatMap, map } from 'rxjs/operators';
import { doesNotReject } from 'assert';

describe('TreebankService', () => {
    beforeEach(() => {
        const testBed = commonTestBed();
        testBed.testingModule.compileComponents();
    });

    it('should be created', inject([TreebankService], async (service: TreebankService) => {
        expect(service).toBeTruthy();

        // does this await completion of the stream?
        return service.loading
        .pipe(
            filter(loading => !loading),
            flatMap(() => service.treebanks),
            map(banks => banks.state['test-provider']['test-treebank']),
            take(1)
        ).subscribe(info => {
            expect(info.variants).toEqual(['v1', 'v2']);
            expect(info.componentGroups.length).toBe(1);
            expect(info.componentGroups[0].key).toBe('test-group');
            expect(info.componentGroups[0].components).toEqual({
                'v1': 'test-component1',
                'v2': 'test-component2'
            });

            expect(info.components['test-component1']).toEqual({
                description: '',
                disabled: false,
                group: 'test-group',
                id: 'test-component1',
                selected: true,
                sentenceCount: 10,
                title: '',
                variant: 'v1',
                wordCount: 100,
            } as TreebankComponent);

            expect(Object.values(info.components).length).toEqual(2);
            expect(Object.values(info.components).map(s => s.id)).toEqual(['test-component1', 'test-component2']);
            expect(Object.values(info.components).map(s => s.sentenceCount)).toEqual([100, 200]);
        });

    }));
});
