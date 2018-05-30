import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SentenceInputComponent } from './sentence-input.component';
import { commonTestBed } from '../../../common-test-bed';

describe('SentenceInputStepComponent', () => {
    let component: SentenceInputComponent;
    let fixture: ComponentFixture<SentenceInputComponent>;

    beforeEach(async(() => {
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
