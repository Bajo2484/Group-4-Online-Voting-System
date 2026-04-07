import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentSetting } from './student-setting';

describe('StudentSetting', () => {
  let component: StudentSetting;
  let fixture: ComponentFixture<StudentSetting>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentSetting]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentSetting);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
