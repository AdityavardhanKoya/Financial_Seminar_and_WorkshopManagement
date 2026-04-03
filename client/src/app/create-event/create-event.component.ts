import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { HttpService } from '../../services/http.service';
import { NotificationService } from '../notification.service';

@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.component.html'
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
      schedule: ['', Validators.required],
      location: ['', Validators.required],
      status: ['PENDING', Validators.required],
      maxEnrollment: [10, [Validators.required, Validators.min(1)]],
      institutionId: [null]
    });
  }

  ngOnInit(): void {
    this.form.patchValue({ institutionId: Number(this.auth.getUserId()) });
    this.load();
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
    this.editId = e.id;
    this.form.patchValue(e);
    this.notif.show(`Editing "${e.title}"`, 'info', 3000);
  }

  cancelEdit(): void {
    this.editId = null;
    this.form.reset({ status: 'PENDING', maxEnrollment: 10, institutionId: Number(this.auth.getUserId()) });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const body = { ...this.form.value, institutionId: Number(this.auth.getUserId()) };

    if (!this.editId) {
      if (!confirm('Create this event?')) return;
      this.http.createEvent(body).subscribe({
        next: () => {
          this.notif.show('Event created', 'success', 4000);
          this.cancelEdit();
          this.load();
        },
        error: () => this.notif.show('Create failed', 'danger', 4000)
      });
    } else {
      if (!confirm('Update this event?')) return;
      this.http.updateEvent(this.editId, body).subscribe({
        next: () => {
          this.notif.show('Event updated', 'success', 4000);
          this.cancelEdit();
          this.load();
        },
        error: () => this.notif.show('Update failed (not your event?)', 'danger', 4000)
      });
    }
  }
}