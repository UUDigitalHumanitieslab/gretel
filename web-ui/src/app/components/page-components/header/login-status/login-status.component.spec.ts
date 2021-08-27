import { ComponentFixture, TestBed } from '@angular/core/testing';
import { commonTestBed } from '../../../../common-test-bed';

import { LoginStatusComponent } from './login-status.component';

describe('LoginStatusComponent', () => {
    let component: LoginStatusComponent;
    let fixture: ComponentFixture<LoginStatusComponent>;

    beforeEach(async () => {
        commonTestBed().testingModule.compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LoginStatusComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
