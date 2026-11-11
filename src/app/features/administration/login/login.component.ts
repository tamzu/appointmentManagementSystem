import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  email = '';
  password = '';

  readonly loading = signal(false);
  readonly errorMessage = signal('');

  onSubmit(): void {
    if (this.loading()) {
      return;
    }

    this.errorMessage.set('');

    if (!this.email.trim() || !this.password) {
      this.errorMessage.set('Please enter your email address and password.');
      return;
    }

    this.loading.set(true);

    this.authService
      .login({
        email: this.email.trim(),
        password: this.password,
      })
      .subscribe({
        next: (response) => {
          this.loading.set(false);

          const returnUrl = this.activatedRoute.snapshot.queryParamMap.get('returnUrl');

          // Only allow navigation back to the admin area.
          const destination =
            returnUrl?.startsWith('/admin') && returnUrl !== '/admin/login' ? returnUrl : '/admin';

          void this.router.navigateByUrl(destination);
        },
        error: (error) => {
          this.loading.set(false);

          this.errorMessage.set(
            error?.error?.message || 'Login failed. Please check your credentials and try again.',
          );
        },
      });
  }
}
