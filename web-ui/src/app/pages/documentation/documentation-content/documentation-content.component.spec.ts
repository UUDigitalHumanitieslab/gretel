import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DocumentationContentComponent } from './documentation-content.component';
import { commonTestBed } from '../../../common-test-bed';

describe('DocumentationContentComponent', () => {
    let component: DocumentationContentComponent;
    let fixture: ComponentFixture<DocumentationContentComponent>;

    beforeEach(waitForAsync(() => {
        commonTestBed().testingModule.compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DocumentationContentComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
