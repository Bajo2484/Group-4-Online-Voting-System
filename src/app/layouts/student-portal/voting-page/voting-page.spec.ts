import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VotingPage } from './voting-page';

describe('VotingPage', () => {
  let component: VotingPage;
  let fixture: ComponentFixture<VotingPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VotingPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VotingPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
