import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElecomDashboardComponent} from './elecom-dashboard';

describe('ElecomDashboard', () => {
  let component: ElecomDashboardComponent;
  let fixture: ComponentFixture<ElecomDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ElecomDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ElecomDashboardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
