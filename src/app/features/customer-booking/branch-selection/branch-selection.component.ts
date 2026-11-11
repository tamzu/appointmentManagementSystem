import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { Branch } from '../../../core/models/branch.model';
import { BookingStateService } from '../../../core/services/booking-state.service';
import { BranchService } from '../../../core/services/branch.service';

@Component({
  selector: 'app-branch-selection',
  imports: [],
  templateUrl: './branch-selection.component.html',
  styleUrl: './branch-selection.component.scss',
})
export class BranchSelection implements OnInit {
  private readonly branchService = inject(BranchService);
  private readonly bookingState = inject(BookingStateService);
  private readonly router = inject(Router);

  readonly branches = signal<Branch[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly selectedBranchId = computed(() => this.bookingState.selectedBranch()?.branchId ?? null);

  ngOnInit(): void {
    this.loadBranches();
  }

  loadBranches(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.branchService.getBranches().subscribe({
      next: (branches) => {
        this.branches.set(branches.filter((branch) => branch.isActive));
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load branches:', error);
        this.errorMessage.set('Unable to load branches. Please try again.');
        this.loading.set(false);
      },
    });
  }

  selectBranch(branch: Branch): void {
    console.log('Selected branch:', branch);
    this.bookingState.selectBranch(branch);
    this.router.navigate(['/booking/services']).then((success) => {
      console.log('Navigation successful:', success);
    });
  }

  isSelected(branch: Branch): boolean {
    return this.selectedBranchId() === branch.branchId;
  }
}
