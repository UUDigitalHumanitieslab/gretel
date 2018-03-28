import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownWithFilterComponent } from './dropdown-with-filter.component';

describe('DropdownWithFilterComponent', () => {
  let component: DropdownWithFilterComponent;
  let fixture: ComponentFixture<DropdownWithFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DropdownWithFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DropdownWithFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
