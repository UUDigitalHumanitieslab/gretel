import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubtitleDirective } from './subtitle.directive';
import { Component, Input } from '@angular/core';

describe('SubtitleDirective', () => {
    let component: TestHeadingComponent;
    let fixture: ComponentFixture<TestHeadingComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TestHeadingComponent, SubtitleDirective]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TestHeadingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

@Component({
    template: `<h1 grtSubtitle>{{text}}</h1>`
})
class TestHeadingComponent {
    @Input()
    text: string;
}
