import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashbaord',
  templateUrl: './dashbaord.component.html'
})
export class DashbaordComponent implements OnInit {

  roleName: string | null = null;
  username: string | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.roleName = localStorage.getItem('role');
    this.username = localStorage.getItem('username');
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}