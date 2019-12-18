import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NodePropertiesEditorComponent } from './node-properties-editor.component';
import { commonTestBed } from '../../common-test-bed';

describe('NodePropertiesEditorComponent', () => {
    let component: NodePropertiesEditorComponent;
    let fixture: ComponentFixture<NodePropertiesEditorComponent>;

    beforeEach(async(() => {
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
