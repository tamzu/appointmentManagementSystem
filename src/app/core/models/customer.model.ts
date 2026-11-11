export interface CreateCustomerRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export interface Customer {
  customerId: number;
  firstName: string;
  lastName: string;
  email: string | null;
  phoneNumber: string;
  createdAt: string;
  isActive: boolean;
}
