import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-update-event-status',
  templateUrl: './update-event-status.component.html',
  providers: [DatePipe]
})
export class UpdateEventStatusComponent implements OnInit {

  formModel: any = { status: null };
  showError: boolean = false;
  errorMessage: any;
  eventList: any = [];
  assignModel: any = {};
  selectedEvent: any = {};
  showMessage: any;
  responseMessage: any;
  updateId: any;
  isAddRemarks: boolean = false;

  constructor(private httpService: HttpService, private datePipe: DatePipe) {}

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

    this.httpService.getEventByProfessional(userId).subscribe({
      next: (res: any) => {
        this.eventList = res;
        this.showError = false;
      },
      error: (err: any) => {
        this.showError = true;
        if (err.status === 404) {
          this.errorMessage = 'No events assigned to you.';
        } else if (err.status === 403) {
          this.errorMessage = 'Not authorized to view events.';
        } else {
          this.errorMessage = 'Failed to fetch events. Please try again.';
        }
      }
    });
  }

  addStatus(val: any): void {
    if (!val || !val.id) return;
    this.updateId = val.id;
  }

  addRemarks(val: any): void {
    if (!val || !val.id) return;
    this.updateId = val.id;
    this.selectedEvent = { ...val };
    this.isAddRemarks = true;
  }

  updateStatus(): void {
    if (!this.updateId) {
      this.showError = true;
      this.errorMessage = 'Please select an event to update.';
      return;
    }

    if (!this.formModel.status) {
      this.showError = true;
      this.errorMessage = 'Please select a status.';
      return;
    }

    this.httpService.UpdateEventStatus(this.updateId, this.formModel.status).subscribe({
      next: () => {
        this.showMessage = true;
        this.responseMessage = 'Status updated successfully!';
        this.showError = false;
        this.formModel.status = null;
        this.updateId = null;
        this.getEvent();
      },
      error: (err: any) => {
        this.showError = true;
        if (err.status === 403) {
          this.errorMessage = 'Not authorized to update this event.';
        } else {
          this.errorMessage = 'Failed to update status. Please try again.';
        }
      }
    });
  }

  saveFeedBack(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.showError = true;
      this.errorMessage = 'User ID is missing. Please log in again.';
      return;
    }

    if (!this.updateId) {
      this.showError = true;
      this.errorMessage = 'No event selected for feedback.';
      return;
    }

    if (!this.formModel.content) {
      this.showError = true;
      this.errorMessage = 'Feedback content cannot be empty.';
      return;
    }

const feedbackData = {
  content: this.formModel.content,
  timestamp: new Date().toISOString()
};

    this.httpService.AddFeedback(this.updateId, userId, feedbackData).subscribe({
      next: () => {
        this.showMessage = true;
        this.responseMessage = 'Feedback submitted successfully!';
        this.showError = false;
        this.formModel.content = '';
        this.isAddRemarks = false;
        this.getEvent();
      },
      error: (err: any) => {
        this.showError = true;
        if (err.status === 403) {
          this.errorMessage = 'Not authorized to submit feedback.';
        } else {
          this.errorMessage = 'Failed to submit feedback. Please try again.';
        }
      }
    });
  }
}