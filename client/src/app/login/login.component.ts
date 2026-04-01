import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
itemForm: FormGroup;
  formModel: any = {};
  showError: boolean = false;
  errorMessage: any;

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    private authService: AuthService,
    private router: Router
  ) {
    this.itemForm = this.fb.group({
      role:     ['', [Validators.required]],
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  ngOnInit(): void {}

  onLogin(): void {
    if (this.itemForm.invalid) {
      this.showError = true;
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    const { role, username, password } = this.itemForm.value;

    this.httpService.Login({ username, password }).subscribe({
      next: (res: any) => {
        if (!res || !res.token) {
          this.showError = true;
          this.errorMessage = 'Invalid response from server.';
          return;
        }

        // Role-based authentication check
        // Prevent a PARTICIPANT logging in as INSTITUTION etc.
        if (res.role !== role) {
          this.showError = true;
          this.errorMessage = `Access denied. This account is registered as
            "${res.role}", not "${role}". Please select the correct role.`;
          return;
        }

        this.authService.saveToken(res.token);
        this.authService.SetRole(res.role);
        this.authService.saveUserId(res.id ? res.id.toString() : '');
        localStorage.setItem('username', res.username);

        if (res.role === 'INSTITUTION') {
          this.router.navigate(['/create-event']);
        } else if (res.role === 'PROFESSIONAL') {
          this.router.navigate(['/update-event-status']);
        } else {
          this.router.navigate(['/view-events']);
        }
      },
      error: (err: any) => {
        this.showError = true;
        if (err.status === 401) {
          this.errorMessage = 'Invalid username or password.';
        } else if (err.status === 0) {
          this.errorMessage = 'Cannot connect to server.';
        } else {
          this.errorMessage = 'Login failed. Please try again.';
        }
      }
    });
  }
}