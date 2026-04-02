import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-dashbaord',
  templateUrl: './dashbaord.component.html'
})
export class DashbaordComponent implements OnInit {

  roleName: string | null = null;
  username: string | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void { 

    // ✅ Load initial values
    this.loadValues();

    // ✅ Auto-update dashboard whenever route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.loadValues();
      });
  }

  loadValues(): void {
    this.roleName = localStorage.getItem('role');
    this.username = localStorage.getItem('username');
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}