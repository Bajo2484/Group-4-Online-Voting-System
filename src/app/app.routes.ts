import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { Dashboard} from './home/dashboard/dashboard';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'dashboard', component: Dashboard }
];