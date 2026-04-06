 
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { Observable, of, timer } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
 
type RuleKey = 'minLength' | 'upper' | 'lower' | 'number' | 'special';
 
interface RuleUI {
  key: RuleKey;
  text: string;
  flashGreen: boolean;
  hidden: boolean;
}
 
@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {
 
  itemForm: FormGroup;
  showMessage = false;
  responseMessage: string = '';
 
  rules: RuleUI[] = [
    { key: 'minLength', text: 'Minimum 8 characters', flashGreen: false, hidden: false },
    { key: 'upper', text: 'At least one uppercase letter (A-Z)', flashGreen: false, hidden: false },
    { key: 'lower', text: 'At least one lowercase letter (a-z)', flashGreen: false, hidden: false },
    { key: 'number', text: 'At least one number (0-9)', flashGreen: false, hidden: false },
    { key: 'special', text: 'At least one special character (@ $ ! % * ? &)', flashGreen: false, hidden: false },
  ];
 
  private prevState: Record<RuleKey, boolean> = {
    minLength: false, upper: false, lower: false, number: false, special: false
  };
 
  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    private router: Router
  ) {
    this.itemForm = this.fb.group({
      // ✅ kept Validators.required (existing) + added missing validators + async uniqueness
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(30),
          Validators.pattern(/^[a-zA-Z0-9._-]+$/)
        ],
        [this.uniqueUsernameValidator()]
      ],
 
      // ✅ kept existing validators as-is (required + passwordRulesValidator)
      password: ['', [Validators.required, this.passwordRulesValidator.bind(this)]],
 
      // ✅ kept required+email (existing) + added maxLength + async unique email per role
      email: [
        '',
        [Validators.required, Validators.email, Validators.maxLength(254)],
        [this.uniqueEmailForRoleValidator()]
      ],
 
      // ✅ kept required (existing)
      role: [null, [Validators.required]],
 
      // ✅ kept as-is (existing)
      authCode: ['']
    });
  }
 
  ngOnInit(): void {
    this.itemForm.get('role')!.valueChanges.subscribe(role => {
      const authCtrl = this.itemForm.get('authCode');
      if (role === 'INSTITUTION' || role === 'PROFESSIONAL') {
        authCtrl?.setValidators([Validators.required]); // ✅ existing logic unchanged
      } else {
        authCtrl?.clearValidators();
        authCtrl?.setValue('');
      }
      authCtrl?.updateValueAndValidity();
 
      // ✅ IMPORTANT: email uniqueness depends on role, so revalidate email when role changes
      this.itemForm.get('email')?.updateValueAndValidity();
    });
 
    this.itemForm.get('password')!.valueChanges.subscribe(val => {
      this.updateRuleUI(val || '');
    });
  }
 
  private evalRules(password: string): Record<RuleKey, boolean> {
    return {
      minLength: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password)
    };
  }
 
  private passwordRulesValidator(control: AbstractControl): ValidationErrors | null {
    const r = this.evalRules(control.value || '');
    return Object.values(r).every(v => v) ? null : { passwordRules: true };
  }
 
  private updateRuleUI(password: string): void {
    const now = this.evalRules(password);
 
    this.rules.forEach(rule => {
      const was = this.prevState[rule.key];
      const isNow = now[rule.key];
 
      if (!isNow) {
        rule.hidden = false;
        rule.flashGreen = false;
      }
 
      if (!was && isNow) {
        rule.flashGreen = true;
        setTimeout(() => {
          rule.flashGreen = false;
          rule.hidden = true;
        }, 600);
      }
    });
 
    this.prevState = now;
  }
 
  get allRulesDone(): boolean {
    const password = this.itemForm.get('password')?.value || '';
    const results = this.evalRules(password);
    return Object.values(results).every(v => v);
  }
 
  // ==========================
  // ✅ NEW: UNIQUE VALIDATORS
  // ==========================
 
  private uniqueUsernameValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const username = (control.value || '').trim();
      if (!username) return of(null);
 
      return timer(400).pipe(
        switchMap(() => this.httpService.checkUsernameAvailable(username)),
        map((available: boolean) => (available ? null : { usernameTaken: true })),
        catchError(() => of(null)) // ✅ don't block user if API fails
      );
    };
  }
 
  private uniqueEmailForRoleValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const email = (control.value || '').trim();
      const role = this.itemForm?.get('role')?.value;
 
      // role not chosen yet => skip uniqueness check
      if (!email || !role) return of(null);
 
      return timer(400).pipe(
        switchMap(() => this.httpService.checkEmailAvailableForRole(email, role)),
        map((available: boolean) => (available ? null : { emailTakenForRole: true })),
        catchError(() => of(null))
      );
    };
  }
 
  onRegister(): void {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched(); // ✅ helps show validation states
      this.showMessage = true;
      this.responseMessage = 'Please fill all required fields correctly.';
      return;
    }
 
    this.httpService.registerUser(this.itemForm.value).subscribe({
      next: () => {
        this.showMessage = true;
        this.responseMessage = 'Registration successful! Redirecting to login...';
        this.itemForm.reset();
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err: any) => {
        this.showMessage = true;
        this.responseMessage = err?.error?.message || 'Registration failed. Please check your details.';
      }
    });
  }
}
 