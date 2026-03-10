import { ComponentFixture, TestBed } from '@angular/core/testing';

<<<<<<<< HEAD:src/app/layouts/admin-portal/admin-settings/admin-settings.spec.ts
import { AdminSettings } from './admin-settings';

describe('AdminSettings', () => {
  let component: AdminSettings;
  let fixture: ComponentFixture<AdminSettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSettings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminSettings);
========
import { Myprofile } from './myprofile';

describe('Myprofile', () => {
  let component: Myprofile;
  let fixture: ComponentFixture<Myprofile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Myprofile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Myprofile);
>>>>>>>> d55779593b30664f3eda9f9eec1350274bf88dd7:src/app/layouts/admin-portal/myprofile/myprofile.spec.ts
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
