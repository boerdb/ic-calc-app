import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShiftLogPage } from './shift-log.page';

describe('ShiftLogPage', () => {
  let component: ShiftLogPage;
  let fixture: ComponentFixture<ShiftLogPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ShiftLogPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
