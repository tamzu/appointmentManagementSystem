import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { AdminDashboardSummary } from '../../../core/models/admin-dashboard.model';
import { AdminDashboardService } from '../../../core/services/admin-dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private readonly dashboardService = inject(AdminDashboardService);

  readonly dashboardData = signal<AdminDashboardSummary | null>(null);

  readonly isLoading = signal<boolean>(true);

  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.dashboardService.getSummary().subscribe({
      next: (response) => {
        this.dashboardData.set(response);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load admin dashboard:', error);

        this.errorMessage.set('Unable to load dashboard information. Please try again.');

        this.isLoading.set(false);
      },
    });
  }
}
