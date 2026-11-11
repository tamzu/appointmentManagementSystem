export interface AdminService {
  serviceId: number;
  serviceCode: string;
  serviceName: string;
  description: string | null;
  durationMinutes: number;
  isActive: boolean;
}

export interface CreateServiceRequest {
  serviceCode: string;
  serviceName: string;
  description: string | null;
  durationMinutes: number;
  isActive: boolean;
}

export interface UpdateServiceRequest {
  serviceCode: string;
  serviceName: string;
  description: string | null;
  durationMinutes: number;
  isActive: boolean;
}
