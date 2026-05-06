import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NotificationService, Notification } from '../../../services/notification.service';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';
@Component({
  selector: 'app-admin-notifications',
  standalone: true,
  templateUrl: './admin-notifications.html',
  styleUrls: ['./admin-notifications.css'],
  imports: [NgIf, NgFor, DatePipe]
})
export class AdminNotifications implements OnInit {

  notifications: Notification[] = [];
  unreadCount: number = 0;
  loading: boolean = true;

  constructor(
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
    private firestore: Firestore
  ) {}

  ngOnInit(): void {
    this.notificationService.getAdminNotifications().subscribe((data) => {
      

      this.notifications = data.map(n => ({
        ...n,
        createdAt: n.createdAt?.toDate ? n.createdAt.toDate() : n.createdAt
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
  async approvedStudentRequest(student: any) {
    try {

      await updateDoc(
        doc(this.firestore, `candidateRequests/${student.requestId}`),
        { status: 'approved' }
      );

      await this.notificationService.addNotification({
        target: 'student',
        studentId: student.id,
        message: 'Your candidacy request has been approved.',
        type: 'approved',
        seen: false,
      });

      console.log('Student request approved and notification sent.');
    } catch (error) {
      console.error('Error approving student request:', error);
    }
  }
}