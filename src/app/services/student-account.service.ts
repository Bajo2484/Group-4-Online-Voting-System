// src/app/services/student-account.service.ts
import { Injectable } from '@angular/core';

import { StudentAccount } from './student-account.model';

@Injectable({
  providedIn: 'root',
})
export class StudentAccountService {
  private students: StudentAccount[] = [];

  /** Get all students */
  getAll(): StudentAccount[] {
    return this.students;
  }

  /** Add a new student */
  add(student: StudentAccount): void {
    this.students.push(student);
  }

  /** Update an existing student */
  update(student: StudentAccount): void {
    const index = this.students.findIndex(s => s.id === student.id);
    if (index !== -1) {
      this.students[index] = student;
    }
  }

  /** Delete student by ID */
  delete(id: string): void {
    this.students = this.students.filter(s => s.id !== id);
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