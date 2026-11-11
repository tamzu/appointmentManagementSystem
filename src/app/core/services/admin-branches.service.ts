import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AdminBranch, CreateBranchRequest } from '../models/admin-branch.model';

@Injectable({
  providedIn: 'root',
})
export class AdminBranchesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/branches';

  getBranches(): Observable<AdminBranch[]> {
    return this.http.get<AdminBranch[]>(this.apiUrl);
  }

  getBranch(branchId: number): Observable<AdminBranch> {
    return this.http.get<AdminBranch>(`${this.apiUrl}/${branchId}`);
  }

  createBranch(request: CreateBranchRequest): Observable<AdminBranch> {
    return this.http.post<AdminBranch>(this.apiUrl, request);
  }

  updateBranch(branchId: number, request: CreateBranchRequest): Observable<AdminBranch> {
    return this.http.put<AdminBranch>(`${this.apiUrl}/${branchId}`, request);
  }

  deactivateBranch(branchId: number): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/${branchId}`);
  }
}
