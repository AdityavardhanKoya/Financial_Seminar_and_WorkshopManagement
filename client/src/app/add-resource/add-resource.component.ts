import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { NotificationService } from '../notification.service';

@Component({
  selector: 'app-add-resource',
  templateUrl: './add-resource.component.html'
})
export class AddResourceComponent implements OnInit {

  events: any[] = [];

  selectedEventId: number | null = null;

  resource = {
    name: '',
    type: '',
    url: ''
  };

  constructor(
    private http: HttpService,
    private notif: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.http.getInstitutionEvents().subscribe({
      next: (res: any) => this.events = res || [],
      error: () => this.notif.show('Failed to load events', 'danger', 4000)
    });
  }

  submit(): void {
    if (!this.selectedEventId) {
      this.notif.show('Please select an event', 'warning', 3500);
      return;
    }

    if (!this.resource.name.trim() || !this.resource.type.trim()) {
      this.notif.show('Resource name and type are required', 'warning', 3500);
      return;
    }

    if (!confirm('Add this resource to the selected event?')) return;

    this.http.addResource(this.selectedEventId, this.resource).subscribe({
      next: () => {
        this.notif.show('Resource added successfully', 'success', 4000);
        this.resetForm();
      },
      error: () => {
        this.notif.show('Failed to add resource', 'danger', 4000);
      }
    });
  }

  resetForm(): void {
    this.selectedEventId = null;
    this.resource = {
      name: '',
      type: '',
      url: ''
    };
  }
}