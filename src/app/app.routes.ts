import { Routes } from '@angular/router';

// Auth
import { LoginComponent } from './auth/login/login';

// Admin
import { DashboardComponent } from './home/dashboard/dashboard';
import { CandidatesComponent } from './pages/candidates/candidates';
import { VotersComponent } from './pages/voters/voters';
import { ElectionComponent } from './pages/elections/elections';
import { Results } from './pages/results/results';
import { ElecomComponent } from './pages/elecom/elecom';
import { Settings } from './pages/setting/setting';


// Elecom
import { ElecomDashboardComponent } from './elecom-portal/elecom-dashboard/elecom-dashboard';
import { ElecomSettings } from './elecom-portal/elecom-settings/elecom-settings';

// Student
import { StudentDashboardComponent } from './student-portal/student-dashboard/student-dashboard';
import { StudentResult } from './student-portal/student-result/student-result';
import { StudentProfileComponent} from './student-portal/student-profile/student-profile';
import { StudentApplyCandidateComponent } from './student-portal/student-apply-candidate/student-apply-candidate';

export const routes: Routes = [
  // Login
  { path: '', component: LoginComponent },

  // Admin
  { path: 'dashboard', component: DashboardComponent },
  { path: 'candidates', component: CandidatesComponent },
  { path: 'voters', component: VotersComponent },
  { path: 'elections', component: ElectionComponent },
  { path: 'results', component: Results },
  { path: 'elecom', component: ElecomComponent },
  { path: 'setting', component: Settings },

  // Elecom
  { path: 'elecom-dashboard', component: ElecomDashboardComponent },
  { path: 'elecom-settings', component: ElecomSettings },

  // Student
  { path: 'student-dashboard', component: StudentDashboardComponent },
  { path: 'student-result', component: StudentResult },
  { path: 'student-profile', component: StudentProfileComponent },
  { path: 'student-apply-candidate', component: StudentApplyCandidateComponent},


  { path: '**', redirectTo: '' }
];
