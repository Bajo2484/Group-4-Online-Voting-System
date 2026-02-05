import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { DashboardComponent } from './home/dashboard/dashboard';
import { Candidates } from './pages/candidates/candidates';
import { Voters} from './pages/voters/voters';
import { Elections} from './pages/elections/elections';
import { Results } from './pages/results/results';
import { Organizations } from './pages/organizations/organizations';
import { Setting } from './pages/setting/setting';

export const routes: Routes = [
  { path: '', component: LoginComponent },

  { path: 'dashboard', component: DashboardComponent },
  { path: 'candidates', component: Candidates },
  { path: 'voters', component: Voters},
  { path: 'elections', component:Elections},
  { path: 'results', component: Results },
  { path: 'organizations', component: Organizations },
  { path: 'setting', component: Setting },
];