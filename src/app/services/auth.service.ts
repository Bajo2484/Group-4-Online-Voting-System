import { Injectable } from '@angular/core';

export type UserRole = 'admin' | 'student' | 'elecom';

export interface CurrentUser {
  role: UserRole;
  name: string;
  studentId?: string;        // for student accounts
  elecomUsername?: string;   // for Elecom accounts
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly STORAGE_KEY = 'evoting_current_user';
  private currentUser?: CurrentUser;

  constructor() {
    this.currentUser = this.loadFromStorage();
  }

  private loadFromStorage(): CurrentUser | undefined {
    if (typeof localStorage === 'undefined') return undefined;

    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return undefined;

    try {
      return JSON.parse(raw) as CurrentUser;
    } catch {
      return undefined;
    }
  }

  private saveToStorage(user: CurrentUser | undefined): void {
    if (typeof localStorage === 'undefined') return;

    if (!user) {
      localStorage.removeItem(this.STORAGE_KEY);
      return;
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
  }

  setCurrentUser(user: CurrentUser): void {
    this.currentUser = user;
    this.saveToStorage(user);
  }

  getCurrentUser(): CurrentUser | undefined {
    return this.currentUser;
  }

  clear(): void {
    this.currentUser = undefined;
    this.saveToStorage(undefined);
  }

  // Role checks
  isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  isStudent(): boolean {
    return this.currentUser?.role === 'student';
  }

  isElecom(): boolean {
    return this.currentUser?.role === 'elecom';
  }

  // General login check
  isLoggedIn(): boolean {
    return !!this.currentUser;
  }
}
