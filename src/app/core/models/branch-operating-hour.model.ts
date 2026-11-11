export interface BranchOperatingHour {
  operatingHourId: number;
  branchId: number;
  branchName: string;
  dayOfWeek: number;
  dayName: string;
  openingTime: string | null;
  closingTime: string | null;
  isClosed: boolean;
}

export interface CreateBranchOperatingHourRequest {
  branchId: number;
  dayOfWeek: number;
  openingTime: string | null;
  closingTime: string | null;
  isClosed: boolean;
}

export interface UpdateBranchOperatingHourRequest {
  dayOfWeek: number;
  openingTime: string | null;
  closingTime: string | null;
  isClosed: boolean;
}
