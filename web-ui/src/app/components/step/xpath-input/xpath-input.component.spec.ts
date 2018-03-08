import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { XpathInputComponent } from './xpath-input.component';

describe('XpathInputComponent', () => {
  let component: XpathInputComponent;
  let fixture: ComponentFixture<XpathInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ XpathInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(XpathInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
