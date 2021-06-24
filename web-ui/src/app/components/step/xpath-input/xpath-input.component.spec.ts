import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { XpathInputComponent } from './xpath-input.component';
import { commonTestBed } from '../../../common-test-bed';

describe('XpathInputComponent', () => {
    let component: XpathInputComponent;
    let fixture: ComponentFixture<XpathInputComponent>;

    beforeEach(waitForAsync(() => {
        commonTestBed().testingModule.compileComponents();
    }));

    beforeEach(async () => {
        fixture = TestBed.createComponent(XpathInputComponent);
        component = fixture.componentInstance;
        component.value = '//node';
        return fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
