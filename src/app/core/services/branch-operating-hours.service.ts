import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  BranchOperatingHour,
  CreateBranchOperatingHourRequest,
  UpdateBranchOperatingHourRequest,
} from '../models/branch-operating-hour.model';

@Injectable({
  providedIn: 'root',
})
export class BranchOperatingHoursService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/branchoperatinghours';

  getByBranch(branchId: number): Observable<BranchOperatingHour[]> {
    return this.http.get<BranchOperatingHour[]>(`${this.apiUrl}/branch/${branchId}`);
  }

  getById(operatingHourId: number): Observable<BranchOperatingHour> {
    return this.http.get<BranchOperatingHour>(`${this.apiUrl}/${operatingHourId}`);
  }

  create(request: CreateBranchOperatingHourRequest): Observable<unknown> {
    return this.http.post(this.apiUrl, request);
  }

  update(operatingHourId: number, request: UpdateBranchOperatingHourRequest): Observable<unknown> {
    return this.http.put(`${this.apiUrl}/${operatingHourId}`, request);
  }

  delete(operatingHourId: number): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/${operatingHourId}`);
  }
}
