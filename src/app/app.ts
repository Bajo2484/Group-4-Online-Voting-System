import { Component, signal, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import {
  Router,
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
  NavigationEnd
} from '@angular/router';
import { NgIf } from '@angular/common';

import { AuthService, CurrentUser } from './services/auth.service';
import { NotificationService, Notification } from './services/notification.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf]
})
export class App implements OnInit, OnDestroy {

  protected readonly title = signal('e-voting');

  isLoginRoute = false;
  isProfileMenuOpen = false;
  sidebarOpen = false;

  notifications: Notification[] = [];
  unseenCount = 0;

  private notifSub?: Subscription;

  constructor(
    private readonly router: Router,
    public readonly auth: AuthService,
    private readonly notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {

    // ✅ SAFE ROUTE HANDLING (NO WARNING)
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateRouteState(event.urlAfterRedirects);
        this.checkRedirect(event.urlAfterRedirects);
      }
    });
  }

  ngOnInit(): void {
    // ✅ ONLY INITIALIZE (NO AUTO REDIRECT HERE)
    this.subscribeNotifications();
  }

  ngOnDestroy(): void {
    this.notifSub?.unsubscribe();
  }

  // =========================
  // NOTIFICATIONS
  // =========================
  private subscribeNotifications(): void {
    this.notifSub?.unsubscribe();

    const user = this.auth.getCurrentUser();
    if (!user) return;

    if (user.role === 'admin') {
      this.notifSub = this.notificationService.getAdminNotifications()
        .subscribe((data) => {
          this.notifications = data || [];
          this.unseenCount = (data || []).filter(n => !n.seen).length;
          this.cdr.markForCheck();
        });
    }

    else if (user.role === 'elecom') {
      this.notifSub = this.notificationService.getElecomNotifications()
        .subscribe((data) => {
          this.notifications = data || [];
          this.unseenCount = (data || []).filter(n => !n.seen).length;
          this.cdr.markForCheck();
        });
    }

    else if (user.role === 'student' && user.uid) {
      this.notifSub = this.notificationService.getStudentNotifications(user.uid)
        .subscribe((data) => {
          this.notifications = data || [];
          this.unseenCount = (data || []).filter(n => !n.seen).length;
          this.cdr.markForCheck();
        });
    }
  }

  // =========================
  // ROUTING
  // =========================
  private updateRouteState(url: string): void {
    const cleaned = url.split('?')[0];
    this.isLoginRoute =
      cleaned === '' ||
      cleaned === '/' ||
      cleaned.startsWith('/login');
  }

  private checkRedirect(url: string): void {
    const cleaned = url.split('?')[0];

    if (
      (cleaned === '' || cleaned === '/' || cleaned.startsWith('/login')) &&
      this.auth.isLoggedIn()
    ) {
      const user: CurrentUser | undefined = this.auth.getCurrentUser();
      if (!user) return;

      if (user.role === 'admin') {
        this.router.navigate(['/dashboard']);
      } 
      else if (user.role === 'student') {
        this.router.navigate(['/student-dashboard']);
      } 
      else if (user.role === 'elecom') {
        this.router.navigate(['/elecom-dashboard']);
      }
    }
  }

  // =========================
  // UI CONTROLS
  // =========================
  toggleProfileMenu(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  // =========================
  // NAVIGATION
  // =========================
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

  goToAdminSettings(event?: MouseEvent): void {
    event?.stopPropagation();
    this.router.navigate(['/admin-settings']);
    this.isProfileMenuOpen = false;
  }

  goToNotifications(): void {
    const user = this.auth.getCurrentUser();

    if (user?.role === 'student') {
      this.router.navigate(['/student-notifications']);
    } else if (user?.role === 'elecom') {
      this.router.navigate(['/elecom-notifications']);
    } else if (user?.role === 'admin') {
      this.router.navigate(['/admin-notifications']);
    }

    this.markAllAsSeen();
  }

  private markAllAsSeen(): void {
    const user = this.auth.getCurrentUser();
    if (!user) return;

    // UI update
    this.notifications = this.notifications.map(n => ({
      ...n,
      seen: true
    }));
    this.unseenCount = 0;

    // Firestore update
    this.notifications.forEach(n => {
      if (!n.seen && n.id) {
        this.notificationService.markAsSeen(n.id).catch(() => {});
      }
    });
  }

  // =========================
  // LOGOUT
  // =========================
  logout(): void {
    this.auth.clear();
    this.router.navigateByUrl('/');
    this.isProfileMenuOpen = false;

    this.notifSub?.unsubscribe();

    this.notifications = [];
    this.unseenCount = 0;
  }
}