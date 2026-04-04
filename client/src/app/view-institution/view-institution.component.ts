import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { NotificationService } from '../notification.service';
import { SelectedEventService } from '../selected-event.service';
 
@Component({
  selector: 'app-view-institution',
  templateUrl: './view-institution.component.html'
})
export class ViewInstitutionComponent implements OnInit {
  events: any[] = [];
  page = 1;
  pageSize = 6;
 
  constructor(
    private http: HttpService,
    private notif: NotificationService,
    private selected: SelectedEventService,
    private router: Router
  ) {}
 
  ngOnInit(): void {
    this.load();
  }
 
  load(): void {
    this.http.getInstitutionEvents().subscribe({
      next: (res: any) => this.events = res || [],
      error: () => this.notif.show('Failed to load institution events', 'danger', 4000)
    });
  }
 
  get pagedEvents() {
    const start = (this.page - 1) * this.pageSize;
    return this.events.slice(start, start + this.pageSize);
  }
 
  get totalPages() {
    return Math.max(1, Math.ceil(this.events.length / this.pageSize));
  }
 
  getProfessional(e: any): any | null {
    if (Array.isArray(e?.professionals) && e.professionals.length > 0) return e.professionals[0];
    return null;
  }
 
  openFeedbacks(e: any): void {
    this.selected.set(e);
    this.router.navigate(['/view-feedbacks']);
  }
}
 