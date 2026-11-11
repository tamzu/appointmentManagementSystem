import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Appointment } from '../../../core/models/appointment.model';
import { AppointmentService } from '../../../core/services/appointment.service';
import { BookingStateService } from '../../../core/services/booking-state.service';

@Component({
  selector: 'app-booking-confirmation',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './booking-confirmation.html',
  styleUrl: './booking-confirmation.scss',
})
export class BookingConfirmation {
  private readonly bookingState = inject(BookingStateService);
  private readonly appointmentService = inject(AppointmentService);
  private readonly router = inject(Router);

  readonly branch = this.bookingState.selectedBranch;
  readonly service = this.bookingState.selectedService;
  readonly slot = this.bookingState.selectedSlot;
  readonly customer = this.bookingState.registeredCustomer;
  readonly identityDocument = this.bookingState.registeredIdentityDocument;
  readonly appointment = this.bookingState.createdAppointment;

  readonly customerNotes = signal('');
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly pdfGenerating = signal(false);
  readonly pdfErrorMessage = signal<string | null>(null);

  readonly canConfirm = computed(
    () =>
      !!this.branch() &&
      !!this.service() &&
      !!this.slot() &&
      !!this.customer() &&
      !!this.identityDocument(),
  );

  constructor() {
    if (!this.canConfirm()) {
      this.router.navigate(['/booking/branches']);
    }
  }

  formatDate(dateTime: string): string {
    return new Intl.DateTimeFormat('en-ZA', {
      timeZone: 'Africa/Johannesburg',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateTime));
  }

  formatTime(dateTime: string): string {
    return new Intl.DateTimeFormat('en-ZA', {
      timeZone: 'Africa/Johannesburg',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).format(new Date(dateTime));
  }

  confirmAppointment(): void {
    if (!this.canConfirm() || this.saving() || this.appointment()) {
      return;
    }

    const customer = this.customer();
    const slot = this.slot();

    if (!customer || !slot) {
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    this.appointmentService
      .createAppointment({
        customerId: customer.customerId,
        slotId: slot.slotId,
        customerNotes: this.customerNotes().trim(),
      })
      .subscribe({
        next: (appointment: Appointment) => {
          this.bookingState.setCreatedAppointment(appointment);
          this.saving.set(false);
        },
        error: (error) => {
          console.error('Appointment creation failed:', error);

          this.errorMessage.set(
            error.error?.message ?? 'Unable to create your appointment. Please try again.',
          );

          this.saving.set(false);
        },
      });
  }

  printConfirmation(): void {
    window.print();
  }

  bookAnotherAppointment(): void {
    this.bookingState.clearBooking();
    this.router.navigate(['/booking/branches']);
  }

  async downloadConfirmationPdf(): Promise<void> {
    const booking = this.appointment();
    const branch = this.branch();
    const service = this.service();
    const slot = this.slot();
    const customer = this.customer();
    const document = this.identityDocument();

    if (!booking || !branch || !service || !slot || !customer || !document) {
      return;
    }

    if (this.pdfGenerating()) {
      return;
    }

    this.pdfGenerating.set(true);
    this.pdfErrorMessage.set(null);

    try {
      const { jsPDF } = await import('jspdf');

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 18;
      const contentWidth = pageWidth - margin * 2;
      let y = 20;

      // Header
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(20);
      pdf.text('APPOINTMENT CONFIRMATION', margin, y);

      y += 10;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text('Customer Appointment Receipt', margin, y);

      y += 12;

      pdf.setDrawColor(180, 190, 205);
      pdf.line(margin, y, pageWidth - margin, y);

      y += 12;

      // Appointment reference
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.text('APPOINTMENT REFERENCE', margin, y);

      y += 7;

      pdf.setFontSize(14);
      pdf.setTextColor(29, 78, 216);
      pdf.text(booking.appointmentReference, margin, y);

      y += 8;

      pdf.setTextColor(0, 0, 0);

      // Helper for sections
      const addSection = (heading: string): void => {
        y += 7;

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.text(heading, margin, y);

        y += 3;

        pdf.setDrawColor(210, 215, 225);
        pdf.line(margin, y, pageWidth - margin, y);

        y += 7;
      };

      // Helper for individual rows
      const addRow = (label: string, value: string | null | undefined): void => {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.text(label, margin, y);

        pdf.setFont('helvetica', 'normal');

        const lines = pdf.splitTextToSize(value || '-', contentWidth - 55);

        pdf.text(lines, margin + 55, y);

        y += Math.max(6, lines.length * 5);
      };

      // Branch
      addSection('BRANCH INFORMATION');

      addRow('Branch', branch.branchName);
      addRow('Branch Code', branch.branchCode);
      addRow(
        'Address',
        [branch.addressLine1, branch.addressLine2, branch.city, branch.province, branch.postalCode]
          .filter(Boolean)
          .join(', '),
      );
      addRow('Contact Number', branch.phoneNumber);

      // Service
      addSection('SERVICE INFORMATION');

      addRow('Service', service.serviceName);
      addRow('Duration', `${service.durationMinutes} minutes`);

      // Appointment
      addSection('APPOINTMENT DETAILS');

      addRow('Date', this.formatDate(slot.startDateTime));
      addRow('Start Time', this.formatTime(slot.startDateTime));
      addRow('End Time', this.formatTime(slot.endDateTime));
      addRow('Time Zone', 'South African Standard Time (SAST)');
      addRow('Status', booking.statusName);

      // Customer
      addSection('CUSTOMER INFORMATION');

      addRow('Full Name', `${customer.firstName} ${customer.lastName}`);
      addRow('Email', customer.email);
      addRow('Phone', customer.phoneNumber);
      addRow('Document Type', document.documentTypeName);
      addRow('Document Number', document.maskedDocumentNumber);

      // Notes
      if (booking.customerNotes?.trim()) {
        addSection('ADDITIONAL NOTES');
        addRow('Notes', booking.customerNotes);
      }

      // Footer
      y += 12;

      pdf.setDrawColor(180, 190, 205);
      pdf.line(margin, y, pageWidth - margin, y);

      y += 8;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.text('Please keep this reference number for future enquiries.', margin, y);

      pdf.save(`Appointment-${booking.appointmentReference}.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);

      this.pdfErrorMessage.set('Unable to generate the PDF. Please try again.');
    } finally {
      this.pdfGenerating.set(false);
    }
  }
}
