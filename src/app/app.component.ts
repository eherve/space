import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from './_services/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { CustomIconService } from './_services/custom-icon.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { UserService } from './_services/user.service';
import * as moment from 'moment'; import { Subscription } from 'rxjs';
import { User } from './_classes/user';
import { filter } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('down', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)' }),  // initial
        animate('0.3s', style({ transform: 'translateY(0)' }))  // final
      ]),
      transition(':leave', [
        style({ transform: 'translateY(0)' }),  // initial
        animate('0.3s', style({ transform: 'translateY(-100%)' }))  // final
      ])
    ]),
    trigger('left', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)' }),  // initial
        animate('0.3s', style({ transform: 'translateX(0)' }))  // final
      ]),
      transition(':leave', [
        style({ transform: 'translateX(0)' }),  // initial
        animate('0.3s', style({ transform: 'translateX(-100%)' }))  // final
      ])
    ])
  ]
})
export class AppComponent implements OnInit, OnDestroy {

  public user: User;
  private userSubscription: Subscription;
  private routerSubscription: Subscription;

  constructor(
    private router: Router,
    private translate: TranslateService,
    private authService: AuthService,
    private userService: UserService,
    private customIconService: CustomIconService
  ) {
    this.init();
  }

  ngOnInit() {
    this.setUser(this.userService.$user.value);
    this.userSubscription = this.userService.$user.subscribe(user => this.setUser(user));
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.loadUser());
  }

  ngOnDestroy() {
    if (this.userService) { this.userSubscription.unsubscribe(); }
    if (this.routerSubscription) { this.routerSubscription.unsubscribe(); }
  }

  public logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private async init() {
    this.customIconService.init();
    this.translate.setDefaultLang('fr');
    this.translate.use('fr');
    moment.locale('fr');
    this.loadUser();
  }

  private async setUser(user: User) {
    this.user = user;
  }

  private async loadUser() {
    const authenticated = await this.authService.isAuthenticated();
    if (authenticated) { await this.userService.loadUser(); }
  }

}
