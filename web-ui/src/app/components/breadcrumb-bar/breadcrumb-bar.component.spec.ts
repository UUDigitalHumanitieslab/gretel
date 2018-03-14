import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BreadcrumbBarComponent } from './breadcrumb-bar.component';

describe('BreadcrumbBarComponent', () => {
  let component: BreadcrumbBarComponent;
  let fixture: ComponentFixture<BreadcrumbBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BreadcrumbBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BreadcrumbBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
