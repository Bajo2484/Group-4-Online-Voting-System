import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentNotifications } from './student-notifications';

describe('StudentNotifications', () => {
  let component: StudentNotifications;
  let fixture: ComponentFixture<StudentNotifications>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentNotifications]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentNotifications);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
