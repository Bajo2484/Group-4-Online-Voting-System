import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, setDoc, updateDoc, query, where, orderBy } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Notification {
  id?: string;  
  studentId: string;
  message: string;
  date: Date;
  type: 'general' | 'request' | 'approved' | 'election';
  seen: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private firestore: Firestore) {}

  // Get notifications for a specific student
  getStudentNotifications(studentId: string): Observable<Notification[]> {
    const notifRef = collection(this.firestore, 'notifications');
    const q = query(notifRef, where('studentId', '==', studentId), orderBy('date', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<Notification[]>;
  }

  // Add a new notification
  addNotification(notification: Notification) {
    const notifRef = doc(collection(this.firestore, 'notifications'));
    return setDoc(notifRef, notification);
  }

  // Mark notification as seen
  markAsSeen(notificationId: string) {
    const notifDoc = doc(this.firestore, `notifications/${notificationId}`);
    return updateDoc(notifDoc, { seen: true });
  }
}