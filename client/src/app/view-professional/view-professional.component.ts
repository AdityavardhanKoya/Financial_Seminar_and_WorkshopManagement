import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { NotificationService } from '../notification.service';
 
@Component({
  selector: 'app-view-professional',
  templateUrl: './view-professional.component.html'
})
export class ViewProfessionalComponent implements OnInit {
 
  events: any[] = [];
 
  page = 1;
  pageSize = 6;
 
  // inline feedback controls
  openFeedbackEventId: number | null = null;
  feedbackText = '';
 
  constructor(
    private http: HttpService,
    private notif: NotificationService
  ) {}
 
  ngOnInit(): void {
    this.load();
  }
 
  load(): void {
    this.http.getProfessionalEvents().subscribe({
      next: (res: any) => this.events = res || [],
      error: () => this.notif.show('Failed to load professional events', 'danger', 4000)
    });
  }
 
  get pagedEvents() {
    const start = (this.page - 1) * this.pageSize;
    return this.events.slice(start, start + this.pageSize);
  }
 
  get totalPages() {
    return Math.max(1, Math.ceil(this.events.length / this.pageSize));
  }
 
  getEnrolledCount(e: any): number {
    return Number(e?.enrollmentCount ?? 0);
  }
 
  toggleAddFeedback(e: any): void {
    if (this.openFeedbackEventId === e.id) {
      this.openFeedbackEventId = null;
      this.feedbackText = '';
      return;
    }
 
    this.openFeedbackEventId = e.id;
    this.feedbackText = '';
  }
 
  submitFeedback(e: any): void {
    if (!this.feedbackText.trim()) {
      this.notif.show('Please enter feedback', 'warning', 3000);
      return;
    }
 
    if (!confirm('Submit feedback?')) return;
 
    this.http.addProfessionalFeedback(e.id, {
      content: this.feedbackText,
      timestamp: new Date().toISOString()
    }).subscribe({
      next: () => {
        this.notif.show('Feedback submitted successfully', 'success', 4000);
        this.feedbackText = '';
        this.openFeedbackEventId = null;
      },
      error: () => this.notif.show('Feedback submission failed', 'danger', 4000)
    });
  }
}
 