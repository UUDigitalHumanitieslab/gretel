import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MweResultsComponent } from './mwe-results.component';

describe('MweResultsComponent', () => {
  let component: MweResultsComponent;
  let fixture: ComponentFixture<MweResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MweResultsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MweResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
