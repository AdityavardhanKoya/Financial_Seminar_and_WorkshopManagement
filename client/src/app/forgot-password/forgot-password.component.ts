import { Component, ViewEncapsulation } from "@angular/core";
import { HttpService } from "../../services/http.service";
import { NotificationService } from "../notification.service";

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ForgotPasswordComponent {
  email = '';

  constructor(private http: HttpService, private notif: NotificationService) {}

  submit() {
    if (!this.email.trim()) {
      this.notif.show('Please enter your email', 'warning', 3000);
      return;
    }

    this.http.forgotPassword({ email: this.email }).subscribe({
      next: () => this.notif.show('Reset link sent to your email', 'success', 4000),
      error: () => this.notif.show('User not found or connection error', 'danger', 4000)
    });
  }
}