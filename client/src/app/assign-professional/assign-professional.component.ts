import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { NotificationService } from '../notification.service';


@Component({
  selector: 'app-assign-professional',
  templateUrl: './assign-professional.component.html'
})
export class AssignProfessionalComponent implements OnInit {
  events: any[] = [];
  pros: any[] = [];
  selectedEventId: number | null = null;
  selectedProfId: number | null = null;
allEvents:any[]=[];
eventSearch!:string;
profSearch!:string;
allPros:any[]=[];
  constructor(private http: HttpService, private notif: NotificationService) {}

  ngOnInit(): void {
    this.http.getInstitutionEvents().subscribe({ next: r => this.events = r || [] });
    this.http.getProfessionals().subscribe({ next: r => this.pros = r || [] });
  }

  assign(): void {
    if (!this.selectedEventId || !this.selectedProfId) {
      this.notif.show('Select event and professional', 'warning', 3500);
      return;
    }
    if (!confirm('Assign this professional?')) return;

    this.http.assignProfessional(this.selectedEventId, this.selectedProfId).subscribe({
      next: () => this.notif.show('Professional assigned (email sent)', 'success', 4000),
      error: () => this.notif.show('Assign failed', 'danger', 4000)
    });
  }
  searchEvents() {
  this.events = this.allEvents.filter(e =>
    e.title.toLowerCase().includes(this.eventSearch.toLowerCase())
  );
}

searchProfessionals() {
  this.pros = this.allPros.filter(p =>
    p.username.toLowerCase().includes(this.profSearch.toLowerCase())
  );
}
}