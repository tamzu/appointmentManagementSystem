import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { CustomerIdentityDocumentService } from '../../../core/services/customer-identity-document.service';
import { CustomerService } from '../../../core/services/customer.service';

import { Router } from '@angular/router';
import { CustomerIdentityDocument } from '../../../core/models/customer-identity-document.model';
import { Customer } from '../../../core/models/customer.model';
import { BookingStateService } from '../../../core/services/booking-state.service';

@Component({
  selector: 'app-customer-details',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './customer-details.component.html',
  styleUrl: './customer-details.component.scss',
})
export class CustomerDetails {
  private readonly fb = inject(FormBuilder);
  private readonly customerService = inject(CustomerService);
  private readonly identityDocumentService = inject(CustomerIdentityDocumentService);
  private readonly bookingState = inject(BookingStateService);
  private readonly router = inject(Router);

  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly createdCustomer = signal<Customer | null>(null);
  readonly createdIdentityDocument = signal<CustomerIdentityDocument | null>(null);

  readonly customerForm = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s()-]{9,20}$/)]],
    documentType: ['RSA_ID', Validators.required],
    documentNumber: ['', [Validators.required, Validators.maxLength(30)]],
  });

  readonly documentTypes = [
    { label: 'South African ID', value: 'RSA_ID' },
    { label: 'Foreign Passport', value: 'PASSPORT' },
  ];

  get firstName() {
    return this.customerForm.controls.firstName;
  }

  get lastName() {
    return this.customerForm.controls.lastName;
  }

  get email() {
    return this.customerForm.controls.email;
  }

  get phoneNumber() {
    return this.customerForm.controls.phoneNumber;
  }

  get documentNumber() {
    return this.customerForm.controls.documentNumber;
  }

  onDocumentTypeChange(): void {
    this.documentNumber.reset('');
  }

  submit(): void {
    if (this.customerForm.invalid || this.saving()) {
      this.customerForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const formValue = this.customerForm.getRawValue();

    this.customerService
      .createCustomer({
        firstName: formValue.firstName.trim(),
        lastName: formValue.lastName.trim(),
        email: formValue.email.trim(),
        phoneNumber: formValue.phoneNumber.trim(),
      })
      .subscribe({
        next: (customer) => {
          this.createdCustomer.set(customer);
          this.bookingState.setRegisteredCustomer(customer);
          this.registerIdentityDocument(
            customer.customerId,
            formValue.documentType,
            formValue.documentNumber.trim(),
          );
        },
        error: (error) => {
          console.error('Customer registration failed:', error);

          this.errorMessage.set(
            error.error?.message ?? 'Unable to register customer. Please try again.',
          );

          this.saving.set(false);
        },
      });
  }

  private registerIdentityDocument(
    customerId: number,
    documentTypeCode: string,
    documentNumber: string,
  ): void {
    this.identityDocumentService
      .createIdentityDocument({
        customerId,
        documentTypeCode,
        issuingCountryCode: documentTypeCode === 'RSA_ID' ? 'ZA' : '',
        documentNumber,
      })
      .subscribe({
        next: (identityDocument) => {
          this.createdIdentityDocument.set(identityDocument);
          this.bookingState.setRegisteredIdentityDocument(identityDocument);
          this.successMessage.set('Customer and identity document registered successfully.');

          // Clear the sensitive document number from the form.
          this.customerForm.controls.documentNumber.reset('');
          this.saving.set(false);

          this.router.navigate(['/booking/confirmation']);
        },
        error: (error) => {
          console.error('Identity document registration failed:', error);

          this.errorMessage.set(
            error.error?.message ??
              'Customer registered, but identity document registration failed.',
          );

          this.saving.set(false);
        },
      });
  }
}
