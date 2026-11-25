import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StoreService } from './store.service';

type AuthMode = 'login' | 'register' | 'forgot' | 'change';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="auth-page page-shell" *ngIf="mode !== 'change'">
      <aside class="auth-side" *ngIf="mode === 'register'; else heroSide">
        <h2>Welcome to <span>FreshCart</span></h2>
        <p>Join thousands of happy customers who enjoy fresh groceries delivered right to their doorstep.</p>
        <ul class="auth-perks">
          <li><span class="feature-icon green"><i class="fa-solid fa-star"></i></span><span><strong>Premium Quality</strong><small>Premium quality products sourced from trusted suppliers.</small></span></li>
          <li><span class="feature-icon green"><i class="fa-solid fa-truck"></i></span><span><strong>Fast Delivery</strong><small>Same-day delivery available in most areas</small></span></li>
          <li><span class="feature-icon green"><i class="fa-solid fa-shield-halved"></i></span><span><strong>Secure Shopping</strong><small>Your data and payments are completely secure</small></span></li>
        </ul>
        <figure class="testimonial">
          <div class="testimonial-head"><span class="avatar">S</span><span><strong>Sarah Johnson</strong><span class="stars">★★★★★</span></span></div>
          <blockquote>“FreshCart has transformed my shopping experience. The quality of the products is outstanding, and the delivery is always on time. Highly recommend!”</blockquote>
        </figure>
      </aside>
      <ng-template #heroSide>
        <aside class="auth-side auth-visual">
          <img src="https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=900&q=80" alt="Shopping cart full of fresh vegetables">
          <h2>FreshCart - Your One-Stop Shop for Fresh Products</h2>
          <p>Join thousands of happy customers who trust FreshCart for their daily grocery needs</p>
          <div class="auth-mini-perks"><span><i class="fa-solid fa-truck"></i> Free Delivery</span><span><i class="fa-solid fa-shield-halved"></i> Secure Payment</span><span><i class="fa-solid fa-clock"></i> 24/7 Support</span></div>
        </aside>
      </ng-template>

      <div class="auth-card card">
        <div class="auth-head">
          <a class="brand-text" routerLink="/" *ngIf="mode === 'login'">Fresh<span>Cart</span></a>
          <span class="auth-icon" *ngIf="mode === 'forgot'"><i [class]="step === 1 ? 'fa-solid fa-lock' : step === 2 ? 'fa-regular fa-envelope-open' : 'fa-solid fa-key'"></i></span>
          <h1>{{ heading }}</h1>
          <p>{{ subtitle }}</p>
        </div>

        <ng-container *ngIf="mode === 'login' || mode === 'register'">
          <div class="social-row">
            <button type="button" class="social-btn" (click)="social()"><i class="fa-brands fa-google google"></i> {{ mode === 'login' ? 'Continue with Google' : 'Google' }}</button>
            <button type="button" class="social-btn" (click)="social()"><i class="fa-brands fa-facebook facebook"></i> {{ mode === 'login' ? 'Continue with Facebook' : 'Facebook' }}</button>
          </div>
          <div class="divider"><span>{{ mode === 'login' ? 'OR CONTINUE WITH EMAIL' : 'or' }}</span></div>
        </ng-container>

        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <label *ngIf="mode === 'register'">Name <b>*</b>
            <span class="input-icon"><i class="fa-regular fa-user"></i><input formControlName="name" autocomplete="name" placeholder="Ali"></span>
          </label>
          <label>{{ mode === 'register' ? 'Email' : 'Email Address' }} <b>*</b>
            <span class="input-icon"><i class="fa-regular fa-envelope"></i><input formControlName="email" type="email" autocomplete="email" placeholder="ali@example.com"></span>
          </label>
          <label *ngIf="mode === 'login' || mode === 'register'">
            <span class="label-row">Password <b>*</b><a *ngIf="mode === 'login'" routerLink="/forgot-password">Forgot Password?</a></span>
            <span class="input-icon"><i class="fa-solid fa-lock"></i><input formControlName="password" [type]="showPassword ? 'text' : 'password'" [attr.autocomplete]="mode === 'login' ? 'current-password' : 'new-password'" [placeholder]="mode === 'login' ? 'Enter your password' : 'Create a strong password'"><button type="button" class="eye" (click)="showPassword = !showPassword" [attr.aria-label]="showPassword ? 'Hide password' : 'Show password'"><i [class]="showPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'"></i></button></span>
            <small class="hint" *ngIf="mode === 'register'">Must be at least 6 characters</small>
          </label>
          <label *ngIf="mode === 'register'">Confirm Password <b>*</b>
            <span class="input-icon"><i class="fa-solid fa-lock"></i><input formControlName="passwordConfirm" type="password" autocomplete="new-password" placeholder="Confirm your password"></span>
          </label>
          <label *ngIf="mode === 'register'">Phone Number <b>*</b>
            <span class="input-icon"><i class="fa-solid fa-phone"></i><input formControlName="phone" type="tel" autocomplete="tel" placeholder="01xxxxxxxxx"></span>
          </label>
          <label *ngIf="mode === 'forgot' && step >= 2">Verification Code <b>*</b>
            <span class="input-icon"><i class="fa-solid fa-key"></i><input formControlName="resetCode" inputmode="numeric" placeholder="Enter the 6-digit code"></span>
          </label>
          <label *ngIf="mode === 'forgot' && step === 3">New Password <b>*</b>
            <span class="input-icon"><i class="fa-solid fa-lock"></i><input formControlName="newPassword" type="password" autocomplete="new-password" placeholder="At least 6 characters"></span>
          </label>
          <p class="feedback error" *ngIf="error">{{ error }}</p>
          <p class="feedback success" *ngIf="message">{{ message }}</p>
          <button class="btn btn-primary wide" type="submit" [disabled]="loading">
            <span class="spinner small light" *ngIf="loading"></span>
            <i *ngIf="!loading" [class]="mode === 'register' ? 'fa-solid fa-user-plus' : mode === 'login' ? 'fa-solid fa-arrow-right-to-bracket' : 'fa-solid fa-paper-plane'"></i>
            {{ loading ? 'Please wait…' : buttonText }}
          </button>
        </form>

        <p class="auth-switch" *ngIf="mode === 'login'">New to FreshCart? <a routerLink="/register">Create an account</a></p>
        <p class="auth-switch" *ngIf="mode === 'register'">Already have an account? <a routerLink="/login">Sign In</a></p>
        <p class="auth-switch" *ngIf="mode === 'forgot'"><a routerLink="/login"><i class="fa-solid fa-arrow-left"></i> Back to Sign In</a></p>
        <div class="auth-trust" *ngIf="mode === 'login'"><span><i class="fa-solid fa-lock"></i> SSL Secured</span><span><i class="fa-solid fa-users"></i> 50K+ Users</span><span><i class="fa-solid fa-star"></i> 4.9 Rating</span></div>
      </div>
    </section>

    <ng-container *ngIf="mode === 'change'">
      <section class="page-banner">
        <div class="page-shell">
          <div class="breadcrumbs light"><a routerLink="/">Home</a><span>/</span><span>My Account</span></div>
          <div class="banner-title"><span class="banner-icon"><i class="fa-regular fa-user"></i></span><div><h1>My Account</h1><p>Manage your orders and account settings</p></div></div>
        </div>
      </section>
      <section class="page-shell page-body account-layout">
        <aside class="account-nav card">
          <h3>My Account</h3>
          <a routerLink="/orders"><i class="fa-solid fa-box"></i> My Orders <i class="fa-solid fa-chevron-right end"></i></a>
          <a routerLink="/wishlist"><i class="fa-regular fa-heart"></i> Wishlist <i class="fa-solid fa-chevron-right end"></i></a>
          <a class="active" routerLink="/change-password"><i class="fa-solid fa-gear"></i> Settings <i class="fa-solid fa-chevron-right end"></i></a>
        </aside>
        <div>
          <div class="account-title"><h2>Account Settings</h2><p>Update your profile information and change your password</p></div>
          <div class="card settings-card">
            <div class="settings-head"><span class="feature-icon green"><i class="fa-solid fa-lock"></i></span><span><strong>Change Password</strong><small>Update your account password</small></span></div>
            <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <label *ngIf="mode === 'change'">Current Password <b>*</b>
            <span class="input-icon"><i class="fa-solid fa-lock"></i><input formControlName="currentPassword" type="password" autocomplete="current-password" placeholder="Enter your current password"></span>
          </label>
          <label *ngIf="mode === 'change'">New Password <b>*</b>
            <span class="input-icon"><i class="fa-solid fa-lock"></i><input formControlName="newPassword" type="password" autocomplete="new-password" placeholder="Enter a new password"></span>
          </label>
          <label *ngIf="mode === 'change'">Confirm New Password <b>*</b>
            <span class="input-icon"><i class="fa-solid fa-lock"></i><input formControlName="passwordConfirm" type="password" autocomplete="new-password" placeholder="Confirm the new password"></span>
          </label>
          <p class="feedback error" *ngIf="error">{{ error }}</p>
          <p class="feedback success" *ngIf="message">{{ message }}</p>
              <button class="btn btn-primary" type="submit" [disabled]="loading"><i class="fa-solid fa-lock"></i> {{ loading ? 'Please wait…' : buttonText }}</button>
            </form>
          </div>
        </div>
      </section>
    </ng-container>
  `,
})
export class AuthComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(StoreService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly changeDetector = inject(ChangeDetectorRef);

  mode: AuthMode = this.route.snapshot.data['mode'] as AuthMode;
  step = 1;
  loading = false;
  error = '';
  message = '';
  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    passwordConfirm: ['', Validators.required],
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    resetCode: ['', Validators.required],
    phone: [''],
  });
  showPassword = false;

  constructor() {
    this.configureValidators();
  }

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      this.mode = data['mode'] as AuthMode;
      this.step = 1;
      this.error = '';
      this.message = this.mode === 'login' && this.route.snapshot.queryParamMap.has('registered')
        ? 'Your account is ready. Sign in to continue.'
        : '';
      this.form.reset();
      this.configureValidators();
    });
  }

  get heading(): string {
    if (this.mode === 'register') return 'Create Your Account';
    if (this.mode === 'forgot') return this.step === 1 ? 'Forgot your password?' : this.step === 2 ? 'Check your inbox' : 'Choose a new password';
    if (this.mode === 'change') return 'Change your password';
    return 'Welcome Back!';
  }

  get subtitle(): string {
    if (this.mode === 'register') return 'Start your fresh journey with us today';
    if (this.mode === 'forgot') return this.step === 1 ? 'We’ll email you a code to get back into your account.' : this.step === 2 ? 'Enter the verification code we sent to your email.' : 'Make it strong and easy for you to remember.';
    if (this.mode === 'change') return 'Keep your account safe with a strong password.';
    return 'Sign in to continue your fresh shopping experience';
  }

  get buttonText(): string {
    if (this.mode === 'register') return 'Create My Account';
    if (this.mode === 'forgot') return this.step === 1 ? 'Send reset code' : this.step === 2 ? 'Verify code' : 'Reset password';
    if (this.mode === 'change') return 'Change Password';
    return 'Sign In';
  }

  social(): void {
    this.message = '';
    this.error = 'Social sign-in is not available yet. Please use your email.';
  }

  submit(): void {
    this.error = '';
    this.message = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = 'Please complete the required fields with valid information.';
      return;
    }

    const values = this.form.getRawValue();
    this.loading = true;
    const finish = (): void => {
      this.loading = false;
      this.changeDetector.markForCheck();
    };

    if (this.mode === 'login') {
      this.store.login({ email: values.email!, password: values.password! }).subscribe({
        next: (response) => {
          this.store.saveSession(response.token, response.user);
          void this.router.navigateByUrl(this.route.snapshot.queryParamMap.get('returnUrl') || '/');
        },
        error: (error: unknown) => { this.error = this.errorText(error); finish(); },
        complete: finish,
      });
    } else if (this.mode === 'register') {
      if (values.password !== values.passwordConfirm) {
        this.error = 'The passwords do not match.';
        finish();
        return;
      }
      this.store.register({
        name: values.name!,
        email: values.email!,
        password: values.password!,
        rePassword: values.passwordConfirm!,
        phone: values.phone!,
      }).subscribe({
        next: () => { void this.router.navigate(['/login'], { queryParams: { registered: '1' } }); },
        error: (error: unknown) => { this.error = this.errorText(error); finish(); },
        complete: finish,
      });
    } else if (this.mode === 'forgot') {
      if (this.step === 1) {
        this.store.forgotPassword(values.email!).subscribe({
          next: () => { this.step = 2; this.configureValidators(); this.message = 'A reset code has been sent to your email.'; },
          error: (error: unknown) => { this.error = this.errorText(error); finish(); },
          complete: finish,
        });
      } else if (this.step === 2) {
        this.store.verifyResetCode(values.resetCode!).subscribe({
          next: () => { this.step = 3; this.configureValidators(); this.message = 'Code verified. Create your new password.'; },
          error: (error: unknown) => { this.error = this.errorText(error); finish(); },
          complete: finish,
        });
      } else {
        this.store.resetPassword(values.email!, values.newPassword!).subscribe({
          next: (response) => {
            this.store.saveSession(response.token, response.user);
            void this.router.navigateByUrl('/');
          },
          error: (error: unknown) => { this.error = this.errorText(error); finish(); },
          complete: finish,
        });
      }
    } else {
      if (values.newPassword !== values.passwordConfirm) {
        this.error = 'The new passwords do not match.';
        finish();
        return;
      }
      this.store.changePassword(values.currentPassword!, values.newPassword!, values.passwordConfirm!).subscribe({
        next: (response) => {
          this.store.saveSession(response.token, response.user);
          this.message = 'Your password has been updated.';
          this.form.reset();
        },
        error: (error: unknown) => { this.error = this.errorText(error); finish(); },
        complete: finish,
      });
    }
  }

  private errorText(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'error' in error) {
      const body = (error as { error?: { message?: string } }).error;
      if (body?.message) return body.message;
    }
    return 'Something went wrong. Please try again.';
  }

  private configureValidators(): void {
    const controls = this.form.controls;
    for (const control of Object.values(controls)) control.clearValidators();

    if (this.mode !== 'change') controls.email.setValidators([Validators.required, Validators.email]);
    if (this.mode === 'register') {
      controls.name.setValidators([Validators.required, Validators.minLength(2)]);
      controls.password.setValidators([Validators.required, Validators.minLength(6)]);
      controls.passwordConfirm.setValidators(Validators.required);
      controls.phone.setValidators([Validators.required, Validators.pattern(/^01[0125]\d{8}$/)]);
    }
    if (this.mode === 'login') controls.password.setValidators(Validators.required);
    if (this.mode === 'forgot') {
      if (this.step >= 2) controls.resetCode.setValidators(Validators.required);
      if (this.step === 3) controls.newPassword.setValidators([Validators.required, Validators.minLength(6)]);
    }
    if (this.mode === 'change') {
      controls.currentPassword.setValidators(Validators.required);
      controls.newPassword.setValidators([Validators.required, Validators.minLength(6)]);
      controls.passwordConfirm.setValidators(Validators.required);
    }
    for (const control of Object.values(controls)) control.updateValueAndValidity({ emitEvent: false });
  }
}
