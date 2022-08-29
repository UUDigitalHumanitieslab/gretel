import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { commonTestBed } from '../../../common-test-bed';

import { BodyHeaderComponent } from './body-header.component';

describe('BodyHeaderComponent', () => {
    let component: BodyHeaderComponent;
    let fixture: ComponentFixture<BodyHeaderComponent>;

    beforeEach(waitForAsync(() => {
        commonTestBed().testingModule.compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(BodyHeaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
