import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Branch } from '../models/branch.model';

@Injectable({
  providedIn: 'root',
})
export class BranchService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = '/api/Branches';

  getBranches(): Observable<Branch[]> {
    return this.http.get<Branch[]>(this.apiUrl);
  }

  getBranchById(branchId: number): Observable<Branch> {
    return this.http.get<Branch>(`${this.apiUrl}/${branchId}`);
  }
}
