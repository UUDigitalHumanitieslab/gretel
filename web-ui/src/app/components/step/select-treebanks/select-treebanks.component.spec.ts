import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectTreebanksComponent } from './select-treebanks.component';
import { commonTestBed } from '../../../common-test-bed';

describe('SelectTreebanksComponent', () => {
    let component: SelectTreebanksComponent;
    let fixture: ComponentFixture<SelectTreebanksComponent>;

    beforeEach(async(() => {
        commonTestBed().testingModule.compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SelectTreebanksComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
