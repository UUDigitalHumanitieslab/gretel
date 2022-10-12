import { ComponentFixture, TestBed } from '@angular/core/testing';
import { commonTestBed, initStateService } from '../../../common-test-bed';

import { MweResultsComponent } from './mwe-results.component';

describe('MweResultsComponent', () => {
    let component: MweResultsComponent;
    let fixture: ComponentFixture<MweResultsComponent>;

    beforeEach(async () => {
        commonTestBed().testingModule.compileComponents();
    });

    beforeEach(() => {
        initStateService();

        fixture = TestBed.createComponent(MweResultsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
