import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  AppointmentSlot,
  GenerateAppointmentSlotsRequest,
  GenerateAppointmentSlotsResponse,
} from '../models/appointment-slot.model';

@Injectable({
  providedIn: 'root',
})
export class AppointmentSlotService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/appointmentslots';

  getAvailableSlots(
    branchId: number,
    serviceId: number,
    date: string,
  ): Observable<AppointmentSlot[]> {
    const params = new HttpParams()
      .set('branchId', branchId)
      .set('serviceId', serviceId)
      .set('date', date);

    return this.http.get<AppointmentSlot[]>(`${this.apiUrl}/available`, { params });
  }

  generateSlots(
    request: GenerateAppointmentSlotsRequest,
  ): Observable<GenerateAppointmentSlotsResponse> {
    return this.http.post<GenerateAppointmentSlotsResponse>(`${this.apiUrl}/generate`, request);
  }
}
