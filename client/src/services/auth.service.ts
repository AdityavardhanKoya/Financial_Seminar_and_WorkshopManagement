import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private TOKEN_KEY = 'token';
  private ROLE_KEY = 'role';
  private USER_ID_KEY = 'userId';
  private USERNAME_KEY = 'username';



  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  SetRole(role: string): void {
    if (role) {
      localStorage.setItem(this.ROLE_KEY, role);
    }
  }

  getRole(): string | null {
 
    const tokenRole = this.getRoleFromToken();
    return tokenRole || localStorage.getItem(this.ROLE_KEY);
  }


  saveUserId(userId: string): void {
    localStorage.setItem(this.USER_ID_KEY, userId);
  }

  getUserId(): string | null {
    return localStorage.getItem(this.USER_ID_KEY);
  }


  saveUsername(username: string): void {
    localStorage.setItem(this.USERNAME_KEY, username);
  }

  getUsername(): string | null {
    return localStorage.getItem(this.USERNAME_KEY);
  }


  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.clear();
  }


  getRoleFromToken(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || payload.authority || null;
    } catch (e) {
      console.error('Invalid JWT token', e);
      return null;
    }
  }


  getUserIdFromToken(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId?.toString() || payload.id?.toString() || null;
    } catch {
      return null;
    }
  }
}