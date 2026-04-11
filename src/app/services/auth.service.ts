import { Injectable, inject } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword
} from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';

export type UserRole = 'admin' | 'student' | 'elecom';

export interface CurrentUser {
  uid: string;
  email: string | null;
  role: UserRole;
  name?: string;
  studentId?: string;
  elecomUsername?: string;
  hasVoted?: boolean;
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);

  private readonly STORAGE_KEY = 'evoting_current_user';
  private currentUser?: CurrentUser;

  constructor() {
    this.currentUser = this.loadFromStorage();
  }


  // Admin creates a student (voter)

  async registerStudent(
    studentId: string,
    name: string,
    password: string,
    extra?: {
      firstName?: string;
      middleName?: string;
      lastName?: string;
      course?: string;
      yearLevel?: string;
      section?: string;
      gender?: string;
      status?: string;
      email?: string;
      mobile?: string;
    }
  ): Promise<CurrentUser> {
    try {
      const fakeEmail = `${studentId}@students.evoting.com`; // required for Firebase Auth

      const credential = await createUserWithEmailAndPassword(this.auth, fakeEmail, password);
      const uid = credential.user.uid;

      await setDoc(doc(this.firestore, 'students', uid), {
        id: studentId,
        name,
        email: extra?.email || fakeEmail,
        hasVoted: false,
        isActive: true,
        ...(extra && {
          firstName: extra.firstName,
          middleName: extra.middleName,
          lastName: extra.lastName,
          course: extra.course,
          yearLevel: extra.yearLevel,
          section: extra.section,
          gender: extra.gender,
          status: extra.status,
          email: extra.email || fakeEmail,
          mobile: extra.mobile,
        }),
      });

      const studentUser: CurrentUser = {
        uid,
        email: fakeEmail,
        role: 'student',
        name,
        studentId,
        hasVoted: false,
        isActive: true
      };

      return studentUser;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to register student.');
    }
  }


  // Login (Admin, Elecom, Student)
 
  async login(input: string, password: string): Promise<CurrentUser> {
    let email = input.trim();

    try {
      // If input is all digits, assume it's a student ID
      if (/^\d+$/.test(input)) {
        email = `${input}@students.evoting.com`;
      }

      // Firebase Auth login
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      const uid = credential.user.uid;

      let user: CurrentUser | null = null;

      if (/^\d+$/.test(input)) {
        // Student login: fetch from students collection
        const studentDocRef = doc(this.firestore, 'students', uid);
        const studentSnap = await getDoc(studentDocRef);
        if (!studentSnap.exists()) throw new Error('Student record not found.');

        const data = studentSnap.data();
        user = {
          uid,
          email: credential.user.email,
          role: 'student',
          name: data['name'],
          studentId: data['id'],
          hasVoted: data['hasVoted'] || false,
          isActive: data['isActive'] ?? true
        };
      } else {
        // Admin or Elecom: fetch from users collection
        const userDocRef = doc(this.firestore, 'users', uid);
        const userSnap = await getDoc(userDocRef);
        if (!userSnap.exists()) throw new Error('User record not found.');

        const data = userSnap.data();
        user = {
          uid,
          email: credential.user.email,
          role: data['role'],
          name: data['name'],
          elecomUsername: data['username'],
          hasVoted: data['hasVoted'] || false,
          isActive: data['isActive'] ?? true
        };

        if (user.role === 'elecom' && !user.isActive) {
          throw new Error('Elecom account is inactive.');
        }
      }

      this.setCurrentUser(user);
      return user;

    } catch (err: any) {
      throw new Error(err.message || 'Login failed. Invalid credentials.');
    }
  }

  // =========================
  // Logout
  // =========================
  async logout() {
    await signOut(this.auth);
    this.clear();
  }


  // LocalStorage helpers
 
  private loadFromStorage(): CurrentUser | undefined {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return undefined;
    try { return JSON.parse(raw) as CurrentUser; } catch { return undefined; }
  }

  private saveToStorage(user: CurrentUser | undefined): void {
    if (!user) localStorage.removeItem(this.STORAGE_KEY);
    else localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
  }

  setCurrentUser(user: CurrentUser): void { this.currentUser = user; this.saveToStorage(user); }
  getCurrentUser(): CurrentUser | undefined { return this.currentUser; }
  clear(): void { this.currentUser = undefined; this.saveToStorage(undefined); }

  // =========================
  // Role helpers
  // =========================
  isAdmin(): boolean { return this.currentUser?.role === 'admin'; }
  isStudent(): boolean { return this.currentUser?.role === 'student'; }
  isElecom(): boolean { return this.currentUser?.role === 'elecom'; }
  isLoggedIn(): boolean { return !!this.currentUser; }
}