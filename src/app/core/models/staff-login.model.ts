export interface StaffLoginRequest {
  email: string;
  password: string;
}

export interface StaffLoginResponse {
  success: boolean;
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  expiresAt: string;
  email: string;
  fullName: string;
  roles: string[];
}
