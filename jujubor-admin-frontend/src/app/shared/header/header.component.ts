import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ RouterLink ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  menuOpen = false;
  isMobile = false;
  currentRoute = '';

  constructor(private router: Router) {
    router.events.subscribe(() => {
      this.currentRoute = this.router.url;
      if (this.isMobile) {
        this.menuOpen = false; // auto-close on route change (mobile)
      }
    });
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  toggleDropdown(event: Event) {
    if (this.isMobile) {
      event.preventDefault();
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile) {
      this.menuOpen = false;
    }
  }

  ngOnInit() {
    this.onResize();
    this.currentRoute = this.router.url;
  }

  isActive(route: string): boolean {
    return this.currentRoute === route;
  }
}
