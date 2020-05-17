import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { snakeCase } from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  static PREFIX = snakeCase(environment.appName).toUpperCase();

  constructor() { }

  public async set(key: string, value: any): Promise<void> {
    localStorage.setItem(this.key(key), JSON.stringify(value));
    return Promise.resolve();
  }

  public async get(key: string): Promise<any> {
    const data = localStorage.getItem(this.key(key));
    const res = data ? JSON.parse(data) : null;
    return Promise.resolve(res);
  }

  public async remove(key: string): Promise<void> {
    localStorage.removeItem(this.key(key));
    return Promise.resolve();
  }

  private key(key: string): string {
    return `${StorageService.PREFIX}.${key}`;
  }

}
