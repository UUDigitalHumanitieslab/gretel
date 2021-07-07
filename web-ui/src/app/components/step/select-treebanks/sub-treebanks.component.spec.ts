import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SubTreebanksComponent } from './sub-treebanks.component';
import { commonTestBed } from '../../../common-test-bed';
import { ReadyTreebank } from '../../../services/_index';

describe('SubTreebanksComponents', () => {
    let component: SubTreebanksComponent;
    let fixture: ComponentFixture<SubTreebanksComponent>;

    beforeEach(waitForAsync(() => {
        commonTestBed().testingModule.compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SubTreebanksComponent);
        component = fixture.componentInstance;
        component.treebank = new ReadyTreebank({
            multiOption: false,
            displayName: 'test-treebank',
            provider: 'test-provider',
            id: 'test-treebank',
            isPublic: true
        },
            {
                componentGroups: [],
                components: {
                    'test-component': {
                        description: '',
                        disabled: false,
                        id: 'test-component',
                        title: 'test-component',
                        sentenceCount: 0,
                        wordCount: 0
                    }
                },
                variants: undefined,
                metadata: undefined
            });

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
