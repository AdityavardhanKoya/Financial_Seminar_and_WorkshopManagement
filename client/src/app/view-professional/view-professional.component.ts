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

}