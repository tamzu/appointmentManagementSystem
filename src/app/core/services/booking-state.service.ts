import { Injectable, signal } from '@angular/core';

import { AppointmentSlot } from '../models/appointment-slot.model';
import { Appointment } from '../models/appointment.model';
import { BranchServiceOption } from '../models/branch-service.model';
import { Branch } from '../models/branch.model';
import { CustomerIdentityDocument } from '../models/customer-identity-document.model';
import { Customer } from '../models/customer.model';

@Injectable({
  providedIn: 'root',
})
export class BookingStateService {
  readonly selectedBranch = signal<Branch | null>(null);

  readonly selectedService = signal<BranchServiceOption | null>(null);

  readonly selectedSlot = signal<AppointmentSlot | null>(null);
  readonly registeredCustomer = signal<Customer | null>(null);
  readonly createdAppointment = signal<Appointment | null>(null);

  readonly registeredIdentityDocument = signal<CustomerIdentityDocument | null>(null);
  selectBranch(branch: Branch): void {
    this.selectedBranch.set(branch);
    this.selectedService.set(null);
    this.selectedSlot.set(null);
  }

  selectService(service: BranchServiceOption): void {
    this.selectedService.set(service);
    this.selectedSlot.set(null);
  }

  selectSlot(slot: AppointmentSlot | null): void {
    this.selectedSlot.set(slot);
  }
  setRegisteredCustomer(customer: Customer): void {
    this.registeredCustomer.set(customer);
  }

  setRegisteredIdentityDocument(document: CustomerIdentityDocument): void {
    this.registeredIdentityDocument.set(document);
  }
  setCreatedAppointment(appointment: Appointment): void {
    this.createdAppointment.set(appointment);
  }
  clearBooking(): void {
    this.selectedBranch.set(null);
    this.selectedService.set(null);
    this.selectedSlot.set(null);
    this.registeredCustomer.set(null);
    this.registeredIdentityDocument.set(null);
    this.createdAppointment.set(null);
  }
}
