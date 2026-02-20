import { Injectable } from '@angular/core';

export interface StudentAccount {
  id: string;
  name: string;
  course: string;
  yearLevel: string;
  section: string;
  password: string;
  hasVoted: boolean;

  email: string;
  status: string;
  mobile: string;
  gender: string;
  lastName: string;
  middleName: string;
  firstName: string;
}

@Injectable({
  providedIn: 'root',
})
export class StudentAccountService {

  private readonly STORAGE_KEY = 'evoting_students';

  getAll(): StudentAccount[] {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return [];

    try {
      return JSON.parse(raw) as StudentAccount[];
    } catch {
      return [];
    }
  }

  private saveAll(list: StudentAccount[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
  }

  add(student: StudentAccount): void {
    const current = this.getAll();

    if (current.some(s => s.id === student.id)) {
      throw new Error('Student ID already exists.');
    }

    current.push(student);
    this.saveAll(current);
  }

  update(updated: StudentAccount): void {
    const current = this.getAll();
    const index = current.findIndex(s => s.id === updated.id);

    if (index === -1) {
      throw new Error('Student not found.');
    }

    current[index] = updated;
    this.saveAll(current);
  }

  delete(id: string): void {
    const filtered = this.getAll().filter(s => s.id !== id);
    this.saveAll(filtered);
  }

  findByCredentials(id: string, password: string): StudentAccount | undefined {
    return this.getAll().find(
      s => s.id === id && s.password === password
    );
  }

  markVoted(id: string): void {
    const current = this.getAll();
    const index = current.findIndex(s => s.id === id);
    if (index === -1) return;

    current[index].hasVoted = true;
    this.saveAll(current);
  }
}