import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { BranchServiceOption } from '../../../core/models/branch-service.model';
import { BookingStateService } from '../../../core/services/booking-state.service';
import { BranchServiceApi } from '../../../core/services/branch-service.service';

@Component({
  selector: 'app-service-selection',
  imports: [],
  templateUrl: './service-selection.component.html',
  styleUrl: './service-selection.component.scss',
})
export class ServiceSelection implements OnInit {
  private readonly branchServiceApi = inject(BranchServiceApi);
  private readonly bookingState = inject(BookingStateService);
  private readonly router = inject(Router);

  readonly branch = this.bookingState.selectedBranch;

  readonly services = signal<BranchServiceOption[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly selectedServiceId = computed(
    () => this.bookingState.selectedService()?.serviceId ?? null,
  );

  ngOnInit(): void {
    const selectedBranch = this.branch();

    if (!selectedBranch) {
      this.router.navigate(['/booking/branches']);
      return;
    }

    this.loadServices(selectedBranch.branchId);
  }

  loadServices(branchId: number): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.branchServiceApi.getServicesByBranch(branchId).subscribe({
      next: (services) => {
        this.services.set(services.filter((service) => service.isAvailable));
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load branch services:', error);
        this.errorMessage.set('Unable to load services. Please try again.');
        this.loading.set(false);
      },
    });
  }

  selectService(service: BranchServiceOption): void {
    this.bookingState.selectService(service);
  }

  isSelected(service: BranchServiceOption): boolean {
    return this.selectedServiceId() === service.serviceId;
  }

  changeBranch(): void {
    this.router.navigate(['/booking/branches']);
  }

  continueToSlots(): void {
    if (!this.bookingState.selectedService()) {
      return;
    }

    this.router.navigate(['/booking/slots']).then((success) => {
      console.log('Navigation successful:', success);
    });
  }
}
