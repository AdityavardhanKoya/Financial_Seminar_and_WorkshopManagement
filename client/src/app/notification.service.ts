import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface AppNotification {
  message: string;
  type: 'success' | 'danger' | 'warning' | 'info';
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private subj = new Subject<AppNotification | null>();
  notification$ = this.subj.asObservable();

  show(message: string, type: AppNotification['type'] = 'info', duration = 4000) {
    this.subj.next({ message, type });
    setTimeout(() => this.subj.next(null), duration);
  }

  clear() {
    this.subj.next(null);
  }
}