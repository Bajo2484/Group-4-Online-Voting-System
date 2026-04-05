import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElecomNotifications } from './elecom-notifications';

describe('ElecomNotifications', () => {
  let component: ElecomNotifications;
  let fixture: ComponentFixture<ElecomNotifications>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ElecomNotifications]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ElecomNotifications);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
