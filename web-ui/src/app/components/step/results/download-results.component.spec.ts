import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { commonTestBed } from '../../../common-test-bed';
import { DownloadResultsComponent } from './download-results.component';
import { ResultsComponent } from './results.component';

describe('DownloadResultsComponent', () => {
    let component: DownloadResultsComponent;
    let fixture: ComponentFixture<DownloadResultsComponent>;

    beforeEach(waitForAsync(() => {
        const testBed = commonTestBed();
        // It communicates with its parent
        TestBed.overrideComponent(
            DownloadResultsComponent,
            { set: { providers: [{ provide: ResultsComponent, useValue: {} }] } }
        );
        testBed.testingModule.compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DownloadResultsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
