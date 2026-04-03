import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { NotificationService } from '../notification.service';

@Component({
  selector: 'app-delete-event',
  templateUrl: './delete-event.component.html'
})
export class DeleteEventComponent implements OnInit {
  events: any[] = [];
  page = 1;
  pageSize = 5;

  constructor(private http: HttpService, private notif: NotificationService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.http.getInstitutionEvents().subscribe({
      next: (res: any) => this.events = res || [],
      error: () => this.notif.show('Failed to load events', 'danger', 4000)
    });
  }

  get pagedEvents() {
    const start = (this.page - 1) * this.pageSize;
    return this.events.slice(start, start + this.pageSize);
  }
  get totalPages() {
    return Math.max(1, Math.ceil(this.events.length / this.pageSize));
  }

  delete(e: any): void {
    if (!confirm(`Delete "${e.title}"? This cannot be undone.`)) return;
    this.http.deleteEvent(e.id).subscribe({
      next: () => {
        this.notif.show('Event deleted', 'success', 4000);
        this.load();
      },
      error: () => this.notif.show('Delete failed (not your event?)', 'danger', 4000)
    });
  }
}