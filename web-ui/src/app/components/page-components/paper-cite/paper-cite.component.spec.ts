import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { commonTestBed } from '../../../common-test-bed';

import { PaperCiteComponent } from './paper-cite.component';

describe('PaperCiteComponent', () => {
    let component: PaperCiteComponent;
    let fixture: ComponentFixture<PaperCiteComponent>;

    beforeEach(waitForAsync(() => {
        commonTestBed().testingModule.compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PaperCiteComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
