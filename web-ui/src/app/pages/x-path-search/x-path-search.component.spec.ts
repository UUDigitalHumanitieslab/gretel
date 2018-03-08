import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { XPathSearchComponent } from './x-path-search.component';

describe('XPathSearchComponent', () => {
  let component: XPathSearchComponent;
  let fixture: ComponentFixture<XPathSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ XPathSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(XPathSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
