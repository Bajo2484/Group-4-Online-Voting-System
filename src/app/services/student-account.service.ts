import { Injectable } from '@angular/core';

export interface StudentAccount {
  id: string; 
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: string;
  yearLevel: string;
  section: string;
  status: 'Undergraduate' | 'Graduate';
  email: string;
  mobile: string;
  password: string;
  hasVoted: boolean;
}


@Injectable({
  providedIn: 'root',
})
export class StudentAccountService {
  private readonly STORAGE_KEY = 'evoting_students';
  students: any;

  /* Returns all registered student accounts from localStorage.*/
  getAll(): StudentAccount[] {
    if (typeof localStorage === 'undefined') {
      return [];
    }

    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed as StudentAccount[];
      }
      return [];
    } catch {
      return [];
    }
  }

  private saveAll(list: StudentAccount[]): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
  }

  add(student: StudentAccount): void {
    const current = this.getAll();

    if (current.some((s) => s.id === student.id)) {
      throw new Error('A student with this ID already exists.');
    }

    current.push(student);
    this.saveAll(current);
  }

 
  delete(id: string): void {
    const current = this.getAll();
    const filtered = current.filter((s) => s.id !== id);
    this.saveAll(filtered);
  }

  update(updatedStudent: StudentAccount): void {
    const index = this.students.findIndex((s: { id: string; }) => s.id === updatedStudent.id);
    if (index !== -1) {
      this.students[index] = { ...updatedStudent };
      this.saveAll(this.students);
    }
  }


  findByCredentials(id: string, password: string): StudentAccount | undefined {
    return this.getAll().find((s) => s.id === id && s.password === password);
  }

  
  markVoted(id: string): void {
    const current = this.getAll();
    const index = current.findIndex((s) => s.id === id);

    if (index === -1) {
      return;
    }

    current[index] = { ...current[index], hasVoted: true };
    this.saveAll(current);
  }
}

