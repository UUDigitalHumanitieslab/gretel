import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaperCiteComponent } from './paper-cite.component';

describe('PaperCiteComponent', () => {
  let component: PaperCiteComponent;
  let fixture: ComponentFixture<PaperCiteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaperCiteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaperCiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
