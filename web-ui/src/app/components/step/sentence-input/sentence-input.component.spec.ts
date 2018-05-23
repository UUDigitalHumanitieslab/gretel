import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SentenceInputComponent } from './sentence-input.component';

describe('SentenceInputStepComponent', () => {
  let component: SentenceInputComponent;
  let fixture: ComponentFixture<SentenceInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SentenceInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SentenceInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
