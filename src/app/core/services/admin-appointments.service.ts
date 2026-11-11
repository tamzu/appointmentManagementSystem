import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  AdminAppointment,
  AdminAppointmentDetails,
  AdminAppointmentFilters,
  PagedResponse,
} from '../models/admin-appointment.model';

@Injectable({
  providedIn: 'root',
})
export class AdminAppointmentsService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = '/api/admin/appointments';

  getAppointments(filters: AdminAppointmentFilters): Observable<PagedResponse<AdminAppointment>> {
    let params = new HttpParams().set('page', filters.page).set('pageSize', filters.pageSize);

    if (filters.search?.trim()) {
      params = params.set('search', filters.search.trim());
    }

    if (filters.status) {
      params = params.set('status', filters.status);
    }

    if (filters.dateFrom) {
      params = params.set('dateFrom', filters.dateFrom);
    }

    if (filters.dateTo) {
      params = params.set('dateTo', filters.dateTo);
    }

    return this.http.get<PagedResponse<AdminAppointment>>(this.apiUrl, { params });
  }

  getAppointmentDetails(appointmentId: number): Observable<AdminAppointmentDetails> {
    return this.http.get<AdminAppointmentDetails>(`${this.apiUrl}/${appointmentId}`);
  }
  confirmAppointment(reference: string, comments: string | null = null): Observable<unknown> {
    return this.http.post(`/api/appointments/reference/${reference}/confirm`, { comments });
  }

  cancelAppointment(appointmentId: number, cancellationReason: string): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/${appointmentId}/cancel`, { cancellationReason });
  }
}
