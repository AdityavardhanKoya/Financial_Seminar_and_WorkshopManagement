import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { NotificationService } from '../notification.service';


@Component({
  selector: 'app-add-feedback',
  templateUrl: './add-feedback.component.html'
})
export class AddFeedbackComponent implements OnInit {
  events: any[] = [];
  selectedId: number | null = null;
  content = '';

  constructor(private http: HttpService, private notif: NotificationService) {}

  ngOnInit(): void {
    this.http.getProfessionalEvents().subscribe({ next: r => this.events = r || [] });
  }

  submit(): void {
    if (!this.selectedId || !this.content.trim()) {
      this.notif.show('Select event & enter feedback', 'warning', 3500);
      return;
    }
    if (!confirm('Submit feedback?')) return;

    this.http.addProfessionalFeedback(this.selectedId, {
      content: this.content,
      timestamp: new Date().toISOString()
    }).subscribe({
      next: () => {
        this.notif.show('Feedback submitted', 'success', 4000);
        this.content = '';
      },
      error: () => this.notif.show('Feedback failed', 'danger', 4000)
    });
  }
}