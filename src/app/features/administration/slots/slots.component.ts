import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AdminBranchesService } from '../../../core/services/admin-branches.service';
import { AdminServicesService } from '../../../core/services/admin-services.service';

import { AdminBranch } from '../../../core/models/admin-branch.model';
import { AdminService } from '../../../core/models/admin-service.model';
import { GenerateAppointmentSlotsResponse } from '../../../core/models/appointment-slot.model';
import { AppointmentSlotService } from '../../../core/services/appointment-slot.service';

@Component({
  selector: 'app-slots',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './slots.component.html',
  styleUrl: './slots.component.scss',
})
export class SlotsComponent implements OnInit {
  private readonly branchesService = inject(AdminBranchesService);
  private readonly servicesService = inject(AdminServicesService);
  private readonly appointmentSlotsService = inject(AppointmentSlotService);
  private successNotificationTimeout?: ReturnType<typeof setTimeout>;
  branches = signal<AdminBranch[]>([]);
  services = signal<AdminService[]>([]);
  generationResult = signal<GenerateAppointmentSlotsResponse | null>(null);

  selectedBranchId = signal<number | null>(null);
  selectedServiceId = signal<number | null>(null);

  startDate = signal('');
  endDate = signal('');
  capacity = signal(1);

  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  ngOnInit(): void {
    this.loadBranches();
  }

  loadBranches(): void {
    this.branchesService.getBranches().subscribe({
      next: (branches) => {
        this.branches.set(branches.filter((branch) => branch.isActive));
      },
      error: () => {
        this.errorMessage.set('Unable to load branches.');
      },
    });
  }

  dismissSuccessNotification(): void {
    if (this.successNotificationTimeout) {
      clearTimeout(this.successNotificationTimeout);
      this.successNotificationTimeout = undefined;
    }

    this.successMessage.set('');
  }
  onBranchChange(branchId: number | null): void {
    this.selectedBranchId.set(branchId);
    this.selectedServiceId.set(null);
    this.services.set([]);

    if (!branchId) {
      return;
    }

    this.servicesService.getServices().subscribe({
      next: (services) => {
        this.services.set(services.filter((service) => service.isActive));
      },
      error: () => {
        this.errorMessage.set('Unable to load services.');
      },
    });
  }

  generateSlots(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
    this.generationResult.set(null);

    if (!this.selectedBranchId()) {
      this.errorMessage.set('Please select a branch.');
      return;
    }

    if (!this.selectedServiceId()) {
      this.errorMessage.set('Please select a service.');
      return;
    }

    if (!this.startDate() || !this.endDate()) {
      this.errorMessage.set('Please select both start and end dates.');
      return;
    }

    if (this.endDate() < this.startDate()) {
      this.errorMessage.set('End date cannot be earlier than start date.');
      return;
    }

    if (this.capacity() < 1 || this.capacity() > 100) {
      this.errorMessage.set('Capacity must be between 1 and 100.');
      return;
    }

    const request = {
      branchId: this.selectedBranchId()!,
      serviceId: this.selectedServiceId()!,
      startDate: this.startDate(),
      endDate: this.endDate(),
      capacity: this.capacity(),
    };

    this.loading.set(true);

    this.appointmentSlotsService.generateSlots(request).subscribe({
      next: (response) => {
        this.generationResult.set(response);
        this.successMessage.set(response.message);
        this.loading.set(false);

        if (this.successNotificationTimeout) {
          clearTimeout(this.successNotificationTimeout);
        }

        this.successNotificationTimeout = setTimeout(() => {
          this.successMessage.set('');
          this.successNotificationTimeout = undefined;
        }, 5000);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message ?? 'Unable to generate appointment slots.');
        this.loading.set(false);
      },
    });
  }
}
