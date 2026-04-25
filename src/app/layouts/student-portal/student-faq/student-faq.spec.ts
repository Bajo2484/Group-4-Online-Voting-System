import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentFaq } from './student-faq';

describe('StudentFaq', () => {
  let component: StudentFaq;
  let fixture: ComponentFixture<StudentFaq>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentFaq]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentFaq);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
