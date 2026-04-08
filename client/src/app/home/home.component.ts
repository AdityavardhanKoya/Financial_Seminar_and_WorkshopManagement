import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  isScrolled = false;
  currentSection = 'hero'; 

  constructor() {}

  @HostListener('window:scroll', [])
  onWindowScroll() {
    // 1. Handle navbar transparency
    this.isScrolled = window.scrollY > 100;

    // 2. Scroll Spy Logic for the dots
    const sections = ['hero', 'about', 'features', 'roles'];
    let current = 'hero';

    for (const section of sections) {
      const element = document.getElementById(section);
      if (element) {
        const rect = element.getBoundingClientRect();
        // If the top of the section is past the middle of the screen, it's the active one
        if (rect.top <= window.innerHeight / 2) {
          current = section;
        }
      }
    }
    
    // Update the active section
    this.currentSection = current;
  }

  // Smooth scroll when a dot is clicked
  scrollTo(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}