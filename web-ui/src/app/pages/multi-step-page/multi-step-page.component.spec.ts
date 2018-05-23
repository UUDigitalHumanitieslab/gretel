import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiStepPageComponent } from './multi-step-page.component';

describe('MultiStepPageComponent', () => {
  let component: MultiStepPageComponent;
  let fixture: ComponentFixture<MultiStepPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultiStepPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiStepPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
