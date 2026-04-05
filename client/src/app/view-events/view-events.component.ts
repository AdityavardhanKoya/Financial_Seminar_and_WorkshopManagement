import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-view-events',
  templateUrl: './view-events.component.html',
  styleUrls: ['./view-events.component.scss']
})
export class ViewEventsComponent implements OnInit {

  allEvents: any[] = [];
  events: any[] = [];

  viewMode: 'AVAILABLE' | 'PAST' = 'AVAILABLE';

  page = 1;
  pageSize = 6;

  message = '';

  openFeedbackEventId: number | null = null;
  feedbackText = '';

  confirmEnrollPopup = false;
  enrollTargetEvent: any | null = null;

  enrollPopup = false;
  enrollPopupText = '';
  enrollPopupType: 'success' | 'danger' = 'success';

  feedbackPopup = false;
  feedbackPopupText = '';
  feedbackPopupType: 'success' | 'danger' = 'success';

  searchInput = '';
  appliedSearch = '';

  constructor(private http: HttpService) {}

  ngOnInit(): void {
    this.loadParticipantEvents();
  }

  /* ================= LOAD PARTICIPANT EVENTS ================= */
  loadParticipantEvents(): void {
    this.http.getParticipantEvents().subscribe({
      next: (r) => {
        this.allEvents = r || [];
        this.page = 1;
        this.switchMode('AVAILABLE');
      },
      error: () => {
        this.message = 'Failed to load events';
      }
    });
  }

  /* ================= MODE SWITCH ================= */
 switchMode(mode: 'AVAILABLE' | 'PAST'): void {
  this.viewMode = mode;
  this.appliedSearch = '';
  this.searchInput = '';
  this.page = 1;

  if (mode === 'AVAILABLE') {
    // Available: show NOT completed (any)
    this.events = this.allEvents.filter((ev: any) => {
      const s = (ev.status || '').toString().trim().toUpperCase();
      return s !== 'COMPLETED';
    });
  } else {
    // Past: show ONLY completed + enrolled
    this.events = this.allEvents.filter((ev: any) => {
      const s = (ev.status || '').toString().trim().toUpperCase();
      return s === 'COMPLETED' && ev.enrolled === true;
    });
  }
}
  /* ================= SEARCH ================= */
  onSearch(): void {
    this.appliedSearch = (this.searchInput || '').trim();
    this.page = 1;
  }

  clearSearch(): void {
    this.searchInput = '';
    this.appliedSearch = '';
    this.page = 1;
  }

  private matchesSearch(ev: any, term: string): boolean {
    if (!term) return true;
    const q = term.toLowerCase();

    const title = (ev?.title || ev?.name || '').toString().toLowerCase();

    const profNames = Array.isArray(ev?.professionals)
      ? ev.professionals
          .map((p: any) => (p?.username || p?.name || '').toString().toLowerCase())
          .filter(Boolean)
          .join(' ')
      : '';

    return title.includes(q) || profNames.includes(q);
  }

  get filteredEvents(): any[] {
    const term = (this.appliedSearch || '').trim();
    if (!term) return this.events;
    return this.events.filter((ev) => this.matchesSearch(ev, term));
  }

  /* ================= PAGINATION ================= */
  get pagedEvents(): any[] {
    const list = this.filteredEvents;
    const start = (this.page - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredEvents.length / this.pageSize));
  }

  /* ================= ENROLL ================= */
  askEnroll(e: any): void {
    this.message = '';
    this.enrollTargetEvent = e;
    this.confirmEnrollPopup = true;
  }

  cancelEnroll(): void {
    this.confirmEnrollPopup = false;
    this.enrollTargetEvent = null;
  }

  confirmEnroll(): void {
    if (!this.enrollTargetEvent?.id) return;

    const eventId = this.enrollTargetEvent.id;

    this.http.enrollEvent(eventId).subscribe({
      next: () => {
        this.markEnrolled(eventId);
        this.showEnrollPopup('Successfully enrolled!', 'success');
        this.cancelEnroll();
      },
      error: (err) => {
        if (err.status === 409) {
          this.markEnrolled(eventId);
          this.showEnrollPopup('Already enrolled!', 'success');
        } else if (err.status === 400) {
          this.showEnrollPopup(err?.error?.message || 'Event capacity full', 'danger');
        } else {
          this.showEnrollPopup('Enroll failed', 'danger');
        }
        this.cancelEnroll();
      }
    });
  }

  private markEnrolled(eventId: number): void {
    const idxAll = this.allEvents.findIndex((ev) => ev.id === eventId);
    if (idxAll !== -1) {
      this.allEvents[idxAll] = { ...this.allEvents[idxAll], enrolled: true };
    }

    const idx = this.events.findIndex((ev) => ev.id === eventId);
    if (idx !== -1) {
      this.events[idx] = { ...this.events[idx], enrolled: true };
      this.events = [...this.events];
    }
  }

  private showEnrollPopup(text: string, type: 'success' | 'danger'): void {
    this.enrollPopupText = text;
    this.enrollPopupType = type;
    this.enrollPopup = true;

    setTimeout(() => {
      this.enrollPopup = false;
      this.enrollPopupText = '';
    }, 2500);
  }

  /* ================= FEEDBACK (PAST + ENROLLED) ================= */
  toggleAddFeedback(e: any): void {
    this.message = '';

    if (this.openFeedbackEventId === e.id) {
      this.openFeedbackEventId = null;
      this.feedbackText = '';
      return;
    }

    this.openFeedbackEventId = e.id;
    this.feedbackText = '';
  }

  submitInlineFeedback(e: any): void {
    if (!this.feedbackText.trim()) {
      this.message = 'Please enter feedback';
      return;
    }

    this.http.addParticipantFeedback(e.id, { content: this.feedbackText.trim() }).subscribe({
      next: () => {
        this.feedbackPopupText = 'Feedback submitted successfully!';
        this.feedbackPopupType = 'success';
        this.feedbackPopup = true;

        this.feedbackText = '';
        this.openFeedbackEventId = null;

        setTimeout(() => {
          this.feedbackPopup = false;
          this.feedbackPopupText = '';
        }, 2500);
      },
      error: (err) => {
        const msg = err?.error?.message || err?.error || 'Feedback submission failed';

        if (err.status === 409) {
          this.feedbackPopupText = 'Feedback submitted already';
        } else if (err.status === 403) {
          this.feedbackPopupText = msg || 'You must enroll to give feedback';
        } else {
          this.feedbackPopupText = msg;
        }

        this.feedbackPopupType = 'danger';
        this.feedbackPopup = true;

        setTimeout(() => {
          this.feedbackPopup = false;
          this.feedbackPopupText = '';
        }, 2500);
      }
    });
  }
}