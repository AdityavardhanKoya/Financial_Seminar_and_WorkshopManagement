import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SelectedEventService {
  private selected: any | null = null;

  set(event: any) { this.selected = event; }
  get() { return this.selected; }
  clear() { this.selected = null; }
}