import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { BranchService } from './branch.service';

describe('BranchService', () => {
  let service: BranchService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BranchService, provideZonelessChangeDetection()],
    });

    service = TestBed.inject(BranchService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all branches', () => {
    const mockBranches = [
      {
        branchId: 1,
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
      },
    ];

    service.getBranches().subscribe((branches) => {
      expect(branches).toEqual(mockBranches);
    });

    const req = httpMock.expectOne('/api/Branches');
    expect(req.request.method).toBe('GET');
    req.flush(mockBranches);
  });

  it('should fetch a branch by id', () => {
    const mockBranch = {
      branchId: 1,
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

    service.getBranchById(1).subscribe((branch) => {
      expect(branch).toEqual(mockBranch);
    });

    const req = httpMock.expectOne('/api/Branches/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockBranch);
  });
});
