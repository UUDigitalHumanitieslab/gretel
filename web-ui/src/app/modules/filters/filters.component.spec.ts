import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { filtersTestBed } from './filters-test-bed';
import { FiltersComponent } from './filters.component';

describe('FiltersComponent', () => {
    let component: FiltersComponent;
    let fixture: ComponentFixture<FiltersComponent>;

    beforeEach(async(() => {
        filtersTestBed().testingModule.compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FiltersComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
