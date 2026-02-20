import { Routes } from '@angular/router';

// Auth
import { LoginComponent } from './auth/login/login';

// Admin
import { DashboardComponent } from './home/dashboard/dashboard';
import { CandidatesComponent } from './pages/candidates/candidates';
import { Voters } from './pages/voters/voters';
import { ElectionComponent } from './pages/elections/elections';
import { Results } from './pages/results/results';
import { ElecomComponent } from './pages/elecom/elecom';
import { Settings } from './pages/setting/setting';

// Elecom
import { ElecomDashboardComponent } from './elecom-portal/elecom-dashboard/elecom-dashboard';

// Student
import { StudentDashboardComponent } from './student-portal/student-dashboard/student-dashboard';
import { StudentResult } from './student-portal/student-result/student-result';
import { StudentProfileComponent } from './student-portal/student-profile/student-profile';
import { StudentApplyCandidateComponent } from './student-portal/student-apply-candidate/student-apply-candidate';

export const routes: Routes = [
  // Login
  { path: '', component: LoginComponent },

  // Admin Routes
  { path: 'dashboard', component: DashboardComponent },
  { path: 'candidates', component: CandidatesComponent },
  { path: 'voters', component: Voters },
  { path: 'elections', component: ElectionComponent },
  { path: 'results', component: Results },
  { path: 'setting', component: Settings },

  // Elecom Routes
  { path: 'elecom', component: ElecomComponent }, // Main Elecom page
  { path: 'elecom-dashboard', component: ElecomDashboardComponent }, // Elecom dashboard
  { path: 'elecom-voters', component: Voters }, // Optional: Elecom access voters
  { path: 'elecom-candidates', component: CandidatesComponent }, // Optional: Elecom access candidates
  { path: 'elecom-elections', component: ElectionComponent }, // Optional: Elecom access elections
  { path: 'elecom-results', component: Results }, // Optional: Elecom access results
  { path: 'elecom-setting', component: Settings }, 

  // Student Routes
  { path: 'student-dashboard', component: StudentDashboardComponent },
  { path: 'student-result', component: StudentResult },
  { path: 'student-profile', component: StudentProfileComponent },
  { path: 'student-apply-candidate', component: StudentApplyCandidateComponent },

  // Wildcard
  { path: '**', redirectTo: '' }
];