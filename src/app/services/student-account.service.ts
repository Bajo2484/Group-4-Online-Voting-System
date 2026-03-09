// src/app/services/student-account.service.ts
import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
} from '@angular/fire/firestore';
import { StudentAccount } from './student-account.model';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StudentAccountService {
  private firestore = inject(Firestore);
  private readonly collectionName = 'students';

  /** Get all voters/students from Firebase (live updates) */
  getAll$(): Observable<StudentAccount[]> {
    const colRef = collection(this.firestore, this.collectionName);
    const q = query(colRef);
    return collectionData(q, { idField: 'firestoreId' }).pipe(
      map((docs: any[]) =>
        docs.map((d) => this.mapToStudentAccount(d))
      )
    );
  }

  /** Get all students (sync, for backward compatibility) - returns empty, use getAll$ instead */
  getAll(): StudentAccount[] {
    return [];
  }

  /** Add student - handled by auth + voters component, this is for local cache only */
  add(student: StudentAccount): void {
    // No-op: data is saved via auth + Firestore in voters component
  }

  /** Update voter in Firebase */
  async update(student: StudentAccount): Promise<void> {
    const docRef = await this.findDocByStudentId(student.id);
    if (!docRef) throw new Error('Voter not found.');
    const { password, ...data } = student;
    await updateDoc(docRef, {
      id: data.id,
      name: data.name,
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      course: data.course,
      yearLevel: data.yearLevel,
      section: data.section,
      gender: data.gender,
      status: data.status,
      email: data.email,
      mobile: data.mobile,
      hasVoted: data.hasVoted,
    });
  }

  /** Delete voter from Firebase */
  async delete(studentId: string): Promise<void> {
    const docRef = await this.findDocByStudentId(studentId);
    if (!docRef) throw new Error('Voter not found.');
    await deleteDoc(docRef);
  }

  /** Find Firestore doc ref by student ID */
  private async findDocByStudentId(studentId: string) {
    const colRef = collection(this.firestore, this.collectionName);
    const q = query(colRef, where('id', '==', studentId));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].ref;
  }

  /** Map Firestore doc to StudentAccount */
  private mapToStudentAccount(d: any): StudentAccount {
    const name =
      d.name ||
      [d.firstName, d.middleName, d.lastName].filter(Boolean).join(' ');
    return {
      id: d.id || '',
      firstName: d.firstName || '',
      middleName: d.middleName || '',
      lastName: d.lastName || '',
      name: name || '',
      course: d.course || '',
      yearLevel: d.yearLevel || '',
      section: d.section || '',
      password: '',
      hasVoted: d.hasVoted ?? false,
      email: d.email || '',
      status: d.status || '',
      mobile: d.mobile || '',
      gender: d.gender || '',
    };
  }

  /** Return a new empty student object */
  getEmptyStudent(): StudentAccount {
    return {
      id: '',
      firstName: '',
      middleName: '',
      lastName: '',
      name: '',
      course: '',
      yearLevel: '',
      section: '',
      password: '',
      hasVoted: false,
      email: '',
      status: '',
      mobile: '',
      gender: '',
    };
  }
}
