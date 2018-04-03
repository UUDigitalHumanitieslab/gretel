import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StepsNavigatorComponent } from './steps-navigator.component';

describe('StepsNavigatorComponent', () => {
  let component: StepsNavigatorComponent;
  let fixture: ComponentFixture<StepsNavigatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StepsNavigatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StepsNavigatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
