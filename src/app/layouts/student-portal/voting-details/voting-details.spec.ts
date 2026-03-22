import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VotingDetails } from './voting-details';

describe('VotingDetails', () => {
  let component: VotingDetails;
  let fixture: ComponentFixture<VotingDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VotingDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VotingDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
