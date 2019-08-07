import { inject } from '@angular/core/testing';

import { commonTestBed } from '../common-test-bed';
import { TreebankService } from './treebank.service';
import { TreebankComponent } from '../treebank';

describe('TreebankService', () => {
    beforeEach(() => {
        const testBed = commonTestBed();
        testBed.testingModule.compileComponents();
    });

    it('should be created', inject([TreebankService], async (service: TreebankService) => {
        expect(service).toBeTruthy();

        const info = (await service.getTreebanks()).data['test-provider']['test-treebank'];

        const [components, componentGroups, variants] = await Promise.all([
            info.details.components(),
            info.details.componentGroups(),
            info.details.variants()]);

        expect(variants).toEqual(['v1', 'v2']);
        expect(componentGroups.length).toBe(1);
        expect(componentGroups[0].key).toBe('test-group');
        expect(componentGroups[0].components).toEqual({
            'v1': 'test-component1',
            'v2': 'test-component2'
        });

        expect(components['test-component1']).toEqual({
            description: '',
            disabled: false,
            group: 'test-group',
            id: 'test-component1',
            sentenceCount: 10,
            title: '',
            variant: 'v1',
            wordCount: 100,
        } as TreebankComponent);

        expect(Object.values(components).length).toEqual(2);
        expect(Object.values(components).map(s => s.id)).toEqual(['test-component1', 'test-component2']);
        expect(Object.values(components).map(s => s.wordCount)).toEqual([100, 200]);
    }));
});
