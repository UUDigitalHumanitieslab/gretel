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
            name: 'test-treebank',
            provider: 'test-provider',
            selected: true
        };
        component.componentGroups = [];
        component.variants = [];
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
