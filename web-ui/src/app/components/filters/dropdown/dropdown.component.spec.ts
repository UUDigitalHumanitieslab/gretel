import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { filtersTestBed } from '../filters-test-bed';
import { DropdownComponent } from './dropdown.component';

describe('DropdownComponent', () => {
    let component: DropdownComponent;
    let fixture: ComponentFixture<DropdownComponent>;

    beforeEach(async(() => {
        filtersTestBed().testingModule.compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DropdownComponent);
        component = fixture.componentInstance;
        component.filter = {
            dataType: 'text',
            field: 'dropdown',
            filterType: 'dropdown',
            options: ['A', 'B', 'C']
        };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
