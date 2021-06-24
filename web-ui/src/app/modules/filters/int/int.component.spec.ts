import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { filtersTestBed } from '../filters-test-bed';
import { IntComponent } from './int.component';

describe('IntComponent', () => {
    let component: IntComponent;
    let fixture: ComponentFixture<IntComponent>;

    beforeEach(waitForAsync(() => {
        filtersTestBed().testingModule.compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(IntComponent);
        component = fixture.componentInstance;
        component.filter = {
            dataType: 'int',
            field: 'range',
            filterType: 'range',
            minValue: -42,
            maxValue: 42,
            options: []
        };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
