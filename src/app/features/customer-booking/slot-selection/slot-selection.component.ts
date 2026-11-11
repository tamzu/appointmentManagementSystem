import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AppointmentSlot } from '../../../core/models/appointment-slot.model';
import { AppointmentSlotService } from '../../../core/services/appointment-slot.service';
import { BookingStateService } from '../../../core/services/booking-state.service';

@Component({
  selector: 'app-slot-selection',
  imports: [],
  templateUrl: './slot-selection.component.html',
  styleUrl: './slot-selection.component.scss',
})
export class SlotSelection implements OnInit {
  private readonly slotService = inject(AppointmentSlotService);
  private readonly bookingState = inject(BookingStateService);
  private readonly router = inject(Router);

  readonly branch = this.bookingState.selectedBranch;
  readonly service = this.bookingState.selectedService;
  readonly selectedSlot = this.bookingState.selectedSlot;

  readonly slots = signal<AppointmentSlot[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly selectedDate = signal(this.getDateOffset(1));

  readonly selectedSlotId = computed(() => this.selectedSlot()?.slotId ?? null);

  readonly hasAvailableSlots = computed(() => this.slots().length > 0);
  constructor() {
    console.log('SlotSelection component initialized');
  }
  ngOnInit(): void {
    const branch = this.branch();
    const service = this.service();
    console.log('Slot screen - branch:', branch);
    console.log('Slot screen - service:', service);

    if (!branch || !service) {
      console.error('Booking state is incomplete.');
      this.router.navigate(['/booking/branches']);
      return;
    }
    console.log('Loading available slots...');
    this.loadAvailableSlots();
  }

  private getDateOffset(offset: number): string {
    const today = new Date().toLocaleDateString('en-CA', {
      timeZone: 'Africa/Johannesburg',
    });

    const [year, month, day] = today.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day + offset));

    return date.toISOString().slice(0, 10);
  }

  readonly minimumDate = this.getDateOffset(0);

  onDateChange(date: string): void {
    if (!date) {
      return;
    }

    this.selectedDate.set(date);
    this.bookingState.selectSlot(null);
    this.loadAvailableSlots();
  }

  loadAvailableSlots(): void {
    const branch = this.branch();
    const service = this.service();

    if (!branch || !service) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.slots.set([]);

    this.slotService
      .getAvailableSlots(branch.branchId, service.serviceId, this.selectedDate())
      .subscribe({
        next: (slots) => {
          console.log('Available slots returned:', slots);
          this.slots.set(slots.filter((slot) => slot.availableCapacity > 0));
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Failed to load appointment slots:', error);
          this.errorMessage.set('Unable to load appointment times. Please try again.');
          this.loading.set(false);
        },
      });
  }

  selectSlot(slot: AppointmentSlot): void {
    if (slot.availableCapacity <= 0) {
      return;
    }

    this.bookingState.selectSlot(slot);
  }

  isSelected(slot: AppointmentSlot): boolean {
    return this.selectedSlotId() === slot.slotId;
  }

  formatTime(dateTime: string): string {
    return new Intl.DateTimeFormat('en-ZA', {
      timeZone: 'Africa/Johannesburg',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).format(new Date(dateTime));
  }

  changeService(): void {
    this.router.navigate(['/booking/services']);
  }
  continueToCustomerDetails(): void {
    if (!this.selectedSlot()) {
      return;
    }

    this.router.navigate(['/booking/customer-details']);
  }
}
