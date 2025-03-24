import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgSignalUtilsComponent } from './ng-signal-utils.component';

describe('NgSignalUtilsComponent', () => {
  let component: NgSignalUtilsComponent;
  let fixture: ComponentFixture<NgSignalUtilsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgSignalUtilsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgSignalUtilsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
