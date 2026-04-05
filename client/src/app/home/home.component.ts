import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  // Variable to track scroll state
  isScrolled = false;

  constructor() {}

  // Listen to window scroll events
  @HostListener('window:scroll', [])
  onWindowScroll() {
    // If the user scrolls down more than 100 pixels, set isScrolled to true
    this.isScrolled = window.scrollY > 100;
  }
}