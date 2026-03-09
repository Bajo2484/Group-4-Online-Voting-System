import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const user = auth.getCurrentUser();

  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  const requiredRole = route.data?.['role'];

  if (requiredRole && user.role !== requiredRole) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};