import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectableTable } from './selectable-table.component';
import { commonTestBed } from '../../../common-test-bed';

describe('SelectableTable', () => {
    let component: SelectableTable;
    let fixture: ComponentFixture<SelectableTable>;

    beforeEach(async(() => {
        commonTestBed().testingModule.compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SelectableTable);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
