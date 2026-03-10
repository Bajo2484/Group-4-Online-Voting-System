import { Component, signal } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { NgIf } from '@angular/common';
<<<<<<< HEAD
import { AuthService, CurrentUser } from './services/auth.service';
=======
import { AuthService } from './services/auth.service';
>>>>>>> d55779593b30664f3eda9f9eec1350274bf88dd7

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {

<<<<<<< HEAD
=======
  

>>>>>>> d55779593b30664f3eda9f9eec1350274bf88dd7
  protected readonly title = signal('e-voting');
  protected isLoginRoute = false;

  isProfileMenuOpen = false;
  isNotificationOpen = false;

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

<<<<<<< HEAD
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
    this.isNotificationOpen = false; // close notifications if open
  }

  // Toggle notifications
=======
  // Profile dropdown toggle
  toggleProfileMenu(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
    this.isNotificationOpen = false; // close notif if open
  }

  // Notification toggle
>>>>>>> d55779593b30664f3eda9f9eec1350274bf88dd7
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
<<<<<<< HEAD
    this.isProfileMenuOpen = false;
  }

  // Navigate to admin settings
  goToAdminSettings(event?: MouseEvent): void {
    event?.stopPropagation(); // prevent parent toggle
    this.router.navigate(['/adminsettings']);
    this.isProfileMenuOpen = false;
  }

=======

    this.isProfileMenuOpen = false;
  }

  // Navigate to settings

goToAdminSettings(event?: MouseEvent): void {
  event?.stopPropagation(); // prevent parent toggle
  this.router.navigate(['/adminsettings']);
  this.isProfileMenuOpen = false;
}

   
>>>>>>> d55779593b30664f3eda9f9eec1350274bf88dd7
  // Logout
  logout(): void {
    this.auth.clear();
    this.router.navigateByUrl('/');
    this.isProfileMenuOpen = false;
    this.isNotificationOpen = false;
  }
}