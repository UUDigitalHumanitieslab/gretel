import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { XpathEditorComponent } from './xpath-editor.component';

describe('XpathEditorComponent', () => {
  let component: XpathEditorComponent;
  let fixture: ComponentFixture<XpathEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ XpathEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(XpathEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
