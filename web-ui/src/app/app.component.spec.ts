import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { commonTestBed } from './common-test-bed';

describe('AppComponent', () => {
    beforeEach(async(() => {
        commonTestBed().testingModule.compileComponents();
    }));
    it('should create the app', async(() => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.debugElement.componentInstance;
        expect(app).toBeTruthy();
    }));
});
