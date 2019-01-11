import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { MatDialog } from '@angular/material';
import * as jwtDecoder from 'jwt-decode';

import { ApiService } from './api.service';
import { TokenService } from './token.service';
import { LoginComponent } from '../../login/login.component';

@Injectable()
export class InterceptorService implements HttpInterceptor {
  private jwtName = 'tokenJWT';
  private refreshName = 'tokenRefresh';

    constructor(private api: ApiService, private tokenService: TokenService, public dialog: MatDialog) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const re = /authorize/gi;
    if (req.url.search(re) === -1) {
      return this.setToken(req, next);
    }
    return next.handle(req);
  }


  private setToken(req: HttpRequest<any>, next: HttpHandler) {
    switch (this.tokenStatus(this.getJwt())) {
      case 1:
        const requestToForward = (req as HttpRequest<any>).clone({
          setHeaders: {
            Authorization: `Bearer ${this.getJwt()}`,
            SecurityType: 'JWT',
            APIPublicID: this.tokenService.APIPublicID
          }
        });
        return next.handle(requestToForward);
      case 2:
        return this.api.refreshTokens(this.getJwt(), this.getRefresh(), this.tokenService.APIPublicID).pipe(
          switchMap((res) => {
            localStorage.setItem(this.jwtName, res.JWT);
            localStorage.setItem(this.refreshName, res.Refresh);
            const requestToForward2 = (req as HttpRequest<any>).clone({
              setHeaders: {
                Authorization: `Bearer ${this.getJwt()}`,
                SecurityType: 'JWT',
                APIPublicID: this.tokenService.APIPublicID
              }
            });
            return next.handle(requestToForward2);
          }),
          catchError(err => {
            this.goToMainPage();
            return throwError(err);
          })
        );
      case 3:
        this.goToMainPage();
        return throwError('');
    }
  }

  private getJwt(): string {
    return localStorage.getItem(this.jwtName);
  }

  private getRefresh(): string {
    return localStorage.getItem(this.refreshName);
  }

  // 1: token is fresh 2: token is not fresh 3: token is not found
  private tokenStatus(jwt): number {
    try {
      if (this.isTokenFresh(jwtDecoder(jwt))) {
        return 1;
      }
      return 2;
    } catch (e) {
      return 3;
    }
  }


  private isTokenFresh(decoded): boolean {
    const date = new Date(0);
    date.setUTCSeconds(decoded.exp);
    this.tokenService.APIPublicID = decoded.aud;
    return date.valueOf() > (new Date().valueOf() - 10000);
  }

  private goToMainPage() {
    if (window.opener) {
      window.open(window.opener.location, '_top');
    } else {
      this.dialog.open(LoginComponent);
    }

  }
}
