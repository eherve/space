import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { StorageService } from './storage.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  static AUTH_KEY = 'AUTH';
  public $authToken = new BehaviorSubject(null);

  constructor(
    private http: HttpClient,
    private storageService: StorageService,
    private userService: UserService
  ) {
    this.init();
  }

  public async login(username: string, password: string): Promise<boolean> {
    const res = await this.http.post<{ access_token: string }>(`${environment.apiUrl}/auth/login`, { username, password }).toPromise();
    await this.storageService.set(AuthService.AUTH_KEY, res.access_token);
    this.$authToken.next(res.access_token);
    return true;
  }

  public async logout() {

    // not needed in REST app but if you need to clean session stuff in server
    this.http.post<{ access_token: string }>(`${environment.apiUrl}/auth/logout`, {}).toPromise();

    await this.storageService.remove(AuthService.AUTH_KEY);
    this.$authToken.next(null);
    await this.userService.clearUser();
  }

  public async isAuthenticated(): Promise<boolean> {
    const authToken = await this.storageService.get(AuthService.AUTH_KEY);
    if (authToken !== this.$authToken.value) { this.$authToken.next(authToken); }
    return !!authToken;
  }

  private async init() {
    const data = await this.storageService.get(AuthService.AUTH_KEY);
    this.$authToken.next(data);
  }

}
