import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExampleBasedSearchComponent } from './example-based-search.component';

describe('ExampleBasedSearchComponent', () => {
  let component: ExampleBasedSearchComponent;
  let fixture: ComponentFixture<ExampleBasedSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExampleBasedSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExampleBasedSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
