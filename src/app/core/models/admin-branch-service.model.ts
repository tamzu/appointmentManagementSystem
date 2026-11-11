export interface AdminBranchService {
  branchServiceId: number;
  branchId: number;
  branchCode: string;
  branchName: string;
  serviceId: number;
  serviceCode: string;
  serviceName: string;
  durationMinutes: number;
  isAvailable: boolean;
}

export interface CreateBranchServiceRequest {
  branchId: number;
  serviceId: number;
}

export interface UpdateBranchServiceRequest {
  isAvailable: boolean;
}
