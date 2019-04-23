import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubTreebanksComponent } from './sub-treebanks.component';
import { commonTestBed } from '../../../common-test-bed';

describe('SubTreebanksComponents', () => {
    let component: SubTreebanksComponent;
    let fixture: ComponentFixture<SubTreebanksComponent>;

    beforeEach(async(() => {
        commonTestBed().testingModule.compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SubTreebanksComponent);
        component = fixture.componentInstance;
        component.treebank = {
            multiOption: false,
            displayName: 'test-treebank',
            provider: 'test-provider',
            selected: true,
            id: 'test-treebank',
            isPublic: true
        };
        component.componentGroups = undefined;
        component.variants = undefined;
        component.components = {
            'test-component': {
               description: '',
                disabled: false,
                id: 'test-component',
                selected: true,
                title: 'test-component',
                sentenceCount: 0,
                wordCount: 0
            }
        };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
