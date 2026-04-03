import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppNotification, NotificationService } from '../notification.service';
import { AuthService } from '../../services/auth.service';
import { SelectedEventService } from '../selected-event.service';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html'
})
export class NavbarComponent implements OnInit, OnDestroy {
  roleName: string | null = null;
  username: string | null = null;
  isLoggedIn = false;

  notification: AppNotification | null = null;
  selectedEvent: any | null = null;

  private sub = new Subscription();

  constructor(
    private auth: AuthService,
    private router: Router,
    private notif: NotificationService,
    private selected: SelectedEventService
  ) {}

  ngOnInit(): void {
    this.refresh();

    this.sub.add(this.notif.notification$.subscribe(n => this.notification = n));

    // lightweight poll (optional) for selected event, since service holds in memory
    // For route-based changes it’s enough.
    this.selectedEvent = this.selected.get();
  }

  refresh(): void {
    this.roleName = this.auth.getRoleFromToken() || localStorage.getItem('role');
    this.username = this.auth.getUsername();
    this.isLoggedIn = this.auth.isLoggedIn();
  }

  logout(): void {
  this.auth.logout();      // ✅ FIX
  this.router.navigate(['/login']);
}

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}