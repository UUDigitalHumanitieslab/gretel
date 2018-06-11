import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { XPathViewerComponent } from './xpath-viewer.component';
import { commonTestBed } from '../../../common-test-bed';

describe('XPath Viewer', () => {
    let component: XPathViewerComponent;
    let fixture: ComponentFixture<XPathViewerComponent>;

    beforeEach(async(() => {
        commonTestBed().testingModule.compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(XPathViewerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
