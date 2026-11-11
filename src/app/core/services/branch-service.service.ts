import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { BranchServiceOption } from '../models/branch-service.model';

@Injectable({
  providedIn: 'root',
})
export class BranchServiceApi {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/BranchServices';

  getServicesByBranch(branchId: number): Observable<BranchServiceOption[]> {
    return this.http.get<BranchServiceOption[]>(`${this.apiUrl}/branch/${branchId}`);
  }
}
