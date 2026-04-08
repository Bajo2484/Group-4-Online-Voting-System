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
      // Convert Firebase Timestamp to JS Date if needed
      this.notifications = data.map(n => ({
        ...n,
        date: (n.date && (n.date as any)?.toDate) ? (n.date as any).toDate() : n.date
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
 async approveStudentRequest(student: any) {
    try {
      const requestRef = doc(this.firestore, `candidateRequests/${student.requestId}`);
      await updateDoc(requestRef, { status: 'approved' });
      await this.notificationService.addNotification({
        target: 'student',
        studentId: student.studentId,
        message: `Your candidacy has been approved!`,
        date: new Date(),
        type: 'approved',
        seen: false
      });
      console.log('student notified succesfully!');
    }catch (error){
      console.error('error approving student !', error);
    }
    
  }
}