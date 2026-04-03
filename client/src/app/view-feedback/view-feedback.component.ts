import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { NotificationService } from '../notification.service';
import { SelectedEventService } from '../selected-event.service';


@Component({
  selector: 'app-view-feedback',
  templateUrl: './view-feedback.component.html'
})
export class ViewFeedbacksComponent implements OnInit {
  selectedEvent: any | null = null;
  feedbacks: any[] = [];

  constructor(
    private http: HttpService,
    private selected: SelectedEventService,
    private notif: NotificationService
  ) {}

  ngOnInit(): void {
    this.selectedEvent = this.selected.get();
    if (!this.selectedEvent?.id) {
      this.notif.show('Select an event first', 'warning', 4000);
      return;
    }

    this.http.getInstitutionFeedbacks(this.selectedEvent.id).subscribe({
      next: (res: any) => this.feedbacks = res || [],
      error: () => this.notif.show('Failed to load feedbacks', 'danger', 4000)
    });
  }
}