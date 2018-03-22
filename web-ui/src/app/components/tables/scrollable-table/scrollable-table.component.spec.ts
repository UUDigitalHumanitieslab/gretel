import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrollableTableComponent } from './scrollable-table.component';

describe('SelectableTable', () => {
  let component: ScrollableTableComponent;
  let fixture: ComponentFixture<ScrollableTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScrollableTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScrollableTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
