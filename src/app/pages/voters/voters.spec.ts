import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Voters } from './voters';

describe('Voters', () => {
  let component: Voters;
  let fixture: ComponentFixture<Voters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Voters]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Voters);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
