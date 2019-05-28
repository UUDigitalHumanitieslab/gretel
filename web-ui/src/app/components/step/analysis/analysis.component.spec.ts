import { ComponentFixture, TestBed } from '@angular/core/testing';
import { commonTestBed } from '../../../common-test-bed';
import { AnalysisComponent } from './analysis.component';

describe('Analysis component', () => {
    let component: AnalysisComponent;
    let fixture: ComponentFixture<AnalysisComponent>;

    beforeEach(async() => {
        await commonTestBed().testingModule.compileComponents();
        fixture = TestBed.createComponent(AnalysisComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
