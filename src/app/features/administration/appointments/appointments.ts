import { CommonModule, DatePipe, NgClass } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  AdminAppointment,
  AdminAppointmentFilters,
  PagedResponse,
} from '../../../core/models/admin-appointment.model';

import { RouterLink } from '@angular/router';
import { AdminAppointmentsService } from '../../../core/services/admin-appointments.service';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [DatePipe, FormsModule, CommonModule, NgClass, RouterLink],
  templateUrl: './appointments.html',
  styleUrl: './appointments.scss',
})
export class Appointments implements OnInit {
  private readonly appointmentsService = inject(AdminAppointmentsService);

  readonly appointments = signal<AdminAppointment[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly totalRecords = signal(0);
  readonly totalPages = signal(0);

  searchTerm = '';
  selectedStatus = '';
  dateFrom = '';
  dateTo = '';

  currentPage = 1;
  pageSize = 10;

  readonly statusOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Confirmed', value: 'CONFIRMED' },
    { label: 'Cancelled', value: 'CANCELLED' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'No Show', value: 'NO_SHOW' },
  ];

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const filters: AdminAppointmentFilters = {
      page: this.currentPage,
      pageSize: this.pageSize,
      search: this.searchTerm.trim() || undefined,
      status: this.selectedStatus || undefined,
      dateFrom: this.dateFrom || undefined,
      dateTo: this.dateTo || undefined,
    };

    this.appointmentsService.getAppointments(filters).subscribe({
      next: (response: PagedResponse<AdminAppointment>) => {
        this.appointments.set(response.items);
        this.totalRecords.set(response.totalRecords);
        this.totalPages.set(response.totalPages);
        this.currentPage = response.page;
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load appointments:', error);
        this.errorMessage.set('Unable to load appointments. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  searchAppointments(): void {
    this.currentPage = 1;
    this.loadAppointments();
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadAppointments();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.currentPage = 1;

    this.loadAppointments();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) {
      return;
    }

    this.currentPage = page;
    this.loadAppointments();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'status-pending';
      case 'CONFIRMED':
        return 'status-confirmed';
      case 'CANCELLED':
        return 'status-cancelled';
      case 'COMPLETED':
        return 'status-completed';
      case 'NO_SHOW':
        return 'status-no-show';
      default:
        return '';
    }
  }

  trackByAppointment(index: number, appointment: AdminAppointment): number {
    return appointment.appointmentId;
  }
}
