import { Routes } from '@angular/router';

// Auth
import { LoginComponent } from './auth/login/login';

<<<<<<< HEAD
// Admin Pages
import { AdminDashboardComponent } from './layouts/admin-portal/admin-dashboard/admin-dashboard';
=======
>>>>>>> d55779593b30664f3eda9f9eec1350274bf88dd7
import { CandidatesComponent } from './pages/candidates/candidates';
import { Voters } from './pages/voters/voters';
import { ElectionComponent } from './pages/elections/elections';
import { Result } from './pages/results/results';
import { AdminSettingsComponent } from './layouts/admin-portal/admin-settings/admin-settings';


// Elecom Pages
import { ElecomDashboardComponent } from './layouts/elecom-portal/elecom-dashboard/elecom-dashboard';
import { ElecomComponent } from './pages/elecom/elecom';
<<<<<<< HEAD

// Student Pages
import { StudentDashboardComponent } from './layouts/student-portal/student-dashboard/student-dashboard';
import { StudentResult } from './layouts/student-portal/student-result/student-result';
import { StudentProfileComponent } from './layouts/student-portal/student-setting/student-profile';
import { ApplyCandidateComponent } from './layouts/student-portal/student-apply-candidate/student-apply-candidate';

// Auth Guard
import { authGuard } from './guards/auth.guard';
=======
import { AdminSettingsComponent } from './layouts/admin-portal/admin-settings/admin-settings';
import { DashboardComponent} from './layouts/admin-portal/admin-dashboard/admin-dashboard';
import { Myprofile } from './layouts/admin-portal/myprofile/myprofile';

import { ElecomDashboardComponent } from './layouts/elecom-portal/elecom-dashboard/elecom-dashboard';

import { StudentDashboardComponent } from './layouts/student-portal/student-dashboard/student-dashboard';
import { StudentResult } from './layouts/student-portal/student-result/student-result';
import { StudentProfileComponent } from './layouts/student-portal/student-profile/student-profile';
import { StudentApplyCandidateComponent } from './layouts/student-portal/student-apply-candidate/student-apply-candidate';

>>>>>>> d55779593b30664f3eda9f9eec1350274bf88dd7

export const routes: Routes = [
  { path: '', component: LoginComponent },

<<<<<<< HEAD
  // Admin Routes
  { path: 'dashboard', component: AdminDashboardComponent, canActivate: [authGuard], data: { role: 'admin' } },
  { path: 'candidates', component: CandidatesComponent, canActivate: [authGuard], data: { role: 'admin' } },
  { path: 'voters', component: Voters, canActivate: [authGuard], data: { role: 'admin' } },
  { path: 'elections', component: ElectionComponent, canActivate: [authGuard], data: { role: 'admin' } },
  { path: 'results', component: Result, canActivate: [authGuard], data: { role: 'admin' } },
  { path: 'adminsettings', component: AdminSettingsComponent, canActivate: [authGuard], data: { role: 'admin' } },
 

  // Elecom Routes
  { path: 'elecom-dashboard', component: ElecomDashboardComponent, canActivate: [authGuard], data: { role: 'elecom' } },
  { path: 'elecom-voters', component: Voters, canActivate: [authGuard], data: { role: 'elecom' } },
  { path: 'elecom-candidates', component: CandidatesComponent, canActivate: [authGuard], data: { role: 'elecom' } },
  { path: 'elecom-elections', component: ElectionComponent, canActivate: [authGuard], data: { role: 'elecom' } },
  { path: 'elecom-results', component: Result, canActivate: [authGuard], data: { role: 'elecom' } },
  { path: 'elecom-setting', component: AdminSettingsComponent, canActivate: [authGuard], data: { role: 'elecom' } },
  
 // Admin managing Elecom accounts
{
  path: 'manage-elecom',
  component: ElecomComponent,   // reuse ElecomComponent
  canActivate: [authGuard],
  data: { role: 'admin' }       // allow admin to access
},
  // Student Routes
  { path: 'student-dashboard', component: StudentDashboardComponent, canActivate: [authGuard], data: { role: 'student' } },
  { path: 'student-result', component: StudentResult, canActivate: [authGuard], data: { role: 'student' } },
  { path: 'student-profile', component: StudentProfileComponent, canActivate: [authGuard], data: { role: 'student' } },
  { path: 'student-apply-candidate', component: ApplyCandidateComponent, canActivate: [authGuard], data: { role: 'student' } },

  // Catch all (redirect unknown routes to login)
=======
  { path: 'dashboard', component: DashboardComponent },
  { path: 'candidates', component: CandidatesComponent },
  { path: 'voters', component: Voters },
  { path: 'elections', component: ElectionComponent },
  { path: 'results', component: Results },
  { path: 'adminsettings', component: AdminSettingsComponent },

  { path: 'elecom', component: ElecomComponent }, // Main Elecom page
  { path: 'elecom-dashboard', component: ElecomDashboardComponent }, // Elecom dashboard
  { path: 'elecom-voters', component: Voters }, // Optional: Elecom access voters
  { path: 'elecom-candidates', component: CandidatesComponent }, // Optional: Elecom access candidates
  { path: 'elecom-elections', component: ElectionComponent }, // Optional: Elecom access elections
  { path: 'elecom-results', component: Results }, // Optional: Elecom access results
  { path: 'elecom-setting', component: AdminSettingsComponent }, 

  { path: 'student-dashboard', component: StudentDashboardComponent },
  { path: 'student-result', component: StudentResult },
  { path: 'student-profile', component: StudentProfileComponent },
  { path: 'student-apply-candidate', component: StudentApplyCandidateComponent },
  {path: 'myprofile', component: Myprofile},

>>>>>>> d55779593b30664f3eda9f9eec1350274bf88dd7
  { path: '**', redirectTo: '' }
];