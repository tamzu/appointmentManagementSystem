import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import {
  CreateCustomerIdentityDocumentRequest,
  CustomerIdentityDocument,
} from '../models/customer-identity-document.model';

@Injectable({
  providedIn: 'root',
})
export class CustomerIdentityDocumentService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = '/api/customeridentitydocuments';

  createIdentityDocument(
    request: CreateCustomerIdentityDocumentRequest,
  ): Observable<CustomerIdentityDocument> {
    return this.http.post<CustomerIdentityDocument>(this.apiUrl, request);
  }
}
