import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterNavigationComponent } from './footer-navigation.component';
import { commonTestBed } from '../../../../common-test-bed';

describe('FooterNavigationComponent', () => {
    let component: FooterNavigationComponent;
    let fixture: ComponentFixture<FooterNavigationComponent>;

    beforeEach(async(() => {
        commonTestBed().testingModule.compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FooterNavigationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
