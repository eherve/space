import { TestBed, inject } from '@angular/core/testing';

import { AuthGuard } from './auth.guard';
import { AppRoutingModule } from '../app-routing.module';
import { AuthService } from '../_services/auth.service';
import { Router } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

describe('AuthGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: APP_BASE_HREF, useValue: '/' }, AuthGuard],
      imports: [
        HttpClientModule,
        AppRoutingModule
      ]
    });
  });

  it('should ...', inject([AuthGuard, Router, AuthService], (guard: AuthGuard) => {
    expect(guard).toBeTruthy();
  }));
});
