import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../../services/notification.service';
import { AuthService } from '../../../services/auth.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-student-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-notifications.html',
  styleUrls: ['./student-notifications.css']
})
export class StudentNotifications implements OnInit {

  notifications: Notification[] = [];

  constructor(
    private auth: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {

    const studentId = this.auth.getCurrentUser()?.studentId;
    console.log('Current studentId:', studentId); 
    
    if (!studentId) return;

    // Subscribe to notifications from Firestore
    this.notificationService.getStudentNotifications(studentId).subscribe(notifs => {
      console.log('Notifications from Firestore:', notifs); // Debug
      this.notifications = notifs;
    });
  }

  markAsSeen(notification: Notification) {
    if (!notification.seen && notification.id) {
      notification.seen = true;
      this.notificationService.markAsSeen(notification.id);
    }
  }

  get unseenCount(): number {
    return this.notifications.filter(n => !n.seen).length;
  }

  getRemainingDays(date: Date): number {
    const today = new Date();
    const target = new Date(date);
    const diffTime = target.getTime() - today.getTime();
    return Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 0);
  }
}