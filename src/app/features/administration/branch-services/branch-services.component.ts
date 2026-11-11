import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AdminBranchService } from '../../../core/models/admin-branch-service.model';
import { AdminBranch } from '../../../core/models/admin-branch.model';
import { AdminService } from '../../../core/models/admin-service.model';

import { AdminBranchServicesService } from '../../../core/services/admin-branch-services.service';
import { AdminBranchesService } from '../../../core/services/admin-branches.service';
import { AdminServicesService } from '../../../core/services/admin-services.service';

@Component({
  selector: 'app-branch-services',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './branch-services.component.html',
  styleUrl: './branch-services.component.scss',
})
export class BranchServices implements OnInit {
  private readonly branchesService = inject(AdminBranchesService);
  private readonly branchServicesService = inject(AdminBranchServicesService);
  private readonly servicesService = inject(AdminServicesService);

  readonly branches = signal<AdminBranch[]>([]);
  readonly branchServices = signal<AdminBranchService[]>([]);
  readonly availableServices = signal<AdminService[]>([]);

  readonly selectedBranchId = signal<number | null>(null);

  readonly isLoading = signal(false);
  readonly isSaving = signal(false);

  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly selectedServiceId = signal<number | null>(null);

  readonly filteredBranchServices = computed(() =>
    this.branchServices().filter((service) => service.branchId === this.selectedBranchId()),
  );

  readonly unassignedServices = computed(() => {
    const assignedIds = new Set(this.filteredBranchServices().map((x) => x.serviceId));

    return this.availableServices().filter(
      (service) => service.isActive && !assignedIds.has(service.serviceId),
    );
  });

  ngOnInit(): void {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.branchesService.getBranches().subscribe({
      next: (branches) => {
        console.log('Branches returned:', branches);

        const activeBranches = branches.filter((branch) => branch.isActive);

        console.log('Active branches:', activeBranches);

        this.branches.set(activeBranches);

        if (activeBranches.length > 0) {
          const firstBranchId = activeBranches[0].branchId;

          this.selectedBranchId.set(firstBranchId);
          this.loadBranchServices();
        } else {
          this.selectedBranchId.set(null);
          this.branchServices.set([]);
        }

        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load branches:', error);
        this.errorMessage.set('Unable to load branches.');
        this.isLoading.set(false);
      },
    });

    this.servicesService.getServices().subscribe({
      next: (services) => {
        console.log('Services returned:', services);
        this.availableServices.set(services);
      },
      error: (error) => {
        console.error('Failed to load services:', error);
        this.errorMessage.set('Unable to load services.');
      },
    });
  }

  onBranchChange(branchId: number | null): void {
    this.selectedBranchId.set(branchId);
    this.selectedServiceId.set(null);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    if (branchId !== null) {
      this.loadBranchServices();
    } else {
      this.branchServices.set([]);
    }
  }

  loadBranchServices(): void {
    const branchId = this.selectedBranchId();

    if (branchId === null) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.branchServicesService.getServicesByBranch(branchId).subscribe({
      next: (services) => {
        this.branchServices.set(services);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load branch services:', error);
        this.errorMessage.set('Unable to load branch services.');
        this.isLoading.set(false);
      },
    });
  }

  assignService(): void {
    const branchId = this.selectedBranchId();
    const serviceId = this.selectedServiceId();

    if (branchId === null || serviceId === null || this.isSaving()) {
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.branchServicesService
      .assignService({
        branchId,
        serviceId,
      })
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.selectedServiceId.set(null);
          this.successMessage.set('Service assigned successfully.');
          this.loadBranchServices();
        },
        error: (error) => {
          console.error('Failed to assign service:', error);
          this.errorMessage.set(error.error?.message || 'Unable to assign service.');
          this.isSaving.set(false);
        },
      });
  }

  toggleAvailability(branchService: AdminBranchService): void {
    if (this.isSaving()) {
      return;
    }

    const newAvailability = !branchService.isAvailable;

    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.branchServicesService
      .updateBranchService(branchService.branchServiceId, { isAvailable: newAvailability })
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.successMessage.set(
            newAvailability
              ? 'Service made available successfully.'
              : 'Service made unavailable successfully.',
          );

          this.loadBranchServices();
        },
        error: (error) => {
          console.error('Failed to update service:', error);
          this.errorMessage.set(error.error?.message || 'Unable to update service.');
          this.isSaving.set(false);
        },
      });
  }
}
