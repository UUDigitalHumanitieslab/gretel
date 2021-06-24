import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SentenceInputComponent } from './sentence-input.component';
import { commonTestBed } from '../../../common-test-bed';

describe('SentenceInputStepDirective', () => {
    let component: SentenceInputComponent;
    let fixture: ComponentFixture<SentenceInputComponent>;

    beforeEach(waitForAsync(() => {
        commonTestBed().testingModule.compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SentenceInputComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
