import { Component } from "@angular/core";
import { HttpService } from "../../services/http.service";
import { NotificationService } from "../notification.service";

@Component({ selector: 'app-forgot-password', templateUrl: './forgot-password.component.html' })
export class ForgotPasswordComponent {
  email = '';

  constructor(private http: HttpService, private notif: NotificationService) {}

  submit() {
    this.http.forgotPassword({ email: this.email }).subscribe({
      next: () => this.notif.show('Reset link sent to your email', 'success', 4000),
      error: () => this.notif.show('Something went wrong', 'danger', 4000)
    });
  }
}