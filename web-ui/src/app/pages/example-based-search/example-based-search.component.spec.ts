import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExampleBasedSearchComponent } from './example-based-search.component';
import { commonTestBed } from '../../common-test-bed';

describe('ExampleBasedSearchComponent', () => {
    let component: ExampleBasedSearchComponent;
    let fixture: ComponentFixture<ExampleBasedSearchComponent>;

    beforeEach(async(() => {
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
