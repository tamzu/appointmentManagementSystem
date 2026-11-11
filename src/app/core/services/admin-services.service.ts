import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  AdminService,
  CreateServiceRequest,
  UpdateServiceRequest,
} from '../models/admin-service.model';

@Injectable({
  providedIn: 'root',
})
export class AdminServicesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/services';

  getServices(): Observable<AdminService[]> {
    return this.http.get<AdminService[]>(this.apiUrl);
  }

  getService(serviceId: number): Observable<AdminService> {
    return this.http.get<AdminService>(`${this.apiUrl}/${serviceId}`);
  }

  createService(request: CreateServiceRequest): Observable<AdminService> {
    return this.http.post<AdminService>(this.apiUrl, request);
  }

  updateService(serviceId: number, request: UpdateServiceRequest): Observable<AdminService> {
    return this.http.put<AdminService>(`${this.apiUrl}/${serviceId}`, request);
  }

  deactivateService(serviceId: number): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/${serviceId}`);
  }
}
