import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { NotificationService } from '../notification.service';


@Component({
  selector: 'app-update-event-status',
  templateUrl: './update-event-status.component.html'
})
export class UpdateEventStatusComponent implements OnInit {
  events: any[] = [];
  status: string | null = null;
  selectedId: number | null = null;

  constructor(private http: HttpService, private notif: NotificationService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.http.getProfessionalEvents().subscribe({
      next: (res: any) => this.events = res || [],
      error: () => this.notif.show('Failed to load events', 'danger', 4000)
    });
  }

  respond(e: any, response: 'ACCEPTED' | 'REJECTED'): void {
    const msg = response === 'ACCEPTED'
      ? `Accept assignment for "${e.title}"?`
      : `Reject assignment for "${e.title}"? Institution will be notified.`;

    if (!confirm(msg)) return;

    this.http.respondToAssignment(e.id, response).subscribe({
      next: () => {
        this.notif.show(`Assignment ${response} (email sent)`, response === 'ACCEPTED' ? 'success' : 'warning', 4000);
        this.load();
      },
      error: (err: any) => this.notif.show(err?.error || 'Assignment update failed', 'danger', 4000)
    });
  }

  selectForStatus(e: any): void {
    this.selectedId = e.id;
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
      error: (err: any) => this.notif.show(err?.error || 'Status update failed', 'danger', 4000)
    });
  }
}