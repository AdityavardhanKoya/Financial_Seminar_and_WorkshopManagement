import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-assign-professional',
  templateUrl: './assign-professional.component.html'
})
export class AssignProfessionalComponent implements OnInit {

  itemForm: FormGroup;
  formModel: any = { status: null };
  showError: boolean = false;
  errorMessage: any;
  eventList: any = [];
  assignModel: any = {};
  showMessage: any;
  responseMessage: any;
  updateId: any;
  professionalsList: any = [];

  constructor(private fb: FormBuilder, private httpService: HttpService) {
    this.itemForm = this.fb.group({
      eventId: [null, [Validators.required]],
      userId:  [null, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.getEvent();
    this.getProfessionals();
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
          this.errorMessage = 'Not authorized to view events.';
        } else {
          this.errorMessage = 'Failed to fetch events.';
        }
      }
    });
  }

  getProfessionals(): void {
    this.httpService.GetAllProfessionals().subscribe({
      next: (res: any) => {
        this.professionalsList = res;
        this.showError = false;
      },
      error: (err: any) => {
        this.showError = true;
        if (err.status === 403) {
          this.errorMessage = 'Not authorized to view professionals.';
        } else {
          this.errorMessage = 'Failed to fetch professionals.';
        }
      }
    });
  }

  onSubmit(): void {
    if (this.itemForm.invalid) {
      this.showError = true;
      this.errorMessage = 'Please select an event and a professional.';
      return;
    }

    const { eventId, userId } = this.itemForm.value;

    this.httpService.assignProfessionals(eventId, userId).subscribe({
      next: () => {
        this.showMessage = true;
        this.responseMessage = 'Professional assigned successfully!';
        this.showError = false;
        this.itemForm.reset();
      },
      error: (err: any) => {
        this.showError = true;
        if (err.status === 404) {
          this.errorMessage = 'Event or professional not found.';
        } else if (err.status === 403) {
          this.errorMessage = 'Not authorized to assign professionals.';
        } else {
          this.errorMessage = 'Failed to assign professional. Please try again.';
        }
      }
    });
  }
}