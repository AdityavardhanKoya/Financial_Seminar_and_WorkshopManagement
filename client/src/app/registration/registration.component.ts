import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html'
})
export class RegistrationComponent implements OnInit {
  itemForm: FormGroup;
  formModel: any = { role: null, email: '', password: '', username: '' };
  showMessage: boolean = false;
  responseMessage: any;
  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    private router: Router
  ) {
    this.itemForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      email:    ['', [Validators.required, Validators.email]],
      role:     [null, [Validators.required]]
    });
  }

  ngOnInit(): void {}

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
        if (err.status === 409) {
          this.responseMessage = 'Username or email already exists.';
        } else if (err.status === 400) {
          this.responseMessage = 'Invalid registration details. Please check your inputs.';
        } else {
          this.responseMessage = 'Registration failed. Please try again.';
        }
      }
    });
  }
}