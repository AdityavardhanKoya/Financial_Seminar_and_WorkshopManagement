import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpService } from '../../services/http.service';
import { SelectedEventService } from '../selected-event.service';

@Component({
  selector: 'app-view-events',
  templateUrl: './view-events.component.html'
})
export class ViewEventsComponent implements OnInit {

  role: string | null = null;
  events: any[] = [];

  page = 1;
  pageSize = 6;

  selectedEvent: any | null = null;
  feedbackText = '';
  statusText: string | null = null;

  enrollPopup = false;
  message = '';

  constructor(
    private http: HttpService,
    private auth: AuthService,
    private selectedSvc: SelectedEventService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.role = this.auth.getRoleFromToken();
    this.load();
  }

  /* ================= LOAD EVENTS ================= */

  load(): void {
    if (this.role === 'INSTITUTION') {
      this.http.getInstitutionEvents().subscribe({
        next: r => this.events = r || []
      });
    } else if (this.role === 'PROFESSIONAL') {
      this.http.getProfessionalEvents().subscribe({
        next: r => this.events = r || []
      });
    } else {
      // ✅ participant events (already sorted by backend – recent first)
      this.http.getParticipantEvents().subscribe({
        next: r => this.events = r || []
      });
    }
  }

  /* ================= PAGINATION ================= */

  get pagedEvents() {
    const start = (this.page - 1) * this.pageSize;
    return this.events.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.max(1, Math.ceil(this.events.length / this.pageSize));
  }

  /* ================= INSTITUTION ================= */

  openFeedbacks(e: any): void {
    this.selectedSvc.set(e);
    this.router.navigate(['/view-feedbacks']);
  }

  /* ================= PARTICIPANT ================= */

  enroll(e: any): void {
  this.http.enrollEvent(e.id).subscribe({
    next: () => {
      this.enrollPopup = true;

      // ✅ IMPORTANT: update event inside MAIN array
      const idx = this.events.findIndex(ev => ev.id === e.id);
      if (idx !== -1) {
        this.events[idx] = {
          ...this.events[idx],
          enrolled: true
        };
      }

      setTimeout(() => this.enrollPopup = false, 3000);
    },
    error: (err) => {
      if (err.status === 409) {
        const idx = this.events.findIndex(ev => ev.id === e.id);
        if (idx !== -1) {
          this.events[idx] = {
            ...this.events[idx],
            enrolled: true
          };
        }
      }
    }
  });
}

  selectEvent(e: any): void {
    this.selectedEvent = e;
    this.feedbackText = '';
    this.statusText = null;
  }

  checkStatus(): void {
    if (!this.selectedEvent?.id) return;

    this.http.viewEventStatus(this.selectedEvent.id).subscribe({
      next: (res: any) => {
        this.statusText = res?.status || res;
      },
      error: () => {
        this.message = 'Failed to fetch status';
      }
    });
  }

  submitParticipantFeedback(): void {
    if (!this.selectedEvent?.id || !this.feedbackText.trim()) {
      this.message = 'Please enter feedback';
      return;
    }

    this.http.addParticipantFeedback(this.selectedEvent.id, {
      content: this.feedbackText
    }).subscribe({
      next: () => {
        this.message = 'Feedback submitted successfully';
        this.feedbackText = '';
        this.selectedEvent = null;
      },
      error: () => {
        this.message = 'Feedback submission failed';
      }
    });
  }
}