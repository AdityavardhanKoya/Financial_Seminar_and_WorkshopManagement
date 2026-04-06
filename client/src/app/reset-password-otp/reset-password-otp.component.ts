import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';
import { NotificationService } from '../notification.service';

@Component({
  selector: 'app-reset-password-otp',
  templateUrl: './reset-password-otp.component.html',
  styleUrls: ['./reset-password-otp.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ResetPasswordOtpComponent implements OnInit {

  form: FormGroup;
  emailFromRoute = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    fb: FormBuilder,
    private http: HttpService,
    private notif: NotificationService
  ) {
    this.form = fb.group({
      email: ['', [Validators.required, Validators.email]],
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.emailFromRoute = this.route.snapshot.queryParamMap.get('email') || '';
    if (this.emailFromRoute) {
      this.form.patchValue({ email: this.emailFromRoute });
    }
  }

  resetPassword(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.http.resetPasswordOtp(this.form.value).subscribe({
      next: () => {
        this.notif.show('Password updated successfully', 'success', 4000);
        this.router.navigateByUrl('/login');
      },
      error: (err) => {
        const errorMsg = err?.error?.message || err?.error || 'OTP invalid or expired';
        this.notif.show(errorMsg, 'danger', 4000);
      }
    });
  }
}