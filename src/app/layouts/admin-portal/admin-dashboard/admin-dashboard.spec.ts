import { ComponentFixture, TestBed } from '@angular/core/testing';

<<<<<<< HEAD
import { AdminDashboardComponent } from './admin-dashboard';

describe('DashboardComponent', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminDashboardComponent);
=======
import { AdminDashboard } from './admin-dashboard';

describe('AdminDashboard', () => {
  let component: AdminDashboard;
  let fixture: ComponentFixture<AdminDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminDashboard);
>>>>>>> d55779593b30664f3eda9f9eec1350274bf88dd7
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
