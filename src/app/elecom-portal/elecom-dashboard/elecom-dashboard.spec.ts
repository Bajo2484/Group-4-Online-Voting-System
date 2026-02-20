import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElecomDashboard } from './elecom-dashboard';

describe('ElecomDashboard', () => {
  let component: ElecomDashboard;
  let fixture: ComponentFixture<ElecomDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ElecomDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ElecomDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
