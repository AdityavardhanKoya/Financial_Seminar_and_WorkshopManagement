import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { AppNotification, NotificationService } from '../notification.service';
import { AuthService } from '../../services/auth.service';
import { SelectedEventService } from '../selected-event.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'] // Assuming you have your SCSS linked here
})
export class NavbarComponent implements OnInit, OnDestroy {
  roleName: string | null = null;
  username: string | null = null;
  isLoggedIn = false;
  showNavbar = true; // Visibility flag for the navbar

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
    this.checkVisibility(this.router.url); // Initial check on load

    // toast/notification bar
    this.sub.add(this.notif.notification$.subscribe(n => (this.notification = n)));

    // update navbar values (role/username/selectedEvent/visibility) on every route change
    this.sub.add(
      this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
        this.checkVisibility(e.urlAfterRedirects || e.url);
        this.refresh();
        this.selectedEvent = this.selected.get();
      })
    );

    // initial load
    this.selectedEvent = this.selected.get();
  }

  // Method to hide the navbar on specific routes
  checkVisibility(url: string): void {
    // List of routes where the navbar should NOT be displayed
    const hiddenRoutes = ['/', '/home', '/login', '/registration'];
    // Strip query parameters just in case (e.g., /login?returnUrl=...)
    const cleanUrl = url.split('?')[0]; 
    
    this.showNavbar = !hiddenRoutes.includes(cleanUrl);
  }

  refresh(): void {
    // role: from token OR storage
    this.roleName = this.auth.getRoleFromToken?.() || this.auth.getRole?.() || localStorage.getItem('role');
    this.username = localStorage.getItem('username');
    this.isLoggedIn = this.auth.isLoggedIn();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}