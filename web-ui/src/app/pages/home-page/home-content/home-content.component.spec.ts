import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeContentComponent } from './home-content.component';
import { PaperCiteComponent } from '../../../components/page-components/paper-cite/paper-cite.component';
import { commonTestBed } from '../../../common-test-bed';

describe('HomeContentComponent', () => {
    let component: HomeContentComponent;
    let fixture: ComponentFixture<HomeContentComponent>;

    beforeEach(async(() => {
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
