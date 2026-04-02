import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {

  roleName: string | null = null;
  IsLoggin: boolean = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadState();
    // Re-check on every navigation so navbar updates after login/logout
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.loadState());
  }

  loadState(): void {
    this.roleName = localStorage.getItem('role');
    this.IsLoggin = !!localStorage.getItem('token');
  }

  logout(): void {
    localStorage.clear();
    this.IsLoggin = false;
    this.roleName = null;
    this.router.navigate(['/login']);
  }
}