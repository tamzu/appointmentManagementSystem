import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Only intercept requests to our backend API.
  const isApiRequest = req.url === '/api' || req.url.startsWith('/api/');

  // Do not attach an existing token to the login request.
  const isLoginRequest = req.url.includes('/Auth/staff/login');

  if (!isApiRequest || isLoginRequest) {
    return next(req);
  }

  const token = authService.getAccessToken();

  if (!token) {
    return next(req);
  }

  const authenticatedRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authenticatedRequest);
};
