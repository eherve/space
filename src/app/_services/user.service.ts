import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { User } from '../_classes/user';
import { environment } from '../../environments/environment';
import { ModelMapper } from 'model-mapper';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  static USER_KEY = 'USER';
  public $user = new BehaviorSubject(null);

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {
    this.init();
  }

  public async clearUser(): Promise<void> {
    await this.storageService.remove(UserService.USER_KEY);
    this.$user.next(null);
    return;
  }

  public async loadUser(): Promise<User> {
    const res = await this.http.get<any>(`${environment.apiUrl}/users/me`)
      .pipe(map(data => new ModelMapper(User).map(data)))
      .toPromise();
    this.storageService.set(UserService.USER_KEY, new ModelMapper(User).serialize(res));
    this.$user.next(res);
    return res;
  }

  private async init() {
    const data = await this.storageService.get(UserService.USER_KEY);
    this.$user.next(new ModelMapper(User).map(data));
  }

}
