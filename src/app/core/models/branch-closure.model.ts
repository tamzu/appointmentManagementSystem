export interface BranchClosure {
  branchClosureId: number;
  branchId: number;
  branchName: string;
  startDate: string;
  endDate: string;
  reason: string | null;
  createdAt: string;
}

export interface CreateBranchClosureRequest {
  branchId: number;
  startDate: string;
  endDate: string;
  reason: string | null;
}

export interface UpdateBranchClosureRequest {
  startDate: string;
  endDate: string;
  reason: string | null;
}
