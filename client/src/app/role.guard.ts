import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';



@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

 canActivate(route: ActivatedRouteSnapshot): boolean {
  const allowedRoles = route.data['roles'];
  const role = this.auth.getRole(); 

  if (!role) return false;
  return allowedRoles.includes(role);
}
}