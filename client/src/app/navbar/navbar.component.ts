import { Component, OnDestroy, OnInit, HostListener } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { AppNotification, NotificationService } from '../notification.service';
import { AuthService } from '../../services/auth.service';
import { SelectedEventService } from '../selected-event.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  roleName: string | null = null;
  username: string | null = null;
  isLoggedIn = false;
  showNavbar = true; 
  isScrolled = false; // Added to track scrolling

  notification: AppNotification | null = null;
  selectedEvent: any | null = null;

  private sub = new Subscription();

  constructor(
    private auth: AuthService,
    private router: Router,
    private notif: NotificationService,
    private selected: SelectedEventService
  ) {}

  // Listens to scroll events to toggle the transparent/glass effect
  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  ngOnInit(): void {
    this.refresh();
    this.checkVisibility(this.router.url); 

    this.sub.add(this.notif.notification$.subscribe(n => (this.notification = n)));

    this.sub.add(
      this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
        this.checkVisibility(e.urlAfterRedirects || e.url);
        this.refresh();
        this.selectedEvent = this.selected.get();
      })
    );
  }

  checkVisibility(url: string): void {
    const cleanUrl = url.split('?')[0].split('#')[0].replace(/\/$/, "") || '/';
    const hiddenRoutes = ['/', '/home', '/login', '/registration', '/forgot-password', '/reset-password'];
    this.showNavbar = !hiddenRoutes.includes(cleanUrl);
  }

  refresh(): void {
    this.roleName = this.auth.getRoleFromToken?.() || this.auth.getRole?.() || localStorage.getItem('role');
    this.username = localStorage.getItem('username');
    this.isLoggedIn = this.auth.isLoggedIn();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/home']);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}