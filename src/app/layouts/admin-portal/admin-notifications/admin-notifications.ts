import { Component, OnInit } from '@angular/core';
import { NotificationService, Notification } from '../../../services/notification.service';
import { NgFor, NgIf, DatePipe } from '@angular/common';

@Component({
  selector: 'app-admin-notifications',
  templateUrl: './admin-notifications.html',
  styleUrls: ['./admin-notifications.css'],
  imports: [NgIf, NgFor, DatePipe]
})
export class AdminNotifications implements OnInit {

  notifications: Notification[] = [];
  unreadCount: number = 0;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.getAdminNotifications().subscribe((data) => {
      // Convert Firebase Timestamp to JS Date if needed
      this.notifications = data.map(n => ({
        ...n,
        date: (n.date && (n.date as any)?.toDate) ? (n.date as any).toDate() : n.date
      }));

      this.unreadCount = this.notifications.filter(n => !n.seen).length;

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
      // Update local array
      const notif = this.notifications.find(n => n.id === notificationId);
      if (notif) notif.seen = true;

      this.unreadCount = this.notifications.filter(n => !n.seen).length;

      // Bell animation
      const badge = document.querySelector('.notif-badge');
      if (badge && this.unreadCount > 0) {
        badge.classList.add('animate');
        setTimeout(() => badge.classList.remove('animate'), 400);
      }
    });
  }
}