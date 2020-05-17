import { Observable, of, throwError } from 'rxjs';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';

const users = [
  {
    id: '1', firstname: 'Test', lastname: 'Game', username: 'test', password: 'password',
    rights: [{ name: 'admin' }, { name: 'user' }]
  }
];


export function authenticate(username: string, password: string): Observable<any> {
  const user = users.find(x => x.username === username && x.password === password);
  if (!user) {
    return throwError({ error: { message: 'Username or password is incorrect' } });
  }
  localStorage.setItem(`${environment.appName}.MOCK.ME`, user.id);
  return of(new HttpResponse({
    status: 200,
    body: { access_token: user.id }
  }));
}

export function logout() {
  localStorage.removeItem(`${environment.appName}.MOCK.ME`)
  return of(true);
}

export function me(): Observable<any> {
  const current = localStorage.getItem(`${environment.appName}.MOCK.ME`);
  return current ? getUser(current) : throwError(new HttpErrorResponse({ status: 401 }));
}

export function getUser(id: string): Observable<any> {
  const user = users.find(x => x.id === id);
  if (!user) {
    return throwError(new HttpErrorResponse({ status: 404 }));
  }
  return of(new HttpResponse({
    status: 200,
    body: {
      id: user.id,
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      rights: user.rights
    }
  }));
}
