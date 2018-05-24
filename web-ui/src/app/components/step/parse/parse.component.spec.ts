import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ParseComponent } from './parse.component';
import { commonTestBed } from '../../../common-test-bed';

describe('ParseComponent', () => {
    let component: ParseComponent;
    let fixture: ComponentFixture<ParseComponent>;

    beforeEach(async(() => {
        commonTestBed().testingModule.compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ParseComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
