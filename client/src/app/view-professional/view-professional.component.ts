import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-view-professional',
  templateUrl: './view-professional.component.html'
})
export class ViewProfessionalComponent implements OnInit {

  formModel: any = { status: null };
  showError: boolean = false;
  errorMessage: any;
  showMessage: any;
  responseMessage: any;
  eventList: any = [];
  userId: any;
  selectedEvent: any = {};
  status: any;

  constructor(private httpService: HttpService) {}

  ngOnInit(): void {
    this.userId = localStorage.getItem('userId');
    this.getEvent();
  }

  getEvent(): void {
    this.httpService.getEventByProfessional(this.userId).subscribe({
      next: res => {
        this.eventList = res;
        this.showError = false;
      },
      error: err => {
        this.showError = true;
        if (err.status === 403) this.errorMessage = 'Not authorized to view events.';
        else this.errorMessage = 'Failed to fetch events. Please try again.';
      }
    });
  }

  formatProfessionals(pros: any[]): string {
    if (!pros || pros.length === 0) return '-';
    return pros
      .map(p => typeof p === 'string' ? p : (p.username ?? p.name ?? p.email ?? ''))
      .filter((v: string) => v && v.trim().length > 0)
      .join(', ');
  }

  viewDetails(val: any): void {
    this.selectedEvent = { ...val };
    this.status = null;
    this.formModel.content = '';
  }

  saveFeedBack(): void {
    if (!this.selectedEvent?.id) {
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

    this.httpService.AddFeedback(this.selectedEvent.id, this.userId, feedbackData).subscribe({
      next: () => {
        this.showMessage = true;
        this.responseMessage = 'Feedback submitted successfully!';
        this.showError = false;
        this.formModel.content = '';
        this.selectedEvent = {};
        this.getEvent();
      },
      error: err => {
        this.showError = true;
        if (err.status === 403) this.errorMessage = 'Not authorized to submit feedback.';
        else this.errorMessage = 'Failed to submit feedback. Please try again.';
      }
    });
  }

  checkStatus(): void {
    if (!this.selectedEvent?.id) {
      this.showError = true;
      this.errorMessage = 'Please select an event first.';
      return;
    }

    this.httpService.viewEventStatus(this.selectedEvent.id).subscribe({
      next: (res: any) => {
        this.status = res.status;
        this.showError = false;
      },
      error: err => {
        this.showError = true;
        if (err.status === 404) this.errorMessage = 'Event not found.';
        else this.errorMessage = 'Failed to fetch event status.';
      }
    });
  }
}
