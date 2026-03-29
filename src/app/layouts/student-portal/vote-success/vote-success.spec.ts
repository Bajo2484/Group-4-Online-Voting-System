import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoteSuccess } from './vote-success';

describe('VoteSuccess', () => {
  let component: VoteSuccess;
  let fixture: ComponentFixture<VoteSuccess>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VoteSuccess]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VoteSuccess);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
