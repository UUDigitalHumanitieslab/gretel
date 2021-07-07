import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NodePropertiesEditorComponent } from './node-properties-editor.component';
import { commonTestBed } from '../../common-test-bed';

describe('NodePropertiesEditorComponent', () => {
    let component: NodePropertiesEditorComponent;
    let fixture: ComponentFixture<NodePropertiesEditorComponent>;

    beforeEach(waitForAsync(() => {
        commonTestBed().testingModule.compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NodePropertiesEditorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
