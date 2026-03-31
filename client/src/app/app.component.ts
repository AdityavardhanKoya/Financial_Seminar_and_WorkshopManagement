import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  // styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  roleName: string | null = null;   // ✅ Needed by template
  IsLoggin: boolean = false;        // ✅ Needed by template

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.roleName = localStorage.getItem('role');  // e.g. INSTITUTION, PROFESSIONAL, PARTICIPANT
    this.IsLoggin = !!localStorage.getItem('token');   // true if logged in
  }

  logout(): void {   // ✅ Needed by template
    localStorage.clear();
    this.IsLoggin = false;
    this.roleName = null;
    this.router.navigate(['/login']);
  }

}