import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AdminBranch } from '../../../core/models/admin-branch.model';
import {
  BranchClosure,
  CreateBranchClosureRequest,
  UpdateBranchClosureRequest,
} from '../../../core/models/branch-closure.model';

import { DatePipe } from '@angular/common';
import { AdminBranchesService } from '../../../core/services/admin-branches.service';
import { BranchClosuresService } from '../../../core/services/branch-closures.service';

@Component({
  selector: 'app-branch-closures',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './branch-closures.component.html',
  styleUrl: './branch-closures.component.scss',
})
export class BranchClosures implements OnInit {
  private readonly branchesService = inject(AdminBranchesService);
  private readonly closuresService = inject(BranchClosuresService);

  readonly branches = signal<AdminBranch[]>([]);
  readonly closures = signal<BranchClosure[]>([]);

  readonly selectedBranchId = signal<number | null>(null);

  readonly isLoadingBranches = signal(false);
  readonly isLoadingClosures = signal(false);
  readonly isSaving = signal(false);
  readonly showForm = signal(false);
  readonly editingClosureId = signal<number | null>(null);

  readonly startDate = signal('');
  readonly endDate = signal('');
  readonly reason = signal('');

  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly activeBranches = computed(() => this.branches().filter((branch) => branch.isActive));

  ngOnInit(): void {
    this.loadBranches();
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

  selectBranch(branchId: number | null): void {
    this.selectedBranchId.set(branchId);
    this.closures.set([]);

    if (branchId === null) {
      return;
    }

    this.loadClosures(branchId);
  }

  loadClosures(branchId: number): void {
    this.isLoadingClosures.set(true);
    this.errorMessage.set(null);

    this.closuresService.getByBranch(branchId).subscribe({
      next: (closures) => {
        this.closures.set(closures);
        this.isLoadingClosures.set(false);
      },
      error: (error) => {
        console.error('Failed to load branch closures:', error);
        this.errorMessage.set('Unable to load branch closures.');
        this.isLoadingClosures.set(false);
      },
    });
  }
  openCreateForm(): void {
    this.editingClosureId.set(null);
    this.startDate.set('');
    this.endDate.set('');
    this.reason.set('');

    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.showForm.set(true);
  }

  openEditForm(closure: BranchClosure): void {
    this.editingClosureId.set(closure.branchClosureId);
    this.startDate.set(closure.startDate);
    this.endDate.set(closure.endDate);
    this.reason.set(closure.reason ?? '');

    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingClosureId.set(null);
  }

  saveClosure(): void {
    const branchId = this.selectedBranchId();

    if (branchId === null) {
      return;
    }

    if (!this.startDate() || !this.endDate() || this.endDate() < this.startDate()) {
      this.errorMessage.set('Please enter valid start and end dates.');
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    const closureId = this.editingClosureId();

    if (closureId === null) {
      const request: CreateBranchClosureRequest = {
        branchId,
        startDate: this.startDate(),
        endDate: this.endDate(),
        reason: this.reason().trim() || null,
      };

      this.closuresService.create(request).subscribe({
        next: () => this.onSaveSuccess('Branch closure created successfully.'),
        error: (error) => this.onSaveError(error),
      });
    } else {
      const request: UpdateBranchClosureRequest = {
        startDate: this.startDate(),
        endDate: this.endDate(),
        reason: this.reason().trim() || null,
      };

      this.closuresService.update(closureId, request).subscribe({
        next: () => this.onSaveSuccess('Branch closure updated successfully.'),
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
      this.loadClosures(branchId);
    }
  }

  private onSaveError(error: unknown): void {
    console.error('Failed to save branch closure:', error);
    this.isSaving.set(false);
    this.errorMessage.set('Unable to save branch closure. Please check the dates and try again.');
  }

  deleteClosure(closure: BranchClosure): void {
    const confirmed = confirm(
      `Are you sure you want to delete this closure (${closure.startDate} to ${closure.endDate})?`,
    );

    if (!confirmed) {
      return;
    }

    this.closuresService.delete(closure.branchClosureId).subscribe({
      next: () => {
        this.successMessage.set('Branch closure deleted successfully.');

        const branchId = this.selectedBranchId();

        if (branchId !== null) {
          this.loadClosures(branchId);
        }
      },
      error: (error) => {
        console.error('Failed to delete branch closure:', error);
        this.errorMessage.set('Unable to delete branch closure.');
      },
    });
  }
  readonly selectedBranchName = computed(
    () =>
      this.activeBranches().find((branch) => branch.branchId === this.selectedBranchId())
        ?.branchName ?? '',
  );
}
