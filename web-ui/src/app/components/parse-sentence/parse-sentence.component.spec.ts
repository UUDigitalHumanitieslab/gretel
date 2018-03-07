import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ParseSentenceComponent } from './parse-sentence.component';

describe('ParseSentenceComponent', () => {
  let component: ParseSentenceComponent;
  let fixture: ComponentFixture<ParseSentenceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ParseSentenceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParseSentenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
