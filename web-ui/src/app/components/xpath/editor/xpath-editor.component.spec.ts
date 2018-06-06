import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { XPathEditorComponent } from './xpath-editor.component';
import { commonTestBed } from '../../../common-test-bed';

describe('XPath Editor', () => {
    let component: XPathEditorComponent;
    let fixture: ComponentFixture<XPathEditorComponent>;

    beforeEach(async(() => {
        commonTestBed().testingModule.compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(XPathEditorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
