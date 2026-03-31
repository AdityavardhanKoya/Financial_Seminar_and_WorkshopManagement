import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-add-feedback',
  templateUrl: './add-feedback.component.html',
  providers: [DatePipe]
})
export class AddFeedbackComponent implements OnInit {

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

  constructor(private httpService: HttpService, private datePipe: DatePipe) {
    if (!this.formModel.status) {
      this.formModel.status = null;
    }
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

    this.httpService.getEventByProfessional(userId).subscribe({
      next: (res: any) => {
        this.eventList = res;
        this.showError = false;
      },
      error: (err: any) => {
        this.showError = true;
        if (err.status === 404) {
          this.errorMessage = 'No events found for this user.';
        } else if (err.status === 403) {
          this.errorMessage = 'Not authorized to view events.';
        } else {
          this.errorMessage = 'Failed to fetch events. Please try again.';
        }
      }
    });
  }

  addRemarks(val: any): void {
    if (!val || !val.id) return;
    this.updateId = val.id;
    this.selectedEvent = { ...val };
    this.isAddRemarks = true;
  }

  saveFeedBack(): void {
    if (!this.updateId) {
      this.showError = true;
      this.errorMessage = 'No event selected. Please select an event.';
      return;
    }

    if (!this.formModel.content) {
      this.showError = true;
      this.errorMessage = 'Feedback content cannot be empty.';
      return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.showError = true;
      this.errorMessage = 'User ID is missing. Please log in again.';
      return;
    }

    const timestamp = this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss');
    const feedbackData = { content: this.formModel.content, timestamp };

    this.httpService.AddFeedback(this.updateId, userId, feedbackData).subscribe({
      next: () => {
        this.showMessage = true;
        this.responseMessage = 'Feedback submitted successfully!';
        this.showError = false;
        this.formModel.content = '';
        this.isAddRemarks = false;
        this.selectedEvent = {};
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