import { Routes } from '@angular/router';

// Auth
import { LoginComponent } from './auth/login/login';

import { CandidatesComponent } from './pages/candidates/candidates';
import { Voters } from './pages/voters/voters';
import { ElectionComponent } from './pages/elections/elections';
import { Results } from './pages/results/results';
import { ElecomComponent } from './pages/elecom/elecom';
import { AdminSettingsComponent } from './layouts/admin-portal/admin-settings/admin-settings';
import { DashboardComponent} from './layouts/admin-portal/admin-dashboard/admin-dashboard';
import { Myprofile } from './layouts/admin-portal/myprofile/myprofile';

import { ElecomDashboardComponent } from './layouts/elecom-portal/elecom-dashboard/elecom-dashboard';

import { StudentDashboardComponent } from './layouts/student-portal/student-dashboard/student-dashboard';
import { StudentResult } from './layouts/student-portal/student-result/student-result';
import { StudentProfileComponent } from './layouts/student-portal/student-profile/student-profile';
import { StudentApplyCandidateComponent } from './layouts/student-portal/student-apply-candidate/student-apply-candidate';


export const routes: Routes = [
  { path: '', component: LoginComponent },

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

  { path: '**', redirectTo: '' }
];