import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentApplyCandidateComponent } from './student-apply-candidate';

describe('StudentApplyCandidate', () => {
  let component: StudentApplyCandidateComponent;
  let fixture: ComponentFixture<StudentApplyCandidateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentApplyCandidateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentApplyCandidateComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
