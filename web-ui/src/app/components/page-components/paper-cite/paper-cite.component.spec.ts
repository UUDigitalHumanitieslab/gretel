import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PaperCiteComponent } from './paper-cite.component';

describe('PaperCiteComponent', () => {
  let component: PaperCiteComponent;
  let fixture: ComponentFixture<PaperCiteComponent>;

  beforeEach(waitForAsync(() => {
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
