import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { HttpService } from '../../services/http.service';
import { NotificationService } from '../notification.service';

// Custom Validator to check if the date is in the past
export function futureDateValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const selectedDate = new Date(control.value).getTime();
  const now = new Date().getTime();
  // Allow a 1-minute buffer to account for the time spent filling the form
  return selectedDate < (now - 60000) ? { pastDate: true } : null;
}

@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.scss'] 
})
export class CreateEventComponent implements OnInit {
  form: FormGroup;
  events: any[] = [];
  editId: number | null = null;

  page = 1;
  pageSize = 5;

  constructor(
    fb: FormBuilder,
    private http: HttpService,
    private auth: AuthService,
    private notif: NotificationService
  ) {
    this.form = fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      // Applied the custom futureDateValidator here
      schedule: ['', [Validators.required, futureDateValidator]],
      location: ['', Validators.required],
      status: ['PENDING', Validators.required],
      maxEnrollment: [10, [Validators.required, Validators.min(1)]],
      institutionId: [null]
    });
  }

  ngOnInit(): void {
    const userId = this.auth.getUserId();
    if (userId) {
      this.form.patchValue({ institutionId: Number(userId) });
    }
    this.load();
  }

  // Gets the current date/time in the format required by datetime-local input
  getCurrentDateTime(): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }

  load(): void {
    this.http.getInstitutionEvents().subscribe({
      next: (res: any) => this.events = res || [],
      error: () => this.notif.show('Failed to load events', 'danger', 4000)
    });
  }

  get pagedEvents() {
    const start = (this.page - 1) * this.pageSize;
    return this.events.slice(start, start + this.pageSize);
  }
  
  get totalPages() {
    return Math.max(1, Math.ceil(this.events.length / this.pageSize));
  }

  selectForEdit(e: any): void {
  
    
  if ((e?.status || '').toUpperCase() === 'COMPLETED') {
    this.notif.show('Completed events cannot be edited', 'warning', 4000);
    return;
  }
    this.editId = e.id;
    this.form.patchValue(e);
    // Smooth scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit(): void {
    this.editId = null;
    const userId = this.auth.getUserId();
    this.form.reset({ 
      status: 'PENDING', 
      maxEnrollment: 10, 
      institutionId: userId ? Number(userId) : null 
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      // Check for the past date error to give specific warning
      if (this.form.get('schedule')?.hasError('pastDate')) {
        this.notif.show('Event schedule cannot be in the past', 'warning', 3500);
      } else {
        this.notif.show('Please complete all required fields', 'warning', 3000);
      }
      return;
    }

    const userId = this.auth.getUserId();
    const body = { ...this.form.value, institutionId: Number(userId) };

    if (!this.editId) {
      this.http.createEvent(body).subscribe({
        next: () => {
          this.notif.show('Event successfully created', 'success', 4000);
          this.cancelEdit();
          this.load();
        },
        error: (err: any) => this.notif.show(err?.error || 'Failed to create event', 'danger', 4000)
      });
    } else {
      this.http.updateEvent(this.editId, body).subscribe({
        next: () => {
          this.notif.show('Event successfully updated', 'success', 4000);
          this.cancelEdit();
          this.load();
        },
        error: (err: any) => this.notif.show(err?.error || 'Update failed', 'danger', 4000)
      });
    }
  }
}