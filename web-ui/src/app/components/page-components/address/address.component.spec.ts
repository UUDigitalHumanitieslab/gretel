import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { commonTestBed } from '../../../common-test-bed';

import { AddressComponent } from './address.component';

describe('AddressComponent', () => {
    let component: AddressComponent;
    let fixture: ComponentFixture<AddressComponent>;

    beforeEach(waitForAsync(() => {
        commonTestBed().testingModule.compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AddressComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
