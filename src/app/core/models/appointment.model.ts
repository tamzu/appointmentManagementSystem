export interface CreateAppointmentRequest {
  customerId: number;
  slotId: number;
  customerNotes: string;
}

export interface Appointment {
  appointmentId: number;
  appointmentReference: string;
  customerId: number;
  slotId: number;
  branchId: number;
  serviceId: number;
  startDateTime: string;
  endDateTime: string;
  statusCode: string;
  statusName: string;
  bookingDate: string;
  customerNotes: string;
}
