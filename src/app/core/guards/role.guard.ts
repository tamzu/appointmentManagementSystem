import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = route.data['roles'] as string[] | undefined;

  if (!allowedRoles?.length) {
    return true;
  }

  const hasPermission = allowedRoles.some((role) => authService.hasRole(role));

  if (hasPermission) {
    return true;
  }

  return router.createUrlTree(['/admin/access-denied']);
};
