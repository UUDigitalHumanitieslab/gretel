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
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
