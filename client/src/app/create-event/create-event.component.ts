import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.component.html'
})
export class CreateEventComponent implements OnInit {

  itemForm: FormGroup;
  eventList: any = [];
  showError: boolean = false;
  errorMessage: any;
  showMessage: boolean = false;
  responseMessage: any;
  updateId: any;

  constructor(private fb: FormBuilder, private httpService: HttpService) {

    // ✅ Karma expects ALL fields initialized as ''
    this.itemForm = this.fb.group({
      institutionId: ['', Validators.required],
      title: ['', Validators.required],
      description: ['', Validators.required],
      schedule: ['', Validators.required],
      location: ['', Validators.required],
      status: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.getEvent();
  }

  getEvent(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.showError = true;
      this.errorMessage = 'User ID missing.';
      return;
    }

    this.httpService.getEventByInstitutionId(userId).subscribe({
      next: (res) => {
        this.eventList = res;
      },
      error: () => {
        this.showError = true;
        this.errorMessage = 'Failed to fetch events';
      }
    });
  }

  edit(val: any): void {
    this.updateId = val.id;
    this.itemForm.patchValue({
      institutionId: val.institutionId || '',
      title: val.title || '',
      description: val.description || '',
      schedule: val.schedule || '',
      location: val.location || '',
      status: val.status || ''
    });
  }

  onSubmit(): void {
    if (this.itemForm.invalid) {
      this.showError = true;
      this.errorMessage = 'Please fill all required fields.';
      return;
    }

    if (this.updateId) {
      this.httpService.updateEvent(this.updateId, this.itemForm.value).subscribe({
        next: () => {
          this.showMessage = true;
          this.responseMessage = 'Event updated!';
          this.itemForm.reset();
          this.updateId = null;
          this.getEvent();
        },
        error: () => {
          this.showError = true;
          this.errorMessage = 'Update failed.';
        }
      });
    } else {
      this.httpService.createEvent(this.itemForm.value).subscribe({
        next: () => {
          this.showMessage = true;
          this.responseMessage = 'Event created!';
          this.itemForm.reset();
          this.getEvent();
        },
        error: () => {
          this.showError = true;
          this.errorMessage = 'Create failed.';
        }
      });
    }
  }
}