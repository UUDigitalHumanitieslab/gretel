import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuerySetComponent } from './query-set.component';

describe('QuerySetComponent', () => {
  let component: QuerySetComponent;
  let fixture: ComponentFixture<QuerySetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuerySetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuerySetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
