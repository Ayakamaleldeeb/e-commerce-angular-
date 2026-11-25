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
    <section class="auth-wrap">
      <div class="auth-card">
        <a class="brand-mark" routerLink="/">fresh<span>cart</span><i>.</i></a>
        <p class="eyebrow">{{ mode === 'login' ? 'WELCOME BACK' : mode === 'register' ? 'JOIN OUR COMMUNITY' : mode === 'forgot' ? 'ACCOUNT RECOVERY' : 'ACCOUNT SECURITY' }}</p>
        <h1>{{ heading }}</h1>
        <p class="muted">{{ subtitle }}</p>

        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <label *ngIf="mode === 'register'">Full name
            <input formControlName="name" autocomplete="name" placeholder="Your name">
          </label>
          <label *ngIf="mode !== 'change'">Email address
            <input formControlName="email" type="email" autocomplete="email" placeholder="you@example.com">
          </label>
          <label *ngIf="mode === 'login' || mode === 'register'">Password
            <input formControlName="password" type="password" [attr.autocomplete]="mode === 'login' ? 'current-password' : 'new-password'" placeholder="At least 6 characters">
          </label>
          <label *ngIf="mode === 'register'">Confirm password
            <input formControlName="passwordConfirm" type="password" autocomplete="new-password" placeholder="Repeat your password">
          </label>
          <label *ngIf="mode === 'forgot' && step >= 2">Reset code
            <input formControlName="resetCode" inputmode="numeric" placeholder="Enter the code from your email">
          </label>
          <label *ngIf="mode === 'forgot' && step === 3">New password
            <input formControlName="newPassword" type="password" autocomplete="new-password" placeholder="At least 6 characters">
          </label>
          <label *ngIf="mode === 'change'">Current password
            <input formControlName="currentPassword" type="password" autocomplete="current-password">
          </label>
          <label *ngIf="mode === 'change'">New password
            <input formControlName="newPassword" type="password" autocomplete="new-password">
          </label>
          <label *ngIf="mode === 'change'">Confirm new password
            <input formControlName="passwordConfirm" type="password" autocomplete="new-password">
          </label>

          <a *ngIf="mode === 'login'" class="forgot-link" routerLink="/forgot-password">Forgot password?</a>
          <p class="feedback error" *ngIf="error">{{ error }}</p>
          <p class="feedback success" *ngIf="message">{{ message }}</p>
          <button class="primary-btn wide" type="submit" [disabled]="loading">
            {{ loading ? 'Please wait…' : buttonText }}
          </button>
        </form>

        <p class="auth-switch" *ngIf="mode === 'login'">New to FreshCart? <a routerLink="/register">Create an account</a></p>
        <p class="auth-switch" *ngIf="mode === 'register'">Already have an account? <a routerLink="/login">Sign in</a></p>
        <p class="auth-switch" *ngIf="mode === 'forgot'"><a routerLink="/login">Back to sign in</a></p>
      </div>
      <aside class="auth-aside">
        <div class="aside-orbit"></div>
        <span class="aside-tag">GOOD FOOD, GOOD MOOD</span>
        <h2>Everyday essentials,<br>delivered with care.</h2>
        <p>Discover fresh finds, trusted brands, and little things that make every day better.</p>
        <div class="aside-visual" aria-hidden="true">🥑 <span>🍓</span> 🍋</div>
      </aside>
    </section>
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
  });

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
    if (this.mode === 'register') return 'Create your account';
    if (this.mode === 'forgot') return this.step === 1 ? 'Forgot your password?' : this.step === 2 ? 'Check your inbox' : 'Choose a new password';
    if (this.mode === 'change') return 'Change your password';
    return 'Sign in to FreshCart';
  }

  get subtitle(): string {
    if (this.mode === 'register') return 'Save your favourites and make checkout a breeze.';
    if (this.mode === 'forgot') return this.step === 1 ? 'We’ll email you a code to get back into your account.' : this.step === 2 ? 'Enter the verification code we sent to your email.' : 'Make it strong and easy for you to remember.';
    if (this.mode === 'change') return 'Keep your account safe with a strong password.';
    return 'Your fresh favourites are just a sign in away.';
  }

  get buttonText(): string {
    if (this.mode === 'register') return 'Create account';
    if (this.mode === 'forgot') return this.step === 1 ? 'Send reset code' : this.step === 2 ? 'Verify code' : 'Reset password';
    if (this.mode === 'change') return 'Update password';
    return 'Sign in';
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
