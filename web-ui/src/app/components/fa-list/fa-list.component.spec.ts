import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FaListComponent } from './fa-list.component';

describe('FaListComponent', () => {
  let component: FaListComponent;
  let fixture: ComponentFixture<FaListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FaListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
