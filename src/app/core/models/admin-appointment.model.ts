export interface AdminAppointment {
  appointmentId: number;
  appointmentReference: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;
  branchName: string;
  serviceName: string;
  statusCode: string;
  statusName: string;
  appointmentDateTime: string;
  createdAt: string;
}

export interface PagedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export interface AdminAppointmentFilters {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}
export interface AdminAppointmentDetails {
  appointmentId: number;
  appointmentReference: string;

  customerId: number;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;

  branchId: number;
  branchName: string;
  branchCode: string;
  branchAddress: string;
  branchCity: string;
  branchProvince: string;

  serviceId: number;
  serviceName: string;
  serviceDescription: string | null;
  serviceDurationMinutes: number;

  slotId: number;
  appointmentDateTime: string;
  appointmentEndDateTime: string;
  bookingDate: string;
  statusCode: string;
  statusName: string;
  customerNotes: string | null;
  cancellationReason: string | null;
  cancelledAt: string | null;

  createdAt: string;
  updatedAt: string | null;
}
