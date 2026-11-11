import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { map, Observable, tap } from 'rxjs';

import { StaffLoginRequest, StaffLoginResponse } from '../models/staff-login.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly apiUrl = '/api/Auth';

  private readonly storageKey = 'staff_session';

  private readonly staffSession = signal<StaffLoginResponse | null>(this.loadSession());

  readonly currentStaff = this.staffSession.asReadonly();

  login(credentials: StaffLoginRequest): Observable<StaffLoginResponse> {
    return this.http.post<StaffLoginResponse>(`${this.apiUrl}/staff/login`, credentials).pipe(
      map((response) => {
        if (!response.success || !response.accessToken) {
          throw new Error('Login failed. Please check your credentials.');
        }

        return response;
      }),
      tap((response) => this.saveSession(response)),
    );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem(this.storageKey);
    }

    this.staffSession.set(null);
  }

  getAccessToken(): string | null {
    const session = this.staffSession();

    if (!session || this.isSessionExpired(session)) {
      this.logout();
      return null;
    }

    return session.accessToken;
  }

  isAuthenticated(): boolean {
    return this.getAccessToken() !== null;
  }

  hasRole(role: string): boolean {
    const session = this.staffSession();

    if (!session || this.isSessionExpired(session)) {
      this.logout();
      return false;
    }

    return session.roles.some((userRole) => userRole.toLowerCase() === role.toLowerCase());
  }

  private saveSession(response: StaffLoginResponse): void {
    this.staffSession.set(response);

    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem(this.storageKey, JSON.stringify(response));
    }
  }

  private loadSession(): StaffLoginResponse | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    try {
      const storedSession = sessionStorage.getItem(this.storageKey);

      if (!storedSession) {
        return null;
      }

      const session = JSON.parse(storedSession) as StaffLoginResponse;

      if (
        !session.accessToken ||
        !session.expiresAt ||
        new Date(session.expiresAt).getTime() <= Date.now()
      ) {
        sessionStorage.removeItem(this.storageKey);
        return null;
      }

      return session;
    } catch {
      sessionStorage.removeItem(this.storageKey);
      return null;
    }
  }

  private isSessionExpired(session: StaffLoginResponse): boolean {
    const expiryTime = new Date(session.expiresAt).getTime();

    return !Number.isFinite(expiryTime) || expiryTime <= Date.now();
  }
}
