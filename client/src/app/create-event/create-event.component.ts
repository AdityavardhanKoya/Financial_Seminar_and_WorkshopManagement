import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.component.html'
})
export class CreateEventComponent implements OnInit {

  itemForm: FormGroup;
  formModel: any = { status: null };
  showError: boolean = false;
  errorMessage: any;
  eventList: any = [];
  assignModel: any = {};
  showMessage: any;
  responseMessage: any;
  updateId: any;

  constructor(private fb: FormBuilder, private httpService: HttpService) {
    this.itemForm = this.fb.group({
      institutionId: [ '', [Validators.required]],
      title:         [ '',         [Validators.required]],
      description:   ['',   [Validators.required]],
      schedule:      ['',       [Validators.required]],
      location:      [ '',       [Validators.required]],
      status:        ['',       [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.getEvent();
  }

  getEvent(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.showError = true;
      this.errorMessage = 'User ID is missing. Please log in again.';
      return;
    }

    this.httpService.getEventByInstitutionId(userId).subscribe({
      next: (res: any) => {
        this.eventList = res;
        this.showError = false;
      },
      error: (err: any) => {
        this.showError = true;
        if (err.status === 404) {
          this.errorMessage = 'No events found for this institution.';
        } else if (err.status === 403) {
          this.errorMessage = 'You are not authorized to view these events.';
        } else {
          this.errorMessage = 'Failed to fetch events. Please try again.';
        }
      }
    });
  }

  edit(val: any): void {
    if (!val || !val.id) return;
    this.updateId = val.id;
    this.itemForm.patchValue({
      institutionId: val.institutionId || '',
      title:         val.title || '',
      description:   val.description || '',
      schedule:      val.schedule || '',
      location:      val.location || '',
      status:        val.status || null
    });
  }

  onSubmit(): void {
    if (this.itemForm.invalid) {
      this.showError = true;
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.showError = true;
      this.errorMessage = 'User ID is missing. Please log in again.';
      return;
    }

    if (this.updateId) {
      this.httpService.updateEvent(this.updateId, this.itemForm.value).subscribe({
        next: () => {
          this.showMessage = true;
          this.responseMessage = 'Event updated successfully!';
          this.updateId = null;
          this.itemForm.reset();
          this.getEvent();
        },
        error: (err: any) => {
          this.showError = true;
          this.errorMessage = err.status === 403
            ? 'Not authorized to update this event.'
            : 'Failed to update event. Please try again.';
        }
      });
    } else {
      this.httpService.createEvent(this.itemForm.value).subscribe({
        next: () => {
          this.showMessage = true;
          this.responseMessage = 'Event created successfully!';
          this.itemForm.reset();
          this.getEvent();
        },
        error: (err: any) => {
          this.showError = true;
          this.errorMessage = err.status === 403
            ? 'Not authorized to create events.'
            : 'Failed to create event. Please try again.';
        }
      });
    }
  }
}

// placeholder to satisfy constructor default reference
const formModel: any = { status: null };