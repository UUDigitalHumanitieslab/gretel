import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentationComponent } from './documentation.component';
import { commonTestBed } from '../../common-test-bed';

describe('DocumentationComponent', () => {
    let component: DocumentationComponent;
    let fixture: ComponentFixture<DocumentationComponent>;

    beforeEach(async(() => {
        commonTestBed().testingModule.compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DocumentationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
