import { Injectable } from '@angular/core';
import { HttpClient, HttpHandler, HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import * as JwtDecode from 'jwt-decode';
import { environment } from '@env/environment';


@Injectable()
export class StatusService {
  private url = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) {
  }

  public loggedInAs() {
    const token = localStorage.getItem('jwt');
    if (token) {
      return this.getRole(token);
    }
    return null;
  }

  public getQrId() {
    try {
      const decoded: any = JwtDecode(localStorage.getItem('jwt'));
      return decoded.id;
    } catch {
      return null;
    }
  }

  public addToken(req: HttpRequest<any>, next: HttpHandler) {
    let jwt = localStorage.getItem('jwt');
    const uniqueId = localStorage.getItem('uniqueId');
    switch (this.shouldUpdateTokens(jwt)) {
      case true:
        return this.refreshTokens(jwt, localStorage.getItem('refresh')).pipe(
          switchMap((res: any) => {
            jwt = res.accessToken;
            localStorage.setItem('jwt', jwt);
            localStorage.setItem('refresh', res.refreshToken);

            const requestToForward1 = (req as HttpRequest<any>).clone({
              setHeaders: {
                Authorization: `Bearer ${jwt}`,
                'device-id': uniqueId
              }
            });
            return next.handle(requestToForward1);
          }),
          catchError(err => {
            if (err && err.status === 401) {
              localStorage.removeItem('jwt');
              localStorage.removeItem('refresh');
              setTimeout(
                () => this.router.navigate(['auth']),
                1000
              );
              return throwError(err);
            }
            return throwError(err);
          })
        );
      case false:
        const requestToForward2 = (req as HttpRequest<any>).clone({
          setHeaders: {
            Authorization: `Bearer ${jwt}`,
            'device-id': uniqueId
          }
        });
        return next.handle(requestToForward2);
      default:
        return throwError('Invalid token');
    }
  }

  private refreshTokens(jwt: any, refreshToken: any) {
    const uniqueId = localStorage.getItem('uniqueId');
    return this.http.post(`${this.url}auth/token`, {jwt, refreshToken},{headers: {'device-id': uniqueId}});
  }

  private isTokenFresh(decoded, timeout): boolean {
    const date = new Date(0);
    date.setUTCSeconds(decoded.exp);
    return date.valueOf() > (new Date().valueOf() - timeout);
  }

  private shouldUpdateTokens(jwt): boolean {
    try {
      const decoded: any = JwtDecode(jwt);
      return !this.isTokenFresh(decoded, 10000);
    } catch {
      return null;
    }
  }

  private getRole(jwt): string {
    try {
      const decoded: any = JwtDecode(jwt);
      if (this.isTokenFresh(decoded, 2592000000)) {
        return decoded.role;
      }
      return null;
    } catch {
      return null;
    }
  }
}
