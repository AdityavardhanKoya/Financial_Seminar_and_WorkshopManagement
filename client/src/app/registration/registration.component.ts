import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';

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
      username: ['', [Validators.required]],
      password: ['', [Validators.required, this.passwordRulesValidator.bind(this)]],
      email: ['', [Validators.required, Validators.email]],
      role: [null, [Validators.required]],
      authCode: ['']
    });
  }

  ngOnInit(): void {
    this.itemForm.get('role')!.valueChanges.subscribe(role => {
      const authCtrl = this.itemForm.get('authCode');
      if (role === 'INSTITUTION' || role === 'PROFESSIONAL') {
        authCtrl?.setValidators([Validators.required]);
      } else {
        authCtrl?.clearValidators();
        authCtrl?.setValue('');
      }
      authCtrl?.updateValueAndValidity();
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

  onRegister(): void {
    if (this.itemForm.invalid) {
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