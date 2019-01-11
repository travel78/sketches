import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../../../environments/environment';

@Injectable()
export class ApiService {
  private url = environment.relativePath;

  constructor(private http: HttpClient) {
  }
  public refreshTokens(jwt: string, refresh: string, APIPublicID: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'SecurityType': 'JWT',
        'Authorization': 'Bearer ' + jwt,
        'APIPublicID': APIPublicID,
        'RefreshToken': refresh

      })
    };
    return this.http.get<any>(`${this.url}/api/authorize`, httpOptions);
  }

  public getTokens(login, password, APIPublicID) {
    const base64 = btoa(login + ':' + password);
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'SecurityType': 'JWT',
        'Authorization': 'Basic ' + base64,
        'APIPublicID': APIPublicID
      })
    };
    return this.http.get<any>(`${this.url}/api/authorize`, httpOptions);
  }
}
