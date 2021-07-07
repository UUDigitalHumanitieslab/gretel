import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HomeContentComponent } from './home-content.component';
import { commonTestBed } from '../../../common-test-bed';

describe('HomeContentComponent', () => {
    let component: HomeContentComponent;
    let fixture: ComponentFixture<HomeContentComponent>;

    beforeEach(waitForAsync(() => {
        commonTestBed().testingModule.compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(HomeContentComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
