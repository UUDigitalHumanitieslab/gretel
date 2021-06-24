import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BreadcrumbBarComponent } from './breadcrumb-bar.component';
import { commonTestBed } from '../../common-test-bed';

describe('BreadcrumbBarComponent', () => {
    let component: BreadcrumbBarComponent;
    let fixture: ComponentFixture<BreadcrumbBarComponent>;

    beforeEach(waitForAsync(() => {
        commonTestBed().testingModule.compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(BreadcrumbBarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
