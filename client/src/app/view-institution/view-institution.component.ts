import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-view-institution',
  templateUrl: './view-institution.component.html'
})
export class ViewInstitutionComponent implements OnInit {

  showError: boolean = false;
  errorMessage: any;
  eventList: any = [];

  constructor(private httpService: HttpService) {}

  ngOnInit(): void {
    this.getEvent();
  }

  getEvent(): void {
    this.httpService.viewAllEventss().subscribe({
      next: res => {
        this.eventList = res;
        this.showError = false;
      },
      error: err => {
        this.showError = true;
        if (err.status === 403) this.errorMessage = 'Not authorized to view events.';
        else this.errorMessage = 'Failed to fetch events. Please try again.';
      }
    });
  }

  formatProfessionals(pros: any[]): string {
    if (!pros || pros.length === 0) return '-';
    return pros
      .map(p => typeof p === 'string' ? p : (p.username ?? p.name ?? p.email ?? ''))
      .filter((v: string) => v && v.trim().length > 0)
      .join(', ');
  }
}