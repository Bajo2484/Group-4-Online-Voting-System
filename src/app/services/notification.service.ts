import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, setDoc, updateDoc, query, where, orderBy } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Notification {
  id?: string;
  target: 'admin' | 'student' | 'elecom'; 
  message: string;
  studentId?: string;
  type: 'general' | 'request' | 'approved' |'rejected' | 'election';
  seen: boolean;
  createdAt?: any;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private firestore: Firestore) {}

  // Get notifications for admin
  getAdminNotifications(): Observable<Notification[]> {
    const notifRef = collection(this.firestore, 'notifications');

    const q = query(
      notifRef,
      where('target', '==', 'admin'),
      orderBy('createdAt', 'desc')
    );

    return collectionData(q, { idField: 'id' }) as Observable<Notification[]>;  
    
  }

  // Get notifications for elecom
  getElecomNotifications(): Observable<Notification[]> {
    const notifRef = collection(this.firestore, 'notifications');
    const q = query(
      notifRef,
      where('target','==', 'elecom'),
      orderBy('createdAt', 'desc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<Notification[]>;
  }

  // Get notifications for a specific student
  getStudentNotifications(studentId: string): Observable<Notification[]> {
    const notifRef = collection(this.firestore, 'notifications');
    const q = query(
      notifRef,
      where('target', '==', 'student'),
      where('studentId', '==', studentId),
      orderBy('createdAt', 'desc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<Notification[]>;
  }

  // Add a new notification
  addNotification(notification: Notification) {
    const notifRef = doc(collection(this.firestore, 'notifications'));
   
    return setDoc(notifRef, {
      ...notification,
      createdAt: new Date(),
      seen: false
    });
  }

  // Mark notification as seen
  markAsSeen(notificationId: string) {
    const notifDoc = doc(this.firestore, `notifications/${notificationId}`);
    return updateDoc(notifDoc, { seen: true });
  }
}