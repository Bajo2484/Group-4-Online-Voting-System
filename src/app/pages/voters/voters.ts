// src/app/pages/voters/voters.ts
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { StudentAccountService } from '../../services/student-account.service';
import { StudentAccount } from '../../services/student-account.model';
import { AuthService } from '../../services/auth.service';
import { Firestore, collection, collectionData, addDoc } from '@angular/fire/firestore'; // use AngularFire imports
import Swal from 'sweetalert2';

@Component({
  selector: 'app-voters',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf],
  templateUrl: './voters.html',
  styleUrls: ['./voters.css'],
})
export class Voters {
  searchText: string = '';
  filteredStudents: StudentAccount[] = [];
  showModal = false;
  isEditMode = false;
  students: StudentAccount[] = [];
  programs: string[] = ['BSIT', 'BSTCM', 'BSEMT'];
  statuses: string[] = ['UNDERGRADUATE', 'GRADUATE'];
  yearLevels: string[] = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  newStudent: StudentAccount = this.getEmptyStudent();

  constructor(
    private studentService: StudentAccountService,
    private authService: AuthService,
    private firestore: Firestore
  ) {
    this.loadStudents();
  }

  /** Initialize empty student object */
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

  /** Load all students from local service */
  loadStudents(): void {
    this.students = this.studentService.getAll();
    this.filteredStudents = [...this.students];
  }

  /** Filter students for search bar */
  filterVoters() {
    const text = this.searchText.toLowerCase();
    this.filteredStudents = this.students.filter(
      s =>
        s.id.toLowerCase().includes(text) ||
        s.name.toLowerCase().includes(text) ||
        s.course.toLowerCase().includes(text)
    );
  }

  /** Modal controls */
  openModal(student?: StudentAccount) {
    if (student) {
      this.isEditMode = true;
      this.newStudent = { ...student };
    } else {
      this.isEditMode = false;
      this.newStudent = this.getEmptyStudent();
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  /** Save student */
  async saveStudent(): Promise<void> {
    if (
      !this.newStudent.id ||
      !this.newStudent.password ||
      !this.newStudent.firstName ||
      !this.newStudent.lastName
    ) {
      Swal.fire(
        'Error',
        'Please fill all required fields (ID, Password, First Name, Last Name).',
        'warning'
      );
      return;
    }

    // Combine full name
    this.newStudent.name = [this.newStudent.firstName, this.newStudent.middleName, this.newStudent.lastName]
      .filter(n => n && n.trim() !== '')
      .join(' ');

    try {
      if (this.isEditMode) {
        // Update local student
        this.studentService.update(this.newStudent);
        Swal.fire('Updated!', 'Student updated successfully.', 'success');
      } else {
        // Register student in auth service
        await this.authService.registerStudent(
          this.newStudent.id,
          this.newStudent.name,
          this.newStudent.password
        );

        // Add to Firestore properly using AngularFire DI
        const usersRef = collection(this.firestore, 'users'); // ✅ AngularFire collection reference
        await addDoc(usersRef, {
          studentId: this.newStudent.id,
          name: this.newStudent.name,
          email: `${this.newStudent.id}@students.evoting.com`,
          role: 'student',
          hasVoted: false,
          isActive: true,
          createdAt: new Date(),
        });

        // Add to local service
        this.studentService.add(this.newStudent);

        Swal.fire('Created!', 'Student added successfully.', 'success');
      }

      this.loadStudents();
      this.closeModal();
    } catch (err: any) {
      Swal.fire('Error', err.message || 'An unexpected error occurred', 'error');
    }
  }

  /** Edit student */
  editStudent(student: StudentAccount) {
    this.openModal(student);
  }

  /** Delete student */
  deleteStudent(id: string) {
    Swal.fire({
      title: 'Delete this student?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete',
    }).then(result => {
      if (result.isConfirmed) {
        this.studentService.delete(id);
        this.loadStudents();
        Swal.fire('Deleted!', 'Student has been removed.', 'success');
      }
    });
  }
}