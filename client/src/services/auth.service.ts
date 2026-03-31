import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private token: string | null = null;
  private isLoggedIn: boolean = false;
private authState = new BehaviorSubject<boolean>(this.getLoginStatus);
authState$ = this.authState.asObservable();
  constructor() {}

  saveToken(token: string) {
  localStorage.setItem('token', token);
  this.authState.next(true);
}

  SetRole(role: any): void {
    localStorage.setItem('role', role);
  }

  get getRole(): string | null {
    return localStorage.getItem('role');
  }

  get getLoginStatus(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    this.token = localStorage.getItem('token');
    return this.token;
  }

logout() {
  localStorage.clear();
  this.authState.next(false);
}

  saveUserId(userid: string): void {
    localStorage.setItem('userId', userid);
  }
    getUserId(): string | null {
    return localStorage.getItem('userId');
  }
}