import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-view-events',
  templateUrl: './view-events.component.html',
  styleUrls: ['./view-events.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ViewEventsComponent implements OnInit {
  allEvents: any[] = [];
  events: any[] = [];
  viewMode: 'AVAILABLE' | 'PAST' = 'AVAILABLE';
  page = 1;
  pageSize = 6;
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

  ngOnInit(): void { this.loadParticipantEvents(); }

  loadParticipantEvents(): void {
    this.http.getParticipantEvents().subscribe({
      next: (r) => { this.allEvents = r || []; this.switchMode('AVAILABLE'); },
      error: () => {}
    });
  }

  switchMode(mode: 'AVAILABLE' | 'PAST'): void {
    this.viewMode = mode; this.appliedSearch = ''; this.searchInput = ''; this.page = 1;
    if (mode === 'AVAILABLE') {
      this.events = this.allEvents.filter((ev: any) => (ev.status || '').toString().toUpperCase() !== 'COMPLETED');
    } else {
      this.events = this.allEvents.filter((ev: any) => (ev.status || '').toString().toUpperCase() === 'COMPLETED' && ev.enrolled === true);
    }
  }

  onSearch(): void { this.appliedSearch = (this.searchInput || '').trim(); this.page = 1; }
  clearSearch(): void { this.searchInput = ''; this.appliedSearch = ''; this.page = 1; }

  get filteredEvents(): any[] {
    const term = (this.appliedSearch || '').toLowerCase();
    if (!term) return this.events;
    return this.events.filter(ev => (ev?.title || '').toLowerCase().includes(term));
  }

  get pagedEvents(): any[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredEvents.slice(start, start + this.pageSize);
  }

  get totalPages(): number { return Math.max(1, Math.ceil(this.filteredEvents.length / this.pageSize)); }

  askEnroll(e: any): void { this.enrollTargetEvent = e; this.confirmEnrollPopup = true; }
  cancelEnroll(): void { this.confirmEnrollPopup = false; this.enrollTargetEvent = null; }

  confirmEnroll(): void {
    if (!this.enrollTargetEvent?.id) return;
    this.http.enrollEvent(this.enrollTargetEvent.id).subscribe({
      next: () => { this.markEnrolled(this.enrollTargetEvent.id); this.showToast('Successfully enrolled!', 'success', 'enroll'); this.cancelEnroll(); },
      error: (err) => { 
        const msg = err.status === 409 ? 'Already enrolled!' : 'Enroll failed';
        this.showToast(msg, err.status === 409 ? 'success' : 'danger', 'enroll');
        this.cancelEnroll(); 
      }
    });
  }
    getProfessional(e: any): any | null {
    if (Array.isArray(e?.professionals) && e.professionals.length > 0) return e.professionals[0];
    return null;
  }
  private markEnrolled(id: number): void {
    const update = (list: any[]) => { const i = list.findIndex(ev => ev.id === id); if (i !== -1) list[i].enrolled = true; };
    update(this.allEvents); update(this.events);
  }

  private showToast(text: string, type: 'success' | 'danger', context: 'enroll' | 'feedback'): void {
    if (context === 'enroll') { this.enrollPopupText = text; this.enrollPopupType = type; this.enrollPopup = true; setTimeout(() => this.enrollPopup = false, 2500); }
    else { this.feedbackPopupText = text; this.feedbackPopupType = type; this.feedbackPopup = true; setTimeout(() => this.feedbackPopup = false, 2500); }
  }

  toggleAddFeedback(e: any): void { this.openFeedbackEventId = this.openFeedbackEventId === e.id ? null : e.id; this.feedbackText = ''; }
  submitInlineFeedback(e: any): void {
    if (!this.feedbackText.trim()) return;
    this.http.addParticipantFeedback(e.id, { content: this.feedbackText.trim() }).subscribe({
      next: () => { this.showToast('Feedback submitted!', 'success', 'feedback'); this.feedbackText = ''; this.openFeedbackEventId = null; },
      error: () => this.showToast('Feedback failed', 'danger', 'feedback')
    });
  }
}