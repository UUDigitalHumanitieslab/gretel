import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ParseComponent } from './parse.component';

describe('ParseComponent', () => {
  let component: ParseComponent;
  let fixture: ComponentFixture<ParseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ParseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
