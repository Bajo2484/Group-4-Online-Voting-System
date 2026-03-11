import { Routes } from '@angular/router';

// Auth
import { LoginComponent } from './auth/login/login';

// Admin Pages
import { AdminDashboardComponent } from './layouts/admin-portal/admin-dashboard/admin-dashboard';
import { CandidatesComponent } from './pages/candidates/candidates';
import { Voters } from './pages/voters/voters';
import { ElectionComponent } from './pages/elections/elections';
import { Result } from './pages/results/results';
import { AdminSettingsComponent } from './layouts/admin-portal/admin-settings/admin-settings';

// Elecom Pages
import { ElecomDashboardComponent } from './layouts/elecom-portal/elecom-dashboard/elecom-dashboard';
import { ElecomSettingsComponent } from './layouts/elecom-portal/elecom-settings/elecom-settings';
import { ElecomComponent } from './pages/elecom/elecom';

// Student Pages
import { StudentDashboardComponent } from './layouts/student-portal/student-dashboard/student-dashboard';
import { StudentResult } from './layouts/student-portal/student-result/student-result';
import { StudentProfileComponent } from './layouts/student-portal/student-setting/student-profile';
import { ApplyCandidateComponent } from './layouts/student-portal/student-apply-candidate/student-apply-candidate';
import { VotingPage } from './layouts/student-portal/voting-page/voting-page';

// Auth Guard
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Login
  { path: '', component: LoginComponent },

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
  { path: 'elecom-settings', component: ElecomSettingsComponent, canActivate: [authGuard], data: { role: 'elecom' } },

  // Admin managing Elecom accounts
  { path: 'manage-elecom', component: ElecomComponent, canActivate: [authGuard], data: { role: 'admin' } },

  // Student Routes
  { path: 'student-dashboard', component: StudentDashboardComponent, canActivate: [authGuard], data: { role: 'student' } },
  { path: 'student-result', component: StudentResult, canActivate: [authGuard], data: { role: 'student' } },
  { path: 'student-profile', component: StudentProfileComponent, canActivate: [authGuard], data: { role: 'student' } },
  { path: 'student-apply-candidate', component: ApplyCandidateComponent, canActivate: [authGuard], data: { role: 'student' } },
  { path: 'student-voting', component: VotingPage, canActivate: [authGuard], data: { role: 'student' } }, // Voting page route

  // Catch all (redirect unknown routes to login)
  { path: '**', redirectTo: '' }
];