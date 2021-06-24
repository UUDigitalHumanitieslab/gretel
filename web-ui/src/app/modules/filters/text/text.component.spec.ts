import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { filtersTestBed } from '../filters-test-bed';
import { TextComponent } from './text.component';

describe('TextComponent', () => {
    let component: TextComponent;
    let fixture: ComponentFixture<TextComponent>;

    beforeEach(waitForAsync(() => {
        filtersTestBed().testingModule.compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TextComponent);
        component = fixture.componentInstance;
        component.filter = {
            dataType: 'text',
            field: 'text',
            filterType: 'checkbox',
            options: ['A', 'B', 'C']
        };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
