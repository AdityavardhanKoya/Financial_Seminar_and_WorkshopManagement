import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { NotificationService } from '../notification.service';

@Component({
  selector: 'app-add-feedback',
  templateUrl: './add-feedback.component.html',
  styleUrls: ['./add-feedback.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AddFeedbackComponent implements OnInit {
  events: any[] = [];
  selectedId: number | null = null;
  content = '';

  constructor(private http: HttpService, private notif: NotificationService) {}

  ngOnInit(): void {
    this.http.getProfessionalEvents().subscribe({
      next: (r) => {
        const list = r || [];
        this.events = list.filter((e: any) =>
          (e.status || '').toString().trim().toUpperCase() === 'COMPLETED'
        );
      },
      error: () => (this.events = [])
    });
  }

  submit(): void {
    if (this.selectedId === null || !this.content.trim()) {
      this.notif.show('Select event & enter feedback', 'warning', 3500);
      return;
    }



    this.http.addProfessionalFeedback(this.selectedId, {
      content: this.content.trim(),
      timestamp: new Date().toISOString()
    }).subscribe({
      next: () => {
        this.notif.show('Feedback submitted', 'success', 4000);
        this.content = '';
        this.selectedId = null;
      },
      error: (err) => {
        if (err.status === 409) {
          this.notif.show('Feedback already given', 'warning', 4000);
        } else {
          this.notif.show(err?.error?.message || 'Feedback failed', 'danger', 4000);
        }
      }
    });
  }
}