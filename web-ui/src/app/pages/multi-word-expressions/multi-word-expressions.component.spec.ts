import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MultiWordExpressionsComponent } from './multi-word-expressions.component';
import { commonTestBed } from '../../common-test-bed';

describe('MultiWordExpressionsComponent', () => {
    let component: MultiWordExpressionsComponent;
    let fixture: ComponentFixture<MultiWordExpressionsComponent>;

    beforeEach(waitForAsync(() => {
        commonTestBed().testingModule.compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MultiWordExpressionsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
