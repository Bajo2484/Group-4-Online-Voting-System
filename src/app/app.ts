import { Component, signal, OnInit } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService, CurrentUser } from './services/auth.service';
import { NotificationService, Notification } from './services/notification.service';
import { Subscription } from 'rxjs';
import { AdminTopbarComponent } from './layouts/admin-portal/admin-topbar/admin-topbar';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf,]
})
export class App implements OnInit {

  protected readonly title = signal('e-voting');
  protected isLoginRoute = false;

  isProfileMenuOpen = false;
  notifications: Notification[] = []; // holds notifications
  unseenCount = 0;

  sidebarOpen = false;

  private notifSub?: Subscription;

  constructor(
    private readonly router: Router,
    public readonly auth: AuthService,
    private readonly notificationService: NotificationService
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

  ngOnInit(): void {
    // Subscribe to notifications based on role
    this.subscribeNotifications();
  }

  private subscribeNotifications(): void {
    if (this.notifSub) {
      this.notifSub.unsubscribe();
    }

    if (this.auth.isAdmin()) {
      this.notifSub = this.notificationService.getAdminNotifications().subscribe((data) => {
        this.notifications = data;
        this.unseenCount = data.filter(n => !n.seen).length;

        const badge = document.querySelector('.notification-icon .badge');
        if(badge) {
          badge.classList.add('animate');
          setTimeout(() => badge.classList.remove('animate'), 400);
        }
      });
    } else if (this.auth.isElecom()) {
      this.notifSub = this.notificationService.getElecomNotifications().subscribe((data) => {
        this.notifications = data;
        this.unseenCount = data.filter(n => !n.seen).length;
      });
    } else if (this.auth.isStudent()) {
      const userId = this.auth.getCurrentUser()?.uid || ''; // ✅ fixed here
      this.notifSub = this.notificationService.getStudentNotifications(userId).subscribe((data) => {
        this.notifications = data;
        this.unseenCount = data.filter(n => !n.seen).length;

        const badge = document.querySelector('.notification-icon .badge');
        if(badge) {
          badge.classList.add('animate');
          setTimeout(() => badge.classList.remove('animate'), 400);
        }
      });
    }
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

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  // Navigate to profile
  goToSetting(): void {
    if (this.auth.isAdmin()) {
      this.router.navigate(['/myprofile']);
    } else {
      this.router.navigate(['/student-setting']);
    }
    this.isProfileMenuOpen = false;
  }

  goToElecomSetting(event?: MouseEvent): void {
    event?.stopPropagation(); 
    this.router.navigate(['/elecom-settings']);
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
      this.router.navigate(['/admin-notifications']);
    } else if (this.auth.isAdmin()) {
      this.router.navigate(['/admin-notifications']);
    }
  }

  // Logout
  logout(): void {
    this.auth.clear();
    this.router.navigateByUrl('/');
    this.isProfileMenuOpen = false;
    this.notifSub?.unsubscribe(); // cleanup subscription
  }
}