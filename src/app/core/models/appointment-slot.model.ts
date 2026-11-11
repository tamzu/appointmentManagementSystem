export interface AppointmentSlot {
  slotId: number;
  branchId: number;
  branchName: string;
  serviceId: number;
  serviceName: string;
  startDateTime: string;
  endDateTime: string;
  capacity: number;
  bookedCount: number;
  availableCapacity: number;
}
export interface GenerateAppointmentSlotsRequest {
  branchId: number;
  serviceId: number;
  startDate: string;
  endDate: string;
  capacity: number;
}

export interface GenerateAppointmentSlotsResponse {
  message: string;
  branchId: number;
  serviceId: number;
  startDate: string;
  endDate: string;
  generatedCount: number;
  skippedClosedDays: number;
  skippedPastSlots: number;
  skippedExistingSlots: number;
}
