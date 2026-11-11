export interface Branch {
  branchId: number;
  branchCode: string;
  branchName: string;

  addressLine1: string;
  addressLine2: string | null;

  city: string;
  province: string;
  postalCode: string;
  countryCode: string;

  phoneNumber: string;
  email: string;

  timeZoneId: string;
  isActive: boolean;

  createdAt: string;
}
