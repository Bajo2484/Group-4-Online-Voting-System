import { Component, signal } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService, CurrentUser } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf],
})
export class App {

  protected readonly title = signal('e-voting');
  protected isLoginRoute = false;

  isProfileMenuOpen = false;
  notifications: any[] = []; // this will hold notifications
  unseenCount = 0;

  constructor(
    private readonly router: Router,
    public readonly auth: AuthService
  ) {
    // Initial route check
    this.checkRedirect(this.router.url);

    // Update route state on navigation
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateRouteState(event.urlAfterRedirects);
        this.checkRedirect(event.urlAfterRedirects);
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

  // Auto-redirect if logged in and trying to access login page
  private checkRedirect(url: string): void {
    const cleaned = url.split('?')[0];

    if ((cleaned === '' || cleaned === '/' || cleaned.startsWith('/login')) && this.auth.isLoggedIn()) {
      const user: CurrentUser | undefined = this.auth.getCurrentUser();
      if (!user) return;

      // Redirect based on role
      if (user.role === 'admin') {
        this.router.navigate(['/dashboard']);
      } else if (user.role === 'student') {
        this.router.navigate(['/student-dashboard']);
      } else if (user.role === 'elecom') {
        this.router.navigate(['/elecom-dashboard']);
      }
    }
  }

  // Toggle profile dropdown
  toggleProfileMenu(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
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

  // Navigate to admin settings
  goToAdminSettings(event?: MouseEvent): void {
    event?.stopPropagation(); // prevent parent toggle
    this.router.navigate(['/adminsettings']);
    this.isProfileMenuOpen = false;
  }

  // Navigate to role-specific notifications page
  goToNotifications(): void {
    if (this.auth.isStudent()) {
      this.router.navigate(['/student-notifications']);
    } else if (this.auth.isElecom()) {
      this.router.navigate(['/elecom-notifications']);
    } else if (this.auth.isAdmin()) {
      this.router.navigate(['/admin-notifications']);
    }
  }

  // Logout
  logout(): void {
    this.auth.clear();
    this.router.navigateByUrl('/');
    this.isProfileMenuOpen = false;
  }
}