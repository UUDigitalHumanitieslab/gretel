import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HomePageComponent } from './home-page.component';
import { HomeContentComponent } from './home-content/home-content.component';
import { BodyHeaderComponent } from '../../components/page-components/body-header/body-header.component';
import { PaperCiteComponent } from '../../components/page-components/paper-cite/paper-cite.component';
import { commonTestBed } from '../../common-test-bed';

describe('HomePageComponent', () => {
    let component: HomePageComponent;
    let fixture: ComponentFixture<HomePageComponent>;

    beforeEach(async(() => {
        commonTestBed().testingModule.compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(HomePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
