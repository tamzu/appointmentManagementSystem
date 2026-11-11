import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AdminBranch } from '../../../core/models/admin-branch.model';
import {
  BranchOperatingHour,
  CreateBranchOperatingHourRequest,
  UpdateBranchOperatingHourRequest,
} from '../../../core/models/branch-operating-hour.model';

import { AdminBranchesService } from '../../../core/services/admin-branches.service';
import { BranchOperatingHoursService } from '../../../core/services/branch-operating-hours.service';

@Component({
  selector: 'app-operating-hours',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './operating-hours.component.html',
  styleUrl: './operating-hours.component.scss',
})
export class OperatingHours implements OnInit {
  private readonly branchesService = inject(AdminBranchesService);
  private readonly operatingHoursService = inject(BranchOperatingHoursService);

  readonly branches = signal<AdminBranch[]>([]);
  readonly operatingHours = signal<BranchOperatingHour[]>([]);

  readonly selectedBranchId = signal<number | null>(null);

  readonly isLoadingBranches = signal(false);
  readonly isLoadingHours = signal(false);
  readonly isSaving = signal(false);

  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly showForm = signal(false);
  readonly editingOperatingHourId = signal<number | null>(null);
  readonly formDayOfWeek = signal(1);
  readonly openingTime = signal('09:00');
  readonly closingTime = signal('17:00');
  readonly isClosed = signal(false);
  readonly days = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
  ];

  readonly activeBranches = computed(() => this.branches().filter((branch) => branch.isActive));

  ngOnInit(): void {
    this.loadBranches();
  }

  openForm(dayOfWeek: number): void {
    const existing = this.getOperatingHour(dayOfWeek);

    this.editingOperatingHourId.set(existing?.operatingHourId ?? null);
    this.formDayOfWeek.set(dayOfWeek);
    this.isClosed.set(existing?.isClosed ?? false);
    this.openingTime.set(existing?.openingTime?.substring(0, 5) ?? '09:00');
    this.closingTime.set(existing?.closingTime?.substring(0, 5) ?? '17:00');

    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingOperatingHourId.set(null);
  }

  saveOperatingHours(): void {
    const branchId = this.selectedBranchId();

    if (branchId === null) {
      return;
    }

    if (
      !this.isClosed() &&
      (!this.openingTime() || !this.closingTime() || this.openingTime() >= this.closingTime())
    ) {
      this.errorMessage.set('Please enter valid opening and closing times.');
      return;
    }

    const times = {
      openingTime: this.isClosed() ? null : this.openingTime(),
      closingTime: this.isClosed() ? null : this.closingTime(),
      isClosed: this.isClosed(),
    };

    this.isSaving.set(true);
    this.errorMessage.set(null);

    const operatingHourId = this.editingOperatingHourId();

    if (operatingHourId === null) {
      const request: CreateBranchOperatingHourRequest = {
        branchId,
        dayOfWeek: this.formDayOfWeek(),
        ...times,
      };

      this.operatingHoursService.create(request).subscribe({
        next: () => this.onSaveSuccess('Operating hours created successfully.'),
        error: (error) => this.onSaveError(error),
      });
    } else {
      const request: UpdateBranchOperatingHourRequest = {
        dayOfWeek: this.formDayOfWeek(),
        ...times,
      };

      this.operatingHoursService.update(operatingHourId, request).subscribe({
        next: () => this.onSaveSuccess('Operating hours updated successfully.'),
        error: (error) => this.onSaveError(error),
      });
    }
  }

  private onSaveSuccess(message: string): void {
    this.isSaving.set(false);
    this.showForm.set(false);
    this.successMessage.set(message);

    const branchId = this.selectedBranchId();

    if (branchId !== null) {
      this.loadOperatingHours(branchId);
    }
  }

  private onSaveError(error: unknown): void {
    console.error('Failed to save operating hours:', error);
    this.isSaving.set(false);
    this.errorMessage.set('Unable to save operating hours. Please try again.');
  }
  loadBranches(): void {
    this.isLoadingBranches.set(true);
    this.errorMessage.set(null);

    this.branchesService.getBranches().subscribe({
      next: (branches) => {
        this.branches.set(branches);
        this.isLoadingBranches.set(false);

        const firstBranch = branches.find((branch) => branch.isActive);

        if (firstBranch) {
          this.selectBranch(firstBranch.branchId);
        }
      },
      error: (error) => {
        console.error('Failed to load branches:', error);
        this.errorMessage.set('Unable to load branches.');
        this.isLoadingBranches.set(false);
      },
    });
  }

  readonly selectedBranchName = computed(
    () =>
      this.activeBranches().find((branch) => branch.branchId === this.selectedBranchId())
        ?.branchName ?? '',
  );

  selectBranch(branchId: number | null): void {
    this.selectedBranchId.set(branchId);
    this.operatingHours.set([]);

    if (branchId === null) {
      return;
    }

    this.loadOperatingHours(branchId);
  }

  loadOperatingHours(branchId: number): void {
    this.isLoadingHours.set(true);
    this.errorMessage.set(null);

    this.operatingHoursService.getByBranch(branchId).subscribe({
      next: (hours) => {
        this.operatingHours.set(hours);
        this.isLoadingHours.set(false);
      },
      error: (error) => {
        console.error('Failed to load operating hours:', error);
        this.errorMessage.set('Unable to load operating hours.');
        this.isLoadingHours.set(false);
      },
    });
  }

  getOperatingHour(dayOfWeek: number): BranchOperatingHour | undefined {
    return this.operatingHours().find((hour) => hour.dayOfWeek === dayOfWeek);
  }
}
