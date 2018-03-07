import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GretelWebsiteLinkComponent } from './gretel-website-link.component';

describe('GretelWebsiteLinkComponent', () => {
  let component: GretelWebsiteLinkComponent;
  let fixture: ComponentFixture<GretelWebsiteLinkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GretelWebsiteLinkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GretelWebsiteLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
