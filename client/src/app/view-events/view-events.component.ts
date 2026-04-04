import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-view-events',
  templateUrl: './view-events.component.html'
})
export class ViewEventsComponent implements OnInit {

  // all events from backend
  allEvents: any[] = [];

  // current shown list (available or past)
  events: any[] = [];

  // toggle
  viewMode: 'AVAILABLE' | 'PAST' = 'AVAILABLE';

  page = 1;
  pageSize = 6;

  message = '';

  // ✅ Inline feedback
  openFeedbackEventId: number | null = null;
  feedbackText = '';

  // ✅ Enroll confirmation modal
  confirmEnrollPopup = false;
  enrollTargetEvent: any | null = null;

  // ✅ Enroll result popup
  enrollPopup = false;
  enrollPopupText = '';
  enrollPopupType: 'success' | 'danger' = 'success';

  // ✅ Feedback popup
  feedbackPopup = false;
  feedbackPopupText = '';
  feedbackPopupType: 'success' | 'danger' = 'success';

  // ✅ SEARCH
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

        // default view
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
      // show NOT completed
      this.events = this.allEvents.filter((ev: any) => {
        const s = (ev.status || '').toString().trim().toUpperCase();
        return s !== 'COMPLETED';
      });
    } else {
      // show completed as past
      this.events = this.allEvents.filter((ev: any) => {
        const s = (ev.status || '').toString().trim().toUpperCase();
        return s === 'COMPLETED';
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
    return this.events.filter(ev => this.matchesSearch(ev, term));
  }

  /* ================= PAGINATION ================= */
  get pagedEvents() {
    const list = this.filteredEvents;
    const start = (this.page - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  }

  get totalPages() {
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
    // update in allEvents
    const idxAll = this.allEvents.findIndex(ev => ev.id === eventId);
    if (idxAll !== -1) {
      this.allEvents[idxAll] = { ...this.allEvents[idxAll], enrolled: true };
    }

    // update in current visible list
    const idx = this.events.findIndex(ev => ev.id === eventId);
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

  /* ================= FEEDBACK (only after enrolled) ================= */
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

    this.http.addParticipantFeedback(e.id, { content: this.feedbackText }).subscribe({
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
        if (err.status === 409) {
          this.feedbackPopupText = 'Feedback given already';
          this.feedbackPopupType = 'danger';
        } else {
          this.feedbackPopupText = 'Feedback submission failed!';
          this.feedbackPopupType = 'danger';
        }
        this.feedbackPopup = true;

        setTimeout(() => {
          this.feedbackPopup = false;
          this.feedbackPopupText = '';
        }, 2500);
      }
    });
  }
}