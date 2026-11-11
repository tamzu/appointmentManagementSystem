import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminAppointmentDetails } from '../../../core/models/admin-appointment.model';
import { AdminAppointmentsService } from '../../../core/services/admin-appointments.service';

@Component({
  selector: 'app-appointment-details',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './appointment-details.component.html',
  styleUrl: './appointment-details.component.scss',
})
export class AppointmentDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly appointmentsService = inject(AdminAppointmentsService);

  readonly appointment = signal<AdminAppointmentDetails | null>(null);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly isConfirming = signal(false);
  readonly confirmationMessage = signal<string | null>(null);
  readonly confirmationError = signal<string | null>(null);
  readonly isCancelling = signal(false);
  readonly cancellationReason = signal('');
  readonly cancellationMessage = signal<string | null>(null);
  readonly cancellationError = signal<string | null>(null);
  readonly showCancellationForm = signal(false);

  ngOnInit(): void {
    const appointmentId = Number(this.route.snapshot.paramMap.get('appointmentId'));

    if (!Number.isSafeInteger(appointmentId) || appointmentId <= 0) {
      this.errorMessage.set('Invalid appointment ID.');
      this.isLoading.set(false);
      return;
    }

    this.loadAppointment(appointmentId);
  }

  loadAppointment(appointmentId: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.appointmentsService.getAppointmentDetails(appointmentId).subscribe({
      next: (response) => {
        this.appointment.set(response);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load appointment details:', error);

        this.errorMessage.set(
          error.status === 404
            ? 'The requested appointment could not be found.'
            : 'Unable to load appointment details. Please try again.',
        );

        this.isLoading.set(false);
      },
    });
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

  confirmAppointment(): void {
    const item = this.appointment();

    if (!item || item.statusCode !== 'PENDING' || this.isConfirming()) {
      return;
    }

    this.isConfirming.set(true);
    this.confirmationMessage.set(null);
    this.confirmationError.set(null);

    this.appointmentsService.confirmAppointment(item.appointmentReference).subscribe({
      next: () => {
        this.confirmationMessage.set('Appointment confirmed successfully.');

        // Reload the appointment to retrieve its updated status.
        this.loadAppointment(item.appointmentId);
        this.isConfirming.set(false);
      },
      error: (error) => {
        console.error('Failed to confirm appointment:', error);

        this.confirmationError.set(error.error?.message || 'Unable to confirm this appointment.');

        this.isConfirming.set(false);
      },
    });
  }
  cancelAppointment(): void {
    const item = this.appointment();
    const reason = this.cancellationReason().trim();

    if (
      !item ||
      !['PENDING', 'CONFIRMED'].includes(item.statusCode) ||
      !reason ||
      this.isCancelling()
    ) {
      return;
    }

    this.isCancelling.set(true);
    this.cancellationMessage.set(null);
    this.cancellationError.set(null);

    this.appointmentsService.cancelAppointment(item.appointmentId, reason).subscribe({
      next: () => {
        this.cancellationMessage.set('Appointment cancelled successfully.');
        this.showCancellationForm.set(false);
        this.cancellationReason.set('');
        this.loadAppointment(item.appointmentId);
        this.isCancelling.set(false);
      },
      error: (error) => {
        console.error('Failed to cancel appointment:', error);
        this.cancellationError.set(error.error?.message || 'Unable to cancel this appointment.');
        this.isCancelling.set(false);
      },
    });
  }
  goBack(): void {
    void this.router.navigate(['/admin/appointments']);
  }
}
