import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ExampleBasedSearchComponent } from './example-based-search.component';
import { commonTestBed } from '../../common-test-bed';

describe('ExampleBasedSearchComponent', () => {
    let component: ExampleBasedSearchComponent;
    let fixture: ComponentFixture<ExampleBasedSearchComponent>;

    beforeEach(waitForAsync(() => {
        commonTestBed().testingModule.compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ExampleBasedSearchComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
