import { ChangeDetectorRef, Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../../services/notification.service';
import { AuthService } from '../../../services/auth.service';


@Component({
  selector: 'app-student-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-notifications.html',
  styleUrls: ['./student-notifications.css']
})
export class StudentNotifications implements OnInit {

  notifications: Notification[] = [];
  loading = true;

  constructor(
    private auth: AuthService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.loading = true;

    const user = this.auth.getCurrentUser();
    const studentId = user?.uid;

    if (!studentId) {
      this.loading = false;
      this.notifications = [];
      return;
    }

   this.notificationService.getStudentNotifications(studentId)
  .subscribe({
    next: (notifs) => {
      this.ngZone.run(() => {
      this.notifications = notifs || [];
      this.loading = false; 

      this.cdr.detectChanges();
        });
    },
    error: (err) => {
      console.error(err);
      this.notifications = [];
      this.loading = false; 

      this.cdr.detectChanges();
    }
  });
  }

  markAsSeen(notification: Notification) {
    if (!notification.seen && notification.id) {
      this.notificationService.markAsSeen(notification.id);
      notification.seen = true;
    }
  }

  get unseenCount(): number {
    return this.notifications.filter(n => !n.seen).length;
  }

  getRemainingDays(date: any): number {
    const today = new Date();
    const target = new Date(date);

    return Math.max(
      Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
      0
    );
  }
}