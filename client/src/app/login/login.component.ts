import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  itemForm: FormGroup;
  showError = false;
  errorMessage: any;

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    private authService: AuthService,
    private router: Router
  ) {
    this.itemForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  ngOnInit(): void {}

  private getRoleFromToken(token: string): string | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || payload.authority || null;
    } catch {
      return null;
    }
  }

  onLogin(): void {
    if (this.itemForm.invalid) {
      this.showError = true;
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    this.httpService.Login(this.itemForm.value).subscribe({
      next: (res: any) => {
        console.log('Login response:', res);

        if (!res?.token) {
          this.showError = true;
          this.errorMessage = 'Invalid response from server (token missing).';
          return;
        }

        // ✅ role fallback if backend didn't send role properly
        const role = (res.role || this.getRoleFromToken(res.token) || '').toUpperCase().trim();

        if (!role) {
          this.showError = true;
          this.errorMessage = 'Role missing in login response. Please check backend LoginResponse.';
          return;
        }

        // ✅ store session
        this.authService.saveToken(res.token);
        this.authService.SetRole(role);
        if (res.id) {
          this.authService.saveUserId(res.id.toString());
        } else {
          // fallback decode id if backend doesn't send it
          this.extractAndSaveUserIdFromToken(res.token);
        }
        localStorage.setItem('username', res.username || this.itemForm.value.username);

        // ✅ navigation (navigateByUrl is more direct)
        if (role === 'INSTITUTION') {
          this.router.navigateByUrl('/create-event');
        } else if (role === 'PROFESSIONAL') {
          this.router.navigateByUrl('/update-event-status');
        } else {
          this.router.navigateByUrl('/view-events'); // PARTICIPANT default
        }
      },
      error: (err: any) => {
        this.showError = true;
        if (err.status === 401) {
          this.errorMessage = 'Invalid username or password.';
        } else if (err.status === 0) {
          this.errorMessage = 'Unable to connect to server. Please try again.';
        } else {
          this.errorMessage = 'Login failed. Please try again.';
        }
      }
    });
  }

  private extractAndSaveUserIdFromToken(token: string): void {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.userId) {
        this.authService.saveUserId(payload.userId.toString());
      } else if (payload.id) {
        this.authService.saveUserId(payload.id.toString());
      }
    } catch (e) {
      console.error('Failed to decode JWT:', e);
    }
  }

  registration(): void {
    this.router.navigate(['/registration']);
  }
}