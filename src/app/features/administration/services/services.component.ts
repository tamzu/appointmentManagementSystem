import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  AdminService,
  CreateServiceRequest,
  UpdateServiceRequest,
} from '../../../core/models/admin-service.model';

import { AdminServicesService } from '../../../core/services/admin-services.service';

@Component({
  selector: 'app-admin-services',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss',
})
export class Services implements OnInit {
  private readonly servicesService = inject(AdminServicesService);

  readonly services = signal<AdminService[]>([]);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);

  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly searchTerm = signal('');
  readonly showInactive = signal(false);

  readonly showForm = signal(false);
  readonly editingServiceId = signal<number | null>(null);

  readonly form = signal<CreateServiceRequest>({
    serviceCode: '',
    serviceName: '',
    description: null,
    durationMinutes: 30,
    isActive: true,
  });

  readonly filteredServices = computed(() => {
    const search = this.searchTerm().toLowerCase().trim();

    return this.services().filter((service) => {
      const matchesSearch =
        !search ||
        service.serviceCode.toLowerCase().includes(search) ||
        service.serviceName.toLowerCase().includes(search);

      const matchesStatus = this.showInactive() || service.isActive;

      return matchesSearch && matchesStatus;
    });
  });

  readonly activeCount = computed(
    () => this.services().filter((service) => service.isActive).length,
  );

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.servicesService.getServices().subscribe({
      next: (services) => {
        this.services.set(services);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load services:', error);
        this.errorMessage.set('Unable to load services.');
        this.isLoading.set(false);
      },
    });
  }

  openCreateForm(): void {
    this.editingServiceId.set(null);
    this.form.set({
      serviceCode: '',
      serviceName: '',
      description: null,
      durationMinutes: 30,
      isActive: true,
    });
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.showForm.set(true);
  }

  openEditForm(service: AdminService): void {
    this.editingServiceId.set(service.serviceId);
    this.form.set({
      serviceCode: service.serviceCode,
      serviceName: service.serviceName,
      description: service.description,
      durationMinutes: service.durationMinutes,
      isActive: service.isActive,
    });
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingServiceId.set(null);
  }

  updateServiceCode(value: string): void {
    this.form.update((f) => ({ ...f, serviceCode: value }));
  }

  updateServiceName(value: string): void {
    this.form.update((f) => ({ ...f, serviceName: value }));
  }

  updateDescription(value: string): void {
    this.form.update((f) => ({ ...f, description: value || null }));
  }

  updateDuration(value: number): void {
    this.form.update((f) => ({ ...f, durationMinutes: Number(value) }));
  }

  updateIsActive(value: boolean): void {
    this.form.update((f) => ({ ...f, isActive: value }));
  }
  deactivateService(service: AdminService): void {
    const confirmed = confirm(`Are you sure you want to deactivate "${service.serviceName}"?`);

    if (!confirmed) {
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.servicesService.deactivateService(service.serviceId).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.successMessage.set('Service deactivated successfully.');
        this.loadServices();
      },
      error: (error) => {
        console.error('Failed to deactivate service:', error);
        this.errorMessage.set(
          error.error?.detail || error.error?.title || 'Unable to deactivate service.',
        );
        this.isSaving.set(false);
      },
    });
  }
  saveService(): void {
    const request = this.form();

    if (
      !request.serviceCode.trim() ||
      !request.serviceName.trim() ||
      request.durationMinutes < 5 ||
      request.durationMinutes > 480
    ) {
      this.errorMessage.set(
        'Enter a service code, service name and duration between 5 and 480 minutes.',
      );
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const serviceId = this.editingServiceId();

    const saveRequest =
      serviceId === null
        ? this.servicesService.createService(request)
        : this.servicesService.updateService(serviceId, request as UpdateServiceRequest);

    saveRequest.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.closeForm();
        this.successMessage.set(
          serviceId === null ? 'Service created successfully.' : 'Service updated successfully.',
        );
        this.loadServices();
      },
      error: (error) => {
        console.error('Failed to save service:', error);
        this.errorMessage.set(
          error.error?.detail || error.error?.title || 'Unable to save service.',
        );
        this.isSaving.set(false);
      },
    });
  }
}
