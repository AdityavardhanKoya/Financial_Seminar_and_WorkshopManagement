 
import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service';
 
@Component({
  selector: 'app-view-events',
  templateUrl: './view-events.component.html'
})
export class ViewEventsComponent implements OnInit {
 
  events: any[] = [];
 
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
  searchInput = '';      // what user types
  appliedSearch = '';    // applied only after clicking Search button
 
  constructor(private http: HttpService) {}
 
  ngOnInit(): void {
    this.loadParticipantEvents();
  }
 
  /* ================= LOAD PARTICIPANT EVENTS ================= */
  loadParticipantEvents(): void {
    this.http.getParticipantEvents().subscribe({
      next: (r) => {
        const all = r || [];
 
        // ✅ hide COMPLETED events for participant
        this.events = all.filter((ev: any) => {
          const s = (ev.status || '').toString().trim().toUpperCase();
          return s !== 'COMPLETED';
        });
 
        // reset pagination when loading
        this.page = 1;
      },
      error: () => {
        this.message = 'Failed to load events';
      }
    });
  }
 
  /* ================= SEARCH ================= */
 
  onSearch(): void {
    this.appliedSearch = (this.searchInput || '').trim();
    this.page = 1; // ✅ go back to first page after search
  }
 
  clearSearch(): void {
    this.searchInput = '';
    this.appliedSearch = '';
    this.page = 1;
  }
 
  private matchesSearch(ev: any, term: string): boolean {
    if (!term) return true;
    const q = term.toLowerCase();
 
    // event title/name
    const title = (ev?.title || ev?.name || '').toString().toLowerCase();
 
    // professionals names (array)
    const profNames = Array.isArray(ev?.professionals)
      ? ev.professionals
          .map((p: any) => (p?.username || p?.name || p?.fullName || '').toString().toLowerCase())
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
 
  /* ================= ENROLL (ASK BEFORE ENROLLING) ================= */
 
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
    const idx = this.events.findIndex(ev => ev.id === eventId);
    if (idx !== -1) {
      this.events[idx] = { ...this.events[idx], enrolled: true };
      this.events = [...this.events]; // ✅ refresh UI
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
 
  /* ================= INLINE ADD FEEDBACK (ONLY AFTER ENROLLED) ================= */
 
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
      error: () => {
        this.feedbackPopupText = 'Feedback submission failed!';
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
 
 