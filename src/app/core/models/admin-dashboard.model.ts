export interface AdminDashboardSummary {
  todaysAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  totalCustomers: number;
  statusSummary: AppointmentStatusSummary[];
  recentAppointments: RecentAppointment[];
}

export interface AppointmentStatusSummary {
  statusCode: string;
  statusName: string;
  count: number;
}

export interface RecentAppointment {
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
