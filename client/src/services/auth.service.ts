import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private TOKEN_KEY = 'token';
  private ROLE_KEY = 'role';
  private USER_ID_KEY = 'userId';
  private USERNAME_KEY = 'username';

  /* =========================
     TOKEN METHODS
     ========================= */

  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  /* =========================
     ROLE METHODS
     ========================= */

  // ✅ keep method name same as your login component uses
  SetRole(role: string): void {
    if (role) {
      localStorage.setItem(this.ROLE_KEY, role);
    }
  }

  getRole(): string | null {
    // ✅ Prefer JWT role if available
    const tokenRole = this.getRoleFromToken();
    return tokenRole || localStorage.getItem(this.ROLE_KEY);
  }

  /* =========================
     USER ID METHODS
     ========================= */

  saveUserId(userId: string): void {
    localStorage.setItem(this.USER_ID_KEY, userId);
  }

  getUserId(): string | null {
    return localStorage.getItem(this.USER_ID_KEY);
  }

  /* =========================
     USERNAME METHODS
     ========================= */

  saveUsername(username: string): void {
    localStorage.setItem(this.USERNAME_KEY, username);
  }

  getUsername(): string | null {
    return localStorage.getItem(this.USERNAME_KEY);
  }

  /* =========================
     AUTH CHECK
     ========================= */

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.clear();
  }

  /* =========================
     JWT HELPERS (IMPORTANT)
     ========================= */

  /**
   * ✅ Decodes JWT and extracts role
   * JWT payload must contain:
   *   role OR authority
   */
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

  /**
   * ✅ Optional helper: get userId from token
   */
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