import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NotificationService, Notification } from '../../../services/notification.service';
import { NgFor, NgIf, DatePipe } from '@angular/common';

@Component({
  selector: 'app-elecom-notifications',
  standalone: true,
  templateUrl: './elecom-notifications.html',
  styleUrls: ['./elecom-notifications.css'],
  imports: [NgIf, NgFor, DatePipe]
})
export class ElecomNotifications implements OnInit {

  notifications: Notification[] = [];
  unreadCount: number = 0;
  loading: boolean = true;

  constructor(
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.notificationService.getAdminNotifications().subscribe((data) => {
      // Convert Firebase Timestamp to JS Date if needed
      this.notifications = data.map(n => ({
        ...n,
        createdAt: (n.createdAt && (n.createdAt as any)?.toDate) ? (n.createdAt as any).toDate() : n.createdAt
      }));

      this.unreadCount = this.notifications.filter(n => !n.seen).length;
      this.loading = false;

      // Force Angular to update template immediately
      this.cdr.detectChanges();

      // Bell animation
      const badge = document.querySelector('.notif-badge');
      if (badge && this.unreadCount > 0) {
        badge.classList.add('animate');
        setTimeout(() => badge.classList.remove('animate'), 400);
      }
    });
  }

  markAsSeen(notificationId?: string) {
    if (!notificationId) return;

    this.notificationService.markAsSeen(notificationId).then(() => {
      const notif = this.notifications.find(n => n.id === notificationId);
      if (notif) notif.seen = true;

      this.unreadCount = this.notifications.filter(n => !n.seen).length;

      // Force Angular to update template immediately
      this.cdr.detectChanges();

      // Bell animation
      const badge = document.querySelector('.notif-badge');
      if (badge && this.unreadCount > 0) {
        badge.classList.add('animate');
        setTimeout(() => badge.classList.remove('animate'), 400);
      }
    });
  }
}