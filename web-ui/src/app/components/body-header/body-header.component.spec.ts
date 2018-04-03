import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BodyHeaderComponent } from './body-header.component';

describe('BodyHeaderComponent', () => {
  let component: BodyHeaderComponent;
  let fixture: ComponentFixture<BodyHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BodyHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BodyHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
