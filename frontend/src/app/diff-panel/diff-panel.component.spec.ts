import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiffPanelComponent } from './diff-panel.component';

describe('DiffPanelComponent', () => {
  let component: DiffPanelComponent;
  let fixture: ComponentFixture<DiffPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiffPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiffPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
