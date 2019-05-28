import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DateComponent } from './date.component';
import { filtersTestBed } from '../filters-test-bed';

describe('DateComponent', () => {
    let component: DateComponent;
    let fixture: ComponentFixture<DateComponent>;

    beforeEach(async(() => {
        filtersTestBed().testingModule.compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DateComponent);
        component = fixture.componentInstance;
        component.filter = {
            dataType: 'date',
            field: 'date',
            filterType: 'range',
            minValue: new Date(1987, 1, 27),
            maxValue: new Date(2017, 8, 8),
            options: []
        };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeDefined();
    });
});
