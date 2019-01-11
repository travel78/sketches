import { Injectable } from '@angular/core';

@Injectable()
export class TokenService {
  private _APIPublicID: string;
  private tokenJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMzEzOTE6MTAxMjpFQiBBZG1pbixFQiBDaGVjayBJbi9PdXQgUmVzb3VyY2VzLEVCIE1hc3RlciBBZG1pbiIsImV4cCI6IjE1NDU2MzA3MDMiLCJhdWQiOiI0OTk0QzgxMC02QUMyLTQ3NkYtQjUyQi04MjQ5NUUzRUNBNTgifQ.2YtKqlj7gxK9gMbRltLUXtY3VPECXQ6-3hDxRrbj2Xk';
  private tokenRefresh = 'e9e8db01bc5c4f9899dbce5dc1e13632';

  public getTokenFromCookies() {
    const tokenJWT = this.getCookie('eioboard_sso_jwt');
    const tokenRefresh = this.getCookie('eioboard_sso_refresh');
    this.deleteCookie('eioboard_sso_refresh');
    this.deleteCookie('eioboard_sso_jwt');
    if (tokenJWT && tokenRefresh) {
      localStorage.setItem('tokenJWT', tokenJWT);
      localStorage.setItem('tokenRefresh', tokenRefresh);
    } else {
      if (!localStorage.getItem('tokenJWT')) {
        localStorage.setItem('tokenJWT', this.tokenJWT);
        localStorage.setItem('tokenRefresh', this.tokenRefresh);
      }
    }
  }

  private getCookie(name): string | undefined {
    const matches = document.cookie.match(new RegExp(
      '(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
  }

  private deleteCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }

  public get APIPublicID() {
    return this._APIPublicID;
  }

  public set APIPublicID(id: string) {
    this._APIPublicID = id;
  }
}
