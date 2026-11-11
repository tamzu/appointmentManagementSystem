import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AdminBranch, CreateBranchRequest } from '../../../core/models/admin-branch.model';

import { AdminBranchesService } from '../../../core/services/admin-branches.service';

@Component({
  selector: 'app-branches',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './branches.component.html',
  styleUrl: './branches.component.scss',
})
export class Branches implements OnInit {
  private readonly branchesService = inject(AdminBranchesService);

  readonly branches = signal<AdminBranch[]>([]);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly searchTerm = signal('');

  readonly showForm = signal(false);
  readonly editingBranchId = signal<number | null>(null);

  branchForm: CreateBranchRequest = this.emptyBranchForm();

  readonly filteredBranches = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();

    if (!search) {
      return this.branches();
    }

    return this.branches().filter((branch) =>
      [
        branch.branchCode,
        branch.branchName,
        branch.city,
        branch.province,
        branch.phoneNumber,
        branch.email,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(search)),
    );
  });

  ngOnInit(): void {
    this.loadBranches();
  }

  private emptyBranchForm(): CreateBranchRequest {
    return {
      branchCode: '',
      branchName: '',
      addressLine1: '',
      addressLine2: null,
      city: '',
      province: '',
      postalCode: null,
      countryCode: 'ZA',
      phoneNumber: null,
      email: null,
      timeZoneId: 'South Africa Standard Time',
      isActive: true,
    };
  }

  loadBranches(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.branchesService.getBranches().subscribe({
      next: (branches) => {
        this.branches.set(branches);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load branches:', error);
        this.errorMessage.set(error.error?.message || 'Unable to load branches.');
        this.isLoading.set(false);
      },
    });
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
  }

  openCreateForm(): void {
    this.branchForm = this.emptyBranchForm();
    this.editingBranchId.set(null);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.showForm.set(true);
  }

  editBranch(branch: AdminBranch): void {
    this.branchForm = {
      branchCode: branch.branchCode,
      branchName: branch.branchName,
      addressLine1: branch.addressLine1,
      addressLine2: branch.addressLine2,
      city: branch.city,
      province: branch.province,
      postalCode: branch.postalCode,
      countryCode: branch.countryCode,
      phoneNumber: branch.phoneNumber,
      email: branch.email,
      timeZoneId: branch.timeZoneId,
      isActive: branch.isActive,
    };

    this.editingBranchId.set(branch.branchId);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.showForm.set(true);
  }

  closeForm(): void {
    if (this.isSaving()) {
      return;
    }

    this.showForm.set(false);
    this.editingBranchId.set(null);
    this.branchForm = this.emptyBranchForm();
  }
  deactivateBranch(branch: AdminBranch): void {
    const confirmed = window.confirm(`Are you sure you want to deactivate "${branch.branchName}"?`);

    if (!confirmed) {
      return;
    }

    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.branchesService.deactivateBranch(branch.branchId).subscribe({
      next: () => {
        this.successMessage.set(`${branch.branchName} deactivated successfully.`);

        this.loadBranches();
      },
      error: (error) => {
        console.error('Failed to deactivate branch:', error);

        this.errorMessage.set(error.error?.message || 'Unable to deactivate branch.');
      },
    });
  }
  saveBranch(): void {
    if (this.isSaving()) {
      return;
    }

    const request: CreateBranchRequest = {
      ...this.branchForm,
      branchCode: this.branchForm.branchCode.trim(),
      branchName: this.branchForm.branchName.trim(),
      addressLine1: this.branchForm.addressLine1.trim(),
      addressLine2: this.branchForm.addressLine2?.trim() || null,
      city: this.branchForm.city.trim(),
      province: this.branchForm.province.trim(),
      postalCode: this.branchForm.postalCode?.trim() || null,
      countryCode: this.branchForm.countryCode.trim().toUpperCase(),
      phoneNumber: this.branchForm.phoneNumber?.trim() || null,
      email: this.branchForm.email?.trim() || null,
      timeZoneId: this.branchForm.timeZoneId.trim(),
    };

    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const branchId = this.editingBranchId();

    const operation = branchId
      ? this.branchesService.updateBranch(branchId, request)
      : this.branchesService.createBranch(request);

    operation.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.showForm.set(false);

        this.successMessage.set(
          branchId ? 'Branch updated successfully.' : 'Branch created successfully.',
        );

        this.editingBranchId.set(null);
        this.branchForm = this.emptyBranchForm();

        this.loadBranches();
      },
      error: (error) => {
        console.error('Failed to save branch:', error);

        this.errorMessage.set(error.error?.message || 'Unable to save branch.');

        this.isSaving.set(false);
      },
    });
  }
}
