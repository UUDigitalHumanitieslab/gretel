import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiStepPageComponent } from './multi-step-page.component';
import { commonTestBed } from '../../common-test-bed';

xdescribe('MultiStepPageComponent', () => {
    let component: MultiStepPageComponent;
    let fixture: ComponentFixture<MultiStepPageComponent>;

    beforeEach(async(() => {
        commonTestBed().testingModule.compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MultiStepPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
