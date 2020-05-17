import { Injectable } from '@angular/core';
import { HttpInterceptor, HTTP_INTERCEPTORS, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { AuthService } from '../_services/auth.service';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptorClass implements HttpInterceptor {

  private auth: string;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.authService.$authToken.subscribe(auth => this.auth = auth);
    this.auth = authService.$authToken.value;
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const clonedRequest = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${this.auth}`)
    });
    return next.handle(clonedRequest).pipe(
      catchError(err => {
        if (err.status === 401) { this.authService.logout().then(() => this.router.navigate(['/login'])); }
        throw err;
      }));
  }

}

export const AuthInterceptor = {
  provide: HTTP_INTERCEPTORS,
  useClass: AuthInterceptorClass,
  multi: true
};
