import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { XpathSearchComponent } from './xpath-search.component';
import { commonTestBed } from '../../common-test-bed';

describe('XpathSearchComponent', () => {
    let component: XpathSearchComponent;
    let fixture: ComponentFixture<XpathSearchComponent>;

    beforeEach(async(() => {
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
