import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { BookingStateService } from '../../../core/services/booking-state.service';
import { CustomerIdentityDocumentService } from '../../../core/services/customer-identity-document.service';
import { CustomerService } from '../../../core/services/customer.service';
import { CustomerDetails } from './customer-details.component';

describe('CustomerDetails', () => {
  let component: CustomerDetails;
  let fixture: ComponentFixture<CustomerDetails>;
  let customerService: jasmine.SpyObj<CustomerService>;
  let identityDocumentService: jasmine.SpyObj<CustomerIdentityDocumentService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    customerService = jasmine.createSpyObj<CustomerService>('CustomerService', ['createCustomer']);
    identityDocumentService = jasmine.createSpyObj<CustomerIdentityDocumentService>(
      'CustomerIdentityDocumentService',
      ['createIdentityDocument'],
    );
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [CustomerDetails],
      providers: [
        BookingStateService,
        provideZonelessChangeDetection(),
        { provide: CustomerService, useValue: customerService },
        { provide: CustomerIdentityDocumentService, useValue: identityDocumentService },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate the customer and identity document on submit', () => {
    const customer = {
      customerId: 12,
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      phoneNumber: '+27123456789',
      createdAt: '2025-01-01T00:00:00Z',
      isActive: true,
    };

    const identityDocument = {
      identityDocumentId: 99,
      customerId: 12,
      documentTypeCode: 'RSA_ID',
      documentTypeName: 'South African ID',
      maskedDocumentNumber: '****1234',
      issuingCountryCode: 'ZA',
      createdAt: '2025-01-01T00:00:00Z',
      isActive: true,
    };

    customerService.createCustomer.and.returnValue(of(customer));
    identityDocumentService.createIdentityDocument.and.returnValue(of(identityDocument));

    component.customerForm.setValue({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      phoneNumber: '+27123456789',
      documentType: 'RSA_ID',
      documentNumber: '9912345678901',
    });

    component.submit();

    expect(customerService.createCustomer).toHaveBeenCalledWith({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      phoneNumber: '+27123456789',
    });
    expect(identityDocumentService.createIdentityDocument).toHaveBeenCalledWith({
      customerId: 12,
      documentTypeCode: 'RSA_ID',
      issuingCountryCode: 'ZA',
      documentNumber: '9912345678901',
    });
    expect(router.navigate).toHaveBeenCalledWith(['/booking/confirmation']);
  });
});
