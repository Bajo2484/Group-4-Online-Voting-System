import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplyCandidateComponent } from './student-apply-candidate';

describe('StudentApplyCandidate', () => {
  let component: ApplyCandidateComponent;
  let fixture: ComponentFixture<ApplyCandidateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplyCandidateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplyCandidateComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
