import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  BranchClosure,
  CreateBranchClosureRequest,
  UpdateBranchClosureRequest,
} from '../models/branch-closure.model';

@Injectable({
  providedIn: 'root',
})
export class BranchClosuresService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/branchclosures';

  getByBranch(branchId: number): Observable<BranchClosure[]> {
    return this.http.get<BranchClosure[]>(`${this.apiUrl}/branch/${branchId}`);
  }

  getById(branchClosureId: number): Observable<BranchClosure> {
    return this.http.get<BranchClosure>(`${this.apiUrl}/${branchClosureId}`);
  }

  create(request: CreateBranchClosureRequest): Observable<unknown> {
    return this.http.post(this.apiUrl, request);
  }

  update(branchClosureId: number, request: UpdateBranchClosureRequest): Observable<unknown> {
    return this.http.put(`${this.apiUrl}/${branchClosureId}`, request);
  }

  delete(branchClosureId: number): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/${branchClosureId}`);
  }
}
