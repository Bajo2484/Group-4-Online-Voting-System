import { Component, signal } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {

  

  protected readonly title = signal('e-voting');
  protected isLoginRoute = false;

  isProfileMenuOpen = false;
  isNotificationOpen = false;

  constructor(
    private readonly router: Router,
    public readonly auth: AuthService
  ) {
    this.updateRouteState(this.router.url);

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateRouteState(event.urlAfterRedirects);
      }
    });
  }

  // Detect login route
  private updateRouteState(url: string): void {
    const cleaned = url.split('?')[0];
    this.isLoginRoute =
      cleaned === '' ||
      cleaned === '/' ||
      cleaned.startsWith('/login');
  }

  // Profile dropdown toggle
  toggleProfileMenu(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
    this.isNotificationOpen = false; // close notif if open
  }

  // Notification toggle
  toggleNotifications(): void {
    this.isNotificationOpen = !this.isNotificationOpen;
    this.isProfileMenuOpen = false; // close profile if open
  }

  // Navigate to profile
  goToProfile(): void {
    if (this.auth.isAdmin()) {
      this.router.navigate(['/myprofile']);
    } else if (this.auth.isElecom()) {
      this.router.navigate(['/elecom-profile']);
    } else {
      this.router.navigate(['/student-profile']);
    }

    this.isProfileMenuOpen = false;
  }

  // Navigate to settings

goToAdminSettings(event?: MouseEvent): void {
  event?.stopPropagation(); // prevent parent toggle
  this.router.navigate(['/adminsettings']);
  this.isProfileMenuOpen = false;
}

   
  // Logout
  logout(): void {
    this.auth.clear();
    this.router.navigateByUrl('/');
    this.isProfileMenuOpen = false;
    this.isNotificationOpen = false;
  }
}