import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { XpathSearchComponent } from './xpath-search.component';
import { commonTestBed } from '../../common-test-bed';

describe('XpathSearchComponent', () => {
    let component: XpathSearchComponent;
    let fixture: ComponentFixture<XpathSearchComponent>;

    beforeEach(waitForAsync(() => {
        commonTestBed().testingModule.compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(XpathSearchComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
