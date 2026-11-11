export interface AdminBranch {
  branchId: number;
  branchCode: string;
  branchName: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  province: string;
  postalCode: string | null;
  countryCode: string;
  phoneNumber: string | null;
  email: string | null;
  timeZoneId: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateBranchRequest {
  branchCode: string;
  branchName: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  province: string;
  postalCode: string | null;
  countryCode: string;
  phoneNumber: string | null;
  email: string | null;
  timeZoneId: string;
  isActive: boolean;
}
