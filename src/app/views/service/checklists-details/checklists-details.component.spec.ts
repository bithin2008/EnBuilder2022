import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChecklistsDetailsComponent } from './checklists-details.component';

describe('ChecklistsDetailsComponent', () => {
  let component: ChecklistsDetailsComponent;
  let fixture: ComponentFixture<ChecklistsDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChecklistsDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChecklistsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
