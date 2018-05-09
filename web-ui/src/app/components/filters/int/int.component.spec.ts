import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { filtersTestBed } from '../filters-test-bed';
import { IntComponent } from './int.component';

describe('IntComponent', () => {
    let component: IntComponent;
    let fixture: ComponentFixture<IntComponent>;

    beforeEach(async(() => {
        filtersTestBed().testingModule.compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(IntComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
