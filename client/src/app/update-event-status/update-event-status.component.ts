import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { NotificationService } from '../notification.service';

type AssignmentResponse = 'ACCEPTED' | 'REJECTED';

@Component({
  selector: 'app-update-event-status',
  templateUrl: './update-event-status.component.html',
  styleUrls: ['./update-event-status.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UpdateEventStatusComponent implements OnInit {
  events: any[] = [];
  userId = Number(localStorage.getItem('userId'));

  constructor(private http: HttpService, private notif: NotificationService) {}

  ngOnInit(): void {
    this.load();
  }

  private normalizeStatus(s: any): string {
    return (s ?? '').toString().trim().toUpperCase();
  }

  private isVisibleForProfessionalDashboard(e: any): boolean {
    const status = this.normalizeStatus(e?.status);
    if (!status) return true;
    if (status === 'COMPLETED') return false;
    if (status === 'CANCELLED') return false;
    return true;
  }

  load(): void {
    this.http.getProfessionalEvents().subscribe({
      next: (res: any) => {
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        const arr = Array.isArray(list) ? list : [];
        this.events = arr.filter(e => this.isVisibleForProfessionalDashboard(e));
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
    const status = this.normalizeStatus(e?.status);
    if (status === 'COMPLETED' || status === 'CANCELLED') {
      this.notif.show('This event is already closed. Response is not allowed.', 'warning', 4000);
      this.load();
      return;
    }

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
        const errorMsg = err?.error?.message || err?.error || err?.message || 'Assignment update failed';
        this.notif.show(errorMsg, 'danger', 4000);
      }
    });
  }

  trackById(_: number, e: any): any {
    return e?.id;
  }
}