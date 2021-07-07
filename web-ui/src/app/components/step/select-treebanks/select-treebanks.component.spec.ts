import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SelectTreebanksComponent } from './select-treebanks.component';
import { commonTestBed } from '../../../common-test-bed';

describe('SelectTreebanksComponent', () => {
    let component: SelectTreebanksComponent;
    let fixture: ComponentFixture<SelectTreebanksComponent>;

    beforeEach(waitForAsync(() => {
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
