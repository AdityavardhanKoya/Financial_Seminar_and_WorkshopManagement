import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { SelectedEventService } from './selected-event.service';

@Injectable({ providedIn: 'root' })
export class SelectedEventGuard implements CanActivate {
  constructor(private selected: SelectedEventService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    return this.selected.get()?.id ? true : this.router.parseUrl('/view-events');
  }
}