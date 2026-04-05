import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(public router: Router) {}

  // Determines if the portal's global navbar should be displayed
  shouldShowNavbar(): boolean {
    const currentRoute = this.router.url;
    const portalExcludedRoutes = ['/', '/home', '/login', '/registration','/#about'];
    return !portalExcludedRoutes.includes(currentRoute);
  }
}