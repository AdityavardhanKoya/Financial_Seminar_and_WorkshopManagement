import { Component, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { NotificationService } from '../notification.service';

@Component({
  selector: 'app-forgot-password-otp',
  templateUrl: './forgot-password-otp.component.html',
  styleUrls: ['./forgot-password-otp.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ForgotPasswordOtpComponent {

  form: FormGroup;
  isSending = false;

  constructor(
    fb: FormBuilder,
    private http: HttpService,
    private notif: NotificationService,
    private router: Router
  ) {
    this.form = fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  sendOtp(): void {
    if (this.isSending) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSending = true;
    const email = this.form.value.email;

    this.http.forgotPasswordOtp({ email }).subscribe({
      next: () => {
        this.isSending = false;
        this.notif.show('OTP sent to your email', 'success', 4000);
        this.router.navigate(['/reset-password'], { queryParams: { email } });
      },
      error: () => {
        this.isSending = false;
        this.notif.show('Failed to send OTP. Please try again.', 'danger', 4000);
      }
    });
  }
}