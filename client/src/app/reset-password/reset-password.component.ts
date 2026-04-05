import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Router } from '@angular/router';
import { HttpService } from "../../services/http.service";
import { NotificationService } from "../notification.service";

@Component({ selector: 'app-reset-password', templateUrl: './reset-password.component.html' })
export class ResetPasswordComponent implements OnInit {
  token = '';
  password = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpService,
    private router: Router,
    private notif: NotificationService
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  reset() {
    this.http.resetPassword({
      token: this.token,
      newPassword: this.password
    }).subscribe({
      next: () => {
        this.notif.show('Password updated', 'success', 4000);
         this.router.navigateByUrl('/login');
      },
      error: () => this.notif.show('Token invalid or expired', 'danger', 4000)
    });
  }
}