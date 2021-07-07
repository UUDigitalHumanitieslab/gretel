import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NodePropertiesComponent } from './node-properties.component';
import { commonTestBed } from '../../common-test-bed';

describe('NodePropertiesComponent', () => {
    let component: NodePropertiesComponent;
    let fixture: ComponentFixture<NodePropertiesComponent>;

    beforeEach(waitForAsync(() => {
        commonTestBed().testingModule.compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NodePropertiesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
