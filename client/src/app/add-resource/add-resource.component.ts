import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-add-resource',
  templateUrl: './add-resource.component.html'
})
export class AddResourceComponent implements OnInit {

  itemForm: FormGroup;
  formModel: any = { status: null };
  showError: boolean = false;
  errorMessage: any;
  assignModel: any = {};
  showMessage: any;
  responseMessage: any;
  eventList: any = [];

  constructor(private fb: FormBuilder, private httpService: HttpService) {
    
     this.itemForm = this.fb.group({
  eventId:            [null, [Validators.required]],
  type:               [null, [Validators.required]],
  description:        [null, [Validators.required]],
  availabilityStatus: [null, [Validators.required]]

    });
  }

  ngOnInit(): void {
   this.formModel.availabilityStatus = null;
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
          this.errorMessage = 'No events found.';
        } else if (err.status === 403) {
          this.errorMessage = 'Not authorized to view events.';
        } else {
          this.errorMessage = 'Failed to fetch events.';
        }
      }
    });
  }

  onSubmit(): void {
    if (this.itemForm.invalid) {
      this.showError = true;
      this.errorMessage = 'Please fill in all required fields before submitting.';
      return;
    }

    this.httpService.addResource(this.itemForm.value).subscribe({
      next: () => {
        this.showMessage = true;
        this.responseMessage = 'Resource added successfully!';
        this.showError = false;
        this.itemForm.reset();
      },
      error: (err: any) => {
        this.showError = true;
        if (err.status === 404) {
          this.errorMessage = 'Event not found. Please select a valid event.';
        } else if (err.status === 403) {
          this.errorMessage = 'Not authorized to add resources.';
        } else {
          this.errorMessage = 'Failed to add resource. Please try again.';
        }
      }
    });
  }
}