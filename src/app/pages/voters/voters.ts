// src/app/pages/voters/voters.ts
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { StudentAccountService } from '../../services/student-account.service';
import { StudentAccount } from '../../services/student-account.model';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-voters',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf],
  templateUrl: './voters.html',
  styleUrls: ['./voters.css'],
})
export class Voters implements OnInit, OnDestroy {
  searchText: string = '';
  filteredStudents: StudentAccount[] = [];
  showModal = false;
  isEditMode = false;
  students: StudentAccount[] = [];
  programs: string[] = ['BSIT', 'BSTCM', 'BSEMT'];
  statuses: string[] = ['UNDERGRADUATE', 'GRADUATE'];
  yearLevels: string[] = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  newStudent: StudentAccount = this.getEmptyStudent();
  private destroy$ = new Subject<void>();

  constructor(
    private studentService: StudentAccountService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.studentService
      .getAll$()
      .pipe(takeUntil(this.destroy$))
      .subscribe((students) => {
        this.students = students;
        this.filterVoters();
        this.cdr.detectChanges();
      });
  }

<<<<<<< HEAD
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Initialize empty student object */
=======
  /** Return a clean student object */
>>>>>>> d55779593b30664f3eda9f9eec1350274bf88dd7
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

<<<<<<< HEAD
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
=======
  /** Load all students from service */
  loadStudents(): void {
    this.students = this.studentService.getAll();
  }

  /** Open modal for add or edit */
>>>>>>> d55779593b30664f3eda9f9eec1350274bf88dd7
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

  /** Close modal */
  closeModal() {
    this.showModal = false;
  }

<<<<<<< HEAD
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
=======
  /** Save new or edited student */
  saveStudent(): void {
    if (!this.newStudent.id || !this.newStudent.password || !this.newStudent.firstName || !this.newStudent.lastName) {
      Swal.fire('Error', 'Please fill all required fields (ID, Password, First Name, Last Name).', 'warning');
      return;
    }

    // Combine first, middle, last names
>>>>>>> d55779593b30664f3eda9f9eec1350274bf88dd7
    this.newStudent.name = [this.newStudent.firstName, this.newStudent.middleName, this.newStudent.lastName]
      .filter(n => n && n.trim() !== '')
      .join(' ');

    try {
      if (this.isEditMode) {
        await this.studentService.update(this.newStudent);
        Swal.fire('Updated!', 'Voter updated successfully.', 'success');
      } else {
        await this.authService.registerStudent(
          this.newStudent.id,
          this.newStudent.name,
          this.newStudent.password,
          {
            firstName: this.newStudent.firstName,
            middleName: this.newStudent.middleName,
            lastName: this.newStudent.lastName,
            course: this.newStudent.course,
            yearLevel: this.newStudent.yearLevel,
            section: this.newStudent.section,
            gender: this.newStudent.gender,
            status: this.newStudent.status,
            email: this.newStudent.email,
            mobile: this.newStudent.mobile,
          }
        );
        Swal.fire('Created!', 'Voter added to Firebase successfully.', 'success');
      }

      this.closeModal();
    } catch (err: any) {
      Swal.fire('Error', err.message || 'An unexpected error occurred', 'error');
    }
  }

<<<<<<< HEAD
  /** Edit student */
=======
  /** Trigger modal edit */
>>>>>>> d55779593b30664f3eda9f9eec1350274bf88dd7
  editStudent(student: StudentAccount) {
    this.openModal(student);
  }

<<<<<<< HEAD
  /** Delete voter from Firebase */
  deleteStudent(id: string): void {
=======
  /** Delete a student with confirmation */
  deleteStudent(id: string) {
>>>>>>> d55779593b30664f3eda9f9eec1350274bf88dd7
    Swal.fire({
      title: 'Delete this voter?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
<<<<<<< HEAD
      confirmButtonText: 'Yes, delete',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await this.studentService.delete(id);
          Swal.fire('Deleted!', 'Voter has been removed from Firebase.', 'success');
        } catch (err: any) {
          Swal.fire('Error', err.message || 'Failed to delete voter.', 'error');
        }
=======
      confirmButtonText: 'Yes, delete'
    }).then(result => {
      if (result.isConfirmed) {
        this.studentService.delete(id);
        this.loadStudents();
        Swal.fire('Deleted!', 'Student has been removed.', 'success');
>>>>>>> d55779593b30664f3eda9f9eec1350274bf88dd7
      }
    });
  }
}