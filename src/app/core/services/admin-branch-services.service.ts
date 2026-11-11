import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  AdminBranchService,
  CreateBranchServiceRequest,
  UpdateBranchServiceRequest,
} from '../models/admin-branch-service.model';

@Injectable({
  providedIn: 'root',
})
export class AdminBranchServicesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/branchservices';

  getBranchServices(): Observable<AdminBranchService[]> {
    return this.http.get<AdminBranchService[]>(this.apiUrl);
  }

  getServicesByBranch(branchId: number): Observable<AdminBranchService[]> {
    return this.http.get<AdminBranchService[]>(`${this.apiUrl}/branch/${branchId}`);
  }

  assignService(request: CreateBranchServiceRequest): Observable<unknown> {
    return this.http.post(this.apiUrl, request);
  }

  updateBranchService(
    branchServiceId: number,
    request: UpdateBranchServiceRequest,
  ): Observable<unknown> {
    return this.http.put(`${this.apiUrl}/${branchServiceId}`, request);
  }

  deactivateBranchService(branchServiceId: number): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/${branchServiceId}`);
  }
}
