export interface CreateCustomerIdentityDocumentRequest {
  customerId: number;
  documentTypeCode: string;
  issuingCountryCode: string;
  documentNumber: string;
}

export interface CustomerIdentityDocument {
  identityDocumentId: number;
  customerId: number;
  documentTypeCode: string;
  documentTypeName: string;
  maskedDocumentNumber: string;
  issuingCountryCode: string;
  createdAt: string;
  isActive: boolean;
}
