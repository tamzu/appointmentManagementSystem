import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AppointmentSlot } from '../../../core/models/appointment-slot.model';
import { Appointment, CreateAppointmentRequest } from '../../../core/models/appointment.model';
import { BranchServiceOption } from '../../../core/models/branch-service.model';
import { Branch } from '../../../core/models/branch.model';
import { CustomerIdentityDocument } from '../../../core/models/customer-identity-document.model';
import { Customer } from '../../../core/models/customer.model';
import { AppointmentService } from '../../../core/services/appointment.service';
import { BookingStateService } from '../../../core/services/booking-state.service';
import { BookingConfirmation } from './booking-confirmation';

describe('BookingConfirmation', () => {
  let component: BookingConfirmation;
  let fixture: ComponentFixture<BookingConfirmation>;
  let bookingState: BookingStateService;
  let appointmentService: jasmine.SpyObj<AppointmentService>;
  let router: jasmine.SpyObj<Router>;

  const branch: Branch = {
    branchId: 10,
    branchCode: 'JHB',
    branchName: 'Johannesburg Central',
    addressLine1: '1 Main Road',
    addressLine2: null,
    city: 'Johannesburg',
    province: 'Gauteng',
    postalCode: '2000',
    countryCode: 'ZA',
    phoneNumber: '+27123456789',
    email: 'booking@branch.co.za',
    timeZoneId: 'Africa/Johannesburg',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  };

  const serviceOption: BranchServiceOption = {
    branchServiceId: 100,
    branchId: 10,
    branchCode: 'JHB',
    branchName: 'Johannesburg Central',
    serviceId: 55,
    serviceCode: 'CONS',
    serviceName: 'Consultation',
    durationMinutes: 30,
    isAvailable: true,
  };

  const slot: AppointmentSlot = {
    slotId: 200,
    branchId: 10,
    branchName: 'Johannesburg Central',
    serviceId: 55,
    serviceName: 'Consultation',
    startDateTime: '2025-03-11T09:30:00Z',
    endDateTime: '2025-03-11T10:00:00Z',
    capacity: 5,
    bookedCount: 2,
    availableCapacity: 3,
  };

  const customer: Customer = {
    customerId: 42,
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@example.com',
    phoneNumber: '+27721234567',
    createdAt: '2024-03-01T09:00:00Z',
    isActive: true,
  };

  const identityDocument: CustomerIdentityDocument = {
    identityDocumentId: 77,
    customerId: 42,
    documentTypeCode: 'ID',
    documentTypeName: 'South African ID',
    maskedDocumentNumber: '******1234',
    issuingCountryCode: 'ZA',
    createdAt: '2024-03-01T09:10:00Z',
    isActive: true,
  };

  function seedBookingState(): void {
    bookingState.selectedBranch.set(branch);
    bookingState.selectedService.set(serviceOption);
    bookingState.selectedSlot.set(slot);
    bookingState.setRegisteredCustomer(customer);
    bookingState.setRegisteredIdentityDocument(identityDocument);
  }

  beforeEach(async () => {
    appointmentService = jasmine.createSpyObj<AppointmentService>('AppointmentService', [
      'createAppointment',
    ]);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [BookingConfirmation],
      providers: [
        BookingStateService,
        provideZonelessChangeDetection(),
        { provide: AppointmentService, useValue: appointmentService },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    bookingState = TestBed.inject(BookingStateService);
    bookingState.clearBooking();
    seedBookingState();

    fixture = TestBed.createComponent(BookingConfirmation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create when the booking details are complete', () => {
    expect(component).toBeTruthy();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to the branch selection page when booking data is incomplete', () => {
    bookingState.clearBooking();

    fixture = TestBed.createComponent(BookingConfirmation);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(router.navigate).toHaveBeenCalledWith(['/booking/branches']);
  });

  it('should format the date and time using the Johannesburg timezone', () => {
    const expectedDate = new Intl.DateTimeFormat('en-ZA', {
      timeZone: 'Africa/Johannesburg',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(slot.startDateTime));

    const expectedTime = new Intl.DateTimeFormat('en-ZA', {
      timeZone: 'Africa/Johannesburg',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).format(new Date(slot.startDateTime));

    expect(component.formatDate(slot.startDateTime)).toBe(expectedDate);
    expect(component.formatTime(slot.startDateTime)).toBe(expectedTime);
  });

  it('should create the appointment and store the new booking when the request succeeds', () => {
    const createdAppointment: Appointment = {
      appointmentId: 881,
      appointmentReference: 'ABC-123-XYZ',
      customerId: customer.customerId,
      slotId: slot.slotId,
      branchId: branch.branchId,
      serviceId: serviceOption.serviceId,
      startDateTime: slot.startDateTime,
      endDateTime: slot.endDateTime,
      statusCode: 'BOOKED',
      statusName: 'Booked',
      bookingDate: '2025-03-09T12:00:00Z',
      customerNotes: 'Needs wheelchair access',
    };

    const request: CreateAppointmentRequest = {
      customerId: customer.customerId,
      slotId: slot.slotId,
      customerNotes: 'Needs wheelchair access',
    };

    appointmentService.createAppointment.and.returnValue(of(createdAppointment));
    component.customerNotes.set('Needs wheelchair access');

    component.confirmAppointment();

    expect(appointmentService.createAppointment).toHaveBeenCalledWith(request);
    expect(component.appointment()).toEqual(createdAppointment);
    expect(component.errorMessage()).toBeNull();
    expect(component.saving()).toBeFalse();
  });

  it('should keep the error message when the appointment creation fails', () => {
    appointmentService.createAppointment.and.returnValue(
      throwError(() => ({
        error: { message: 'Unable to create your appointment. Please try again.' },
      })),
    );

    component.confirmAppointment();

    expect(component.errorMessage()).toBe('Unable to create your appointment. Please try again.');
    expect(component.saving()).toBeFalse();
  });

  it('should ignore confirmation attempts when the booking is incomplete or the save is already in progress', () => {
    bookingState.clearBooking();
    component.confirmAppointment();
    expect(appointmentService.createAppointment).not.toHaveBeenCalled();

    seedBookingState();
    component.saving.set(true);
    component.confirmAppointment();
    expect(appointmentService.createAppointment).not.toHaveBeenCalled();
  });
});
