import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalTreeVisualizerComponent } from './external-tree-visualizer.component';

describe('ExternalTreeVisualierComponent', () => {
  let component: ExternalTreeVisualizerComponent;
  let fixture: ComponentFixture<ExternalTreeVisualizerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ExternalTreeVisualizerComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExternalTreeVisualizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
