import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-view-events',
  templateUrl: './view-events.component.html',
  providers: [DatePipe]
})
export class ViewEventsComponent implements OnInit {

  formModel: any = { status: null };
  showError: boolean = false;
  errorMessage: any;
  eventObj: any = [];
  assignModel: any = {};
  showMessage: any;
  responseMessage: any;
  isUpdate: any = false;
  eventList: any = [];
  workShopList: any = [];
  userId: any;
  selectedEvent: any = {};
  status: any;
  roleName: string | null = null;

  constructor(private httpService: HttpService, private datePipe: DatePipe) {}

  ngOnInit(): void {
    this.userId = localStorage.getItem('userId');
    this.roleName = localStorage.getItem('role');
    this.getEvent();
  }





getEvent(): void {

  if (this.roleName === 'PARTICIPANT') {
    // ✅ Participant sees ALL events (public view)
    this.httpService.GetAlleventss().subscribe({
      next: res => {
        this.eventList = res;
        this.showError = false;
      },
      error: err => this.handleError(err)
    });
  }

  else if (this.roleName === 'INSTITUTION') {
    // ✅ Institution sees only ITS events
    this.httpService.viewAllEventss().subscribe({
      next: res => {
        this.eventList = res;
        this.showError = false;
      },
      error: err => this.handleError(err)
    });
  }

  else if (this.roleName === 'PROFESSIONAL') {
    // ✅ Professional sees only assigned events
    this.httpService.getEventByProfessional(this.userId).subscribe({
      next: res => {
        this.eventList = res;
        this.showError = false;
      },
      error: err => this.handleError(err)
    });
  }
}

handleError(err: any) {
  this.showError = true;
  if (err.status === 403) {
    this.errorMessage = 'Not authorized to view events.';
  } else {
    this.errorMessage = 'Failed to fetch events. Please try again.';
  }
}

  enroll(eventId: any): void {
    if (!this.userId) {
      this.showError = true;
      this.errorMessage = 'User ID missing. Please log in again.';
      return;
    }

    this.httpService.EnrollParticipant(eventId, this.userId).subscribe({
      next: () => {
        this.showMessage = true;
        this.responseMessage = 'Enrolled successfully!';
        this.showError = false;
        this.getEvent();
      },
      error: (err: any) => {
        this.showError = true;
        if (err.status === 409) {
          this.errorMessage = 'You are already enrolled in this event.';
        } else if (err.status === 403) {
          this.errorMessage = 'Not authorized to enroll.';
        } else {
          this.errorMessage = 'Enrollment failed. Please try again.';
        }
      }
    });
  }

  viewDetails(val: any): void {
    this.selectedEvent = { ...val };
    this.status = null;
    this.formModel.content = '';
  }

  saveFeedBack(): void {
    if (!this.selectedEvent || !this.selectedEvent.id) {
      this.showError = true;
      this.errorMessage = 'Please select an event first.';
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

    this.httpService.AddFeedbackByParticipants(
      this.selectedEvent.id, this.userId, feedbackData
    ).subscribe({
      next: () => {
        this.showMessage = true;
        this.responseMessage = 'Feedback submitted successfully!';
        this.showError = false;
        this.formModel.content = '';
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

  checkStatus(): void {
    if (!this.selectedEvent || !this.selectedEvent.id) {
      this.showError = true;
      this.errorMessage = 'Please select an event first.';
      return;
    }

    this.httpService.viewEventStatus(this.selectedEvent.id).subscribe({
      next: (res: any) => {
        this.status = res.status;
        console.log('Event status:', this.status);
        this.showError = false;
      },
      error: (err: any) => {
        this.showError = true;
        if (err.status === 404) {
          this.errorMessage = 'Event not found.';
        } else {
          this.errorMessage = 'Failed to fetch event status.';
        }
      }
    });
  }
}