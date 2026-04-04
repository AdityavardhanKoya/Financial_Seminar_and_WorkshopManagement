import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { NotificationService } from '../notification.service';

type AssignmentResponse = 'ACCEPTED' | 'REJECTED';
type EventProgressStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

@Component({
  selector: 'app-update-event-status',
  templateUrl: './update-event-status.component.html'
})
export class UpdateEventStatusComponent implements OnInit {
  events: any[] = [];
  status: EventProgressStatus | null = null;
  selectedId: number | null = null;

  userId = Number(localStorage.getItem('userId'));

  constructor(private http: HttpService, private notif: NotificationService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.http.getProfessionalEvents().subscribe({
      next: (res: any) => {
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        this.events = Array.isArray(list) ? list : [];
      },
      error: () => this.notif.show('Failed to load events', 'danger', 4000)
    });
  }

  myResponse(e: any): string {
    const map = e?.professionalStatus;
    if (!map || typeof map !== 'object') return 'PENDING';
    const v = map[this.userId] ?? map[String(this.userId)];
    return typeof v === 'string' ? v : 'PENDING';
  }

  assignedAt(e: any): string {
    const map = e?.professionalAssignedAt;
    if (!map || typeof map !== 'object') return '-';
    const ts = map[this.userId] ?? map[String(this.userId)];
    const num = typeof ts === 'number' ? ts : Number(ts);
    if (!Number.isFinite(num) || num <= 0) return '-';
    return new Date(num).toLocaleString();
  }

  professionalsText(e: any): string {
    const pros = Array.isArray(e?.professionals) ? e.professionals : [];
    return pros.map((p: any) => p?.username).filter(Boolean).join(', ') || '-';
  }

  respond(e: any, response: AssignmentResponse): void {
    const title = e?.title ?? 'this event';
    const msg =
      response === 'ACCEPTED'
        ? `Accept assignment for "${title}"?`
        : `Reject assignment for "${title}"? Institution will be notified.`;

    if (!confirm(msg)) return;

    this.http.respondToAssignment(e.id, response).subscribe({
      next: () => {
        this.notif.show(
          `Assignment ${response} (email sent)`,
          response === 'ACCEPTED' ? 'success' : 'warning',
          4000
        );
        this.load();
      },
      error: (err: any) => {
        // Extract a clean string from the error response object
        const errorMsg = err?.error?.message || err?.error || err?.message || 'Assignment update failed';
        // Check if errorMsg is still an object to prevent [object Object] display
        const finalMsg = typeof errorMsg === 'object' ? 'Assignment update failed' : errorMsg;
        this.notif.show(finalMsg, 'danger', 4000);
      }
    });
  }

  selectForStatus(e: any): void {
    this.selectedId = e?.id ?? null;
    this.status = null;
  }

  saveStatus(): void {
    if (!this.selectedId || !this.status) {
      this.notif.show('Choose status', 'warning', 3500);
      return;
    }
    if (!confirm('Save status update?')) return;

    this.http.updateEventStatus(this.selectedId, this.status).subscribe({
      next: () => {
        this.notif.show('Status updated (visible to all)', 'success', 4000);
        this.selectedId = null;
        this.status = null;
        this.load();
      },
      error: (err: any) => {
        // Extract a clean string from the error response object
        const errorMsg = err?.error?.message || err?.error || err?.message || 'Status update failed';
        // Check if errorMsg is still an object
        const finalMsg = typeof errorMsg === 'object' ? 'Status update failed' : errorMsg;
        this.notif.show(finalMsg, 'danger', 4000);
      }
    });
  }

  trackById(_: number, e: any): any {
    return e?.id;
  }
}