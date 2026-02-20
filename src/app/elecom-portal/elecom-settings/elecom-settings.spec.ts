import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElecomSettings } from './elecom-settings';

describe('ElecomSettings', () => {
  let component: ElecomSettings;
  let fixture: ComponentFixture<ElecomSettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ElecomSettings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ElecomSettings);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
