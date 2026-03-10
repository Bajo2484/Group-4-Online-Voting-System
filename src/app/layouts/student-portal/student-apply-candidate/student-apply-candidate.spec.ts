import { ComponentFixture, TestBed } from '@angular/core/testing';

<<<<<<< HEAD
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
=======
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
>>>>>>> d55779593b30664f3eda9f9eec1350274bf88dd7
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
