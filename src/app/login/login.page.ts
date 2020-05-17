import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../_services/auth.service';
import { Observable } from 'rxjs';
import { UserService } from '../_services/user.service';

@Component({
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage implements OnInit {

  public img: Observable<any>;
  public formGroup: FormGroup;
  public loading = false;
  public returnUrl: string;
  public error: string;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private userService: UserService
  ) {
  }

  async ngOnInit() {
    this.formGroup = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
    if (await this.authService.isAuthenticated()) { return this.router.navigate(['/']); }
    this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/';
  }

  async onSubmit() {
    if (this.formGroup.invalid) { return; }
    this.loading = true;
    try {
      const res = await this.authService.login(this.formGroup.value.username, this.formGroup.value.password);
      if (res) {
        this.error = null;
        await this.userService.loadUser();
        this.router.navigate([this.returnUrl]);
        return this.formGroup.get('username').setValue('');
      }
      this.error = 'Unauthorized';
    } catch (err) {
      this.error = `http-error.${err.statusText}`;
    } finally {
      this.formGroup.get('password').setValue('');
      this.loading = false;
    }
  }

}
