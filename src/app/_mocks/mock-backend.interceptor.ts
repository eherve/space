// tslint:disable: no-console
import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, mergeMap, materialize, dematerialize } from 'rxjs/operators';
import { authenticate as login, getUser, me, logout } from './user';

@Injectable()
export class MockBackendInterceptor implements HttpInterceptor {

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const { url, method, headers, body } = request;

    return of(null)
      .pipe(mergeMap(handleRoute))
      .pipe(materialize())
      .pipe(delay(200))
      .pipe(dematerialize());

    function handleRoute() {
      console.debug('MockBackendInterceptor::handleRoute', { url, body });
      if (url.endsWith('/auth/login') && method === 'POST') {
        return login(body.username, body.password);
      }
      if (url.endsWith('/auth/logout') && method === 'POST') { return logout(); }
      if (url.endsWith('/users/me') && method === 'GET') { return me(); }
      if (url.match(/\/users\/[0-9a-zA-Z]+$/) && method === 'GET') {
        const id = url.substring(url.lastIndexOf('/') + 1);
        return getUser(id);
      }
      return next.handle(request);
    }

  }
}

export const mockBackendInterceptor = {
  provide: HTTP_INTERCEPTORS,
  useClass: MockBackendInterceptor,
  multi: true
};
