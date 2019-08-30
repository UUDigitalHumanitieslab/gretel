import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultsComponent } from './results.component';
import { commonTestBed, initStateService } from '../../../common-test-bed';

describe('ResultsComponent', () => {
    let component: ResultsComponent;
    let fixture: ComponentFixture<ResultsComponent>;

    beforeEach(async(() => {
        const testBed = commonTestBed();
        testBed.testingModule.compileComponents();
    }));

    beforeEach(() => {
        initStateService();

        fixture = TestBed.createComponent(ResultsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
