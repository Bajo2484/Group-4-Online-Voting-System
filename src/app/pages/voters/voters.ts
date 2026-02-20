import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentAccount, StudentAccountService } from '../../services/student-account.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-voters',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf],
  templateUrl: './voters.html',
  styleUrls: ['./voters.css'],
})
export class Voters {

  showModal = false;
  isEditMode = false;

  students: StudentAccount[] = [];

  programs: string[] = ['BSIT', 'BSTCM', 'BSEMT'];
  statuses: string[] = ['UNDERGRADUATE', 'GRADUATE'];
  yearLevels: string[] = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

  newStudent: StudentAccount = this.getEmptyStudent();

  constructor(private studentService: StudentAccountService) {
    this.loadStudents();
  }

  getEmptyStudent(): StudentAccount {
    return {
      id: '',
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
      lastName: '',
      middleName: '',
      firstName: ''
    };
  }

  loadStudents(): void {
    this.students = this.studentService.getAll();
  }

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

  saveStudent(): void {
    if (!this.newStudent.id || !this.newStudent.password) {
      Swal.fire('Error', 'Student ID and Password are required.', 'warning');
      return;
    }

    this.newStudent.name =
      this.newStudent.firstName + ' ' +
      this.newStudent.middleName + ' ' +
      this.newStudent.lastName;

    try {
      if (this.isEditMode) {
        this.studentService.update(this.newStudent);
        Swal.fire('Updated!', 'Student updated successfully.', 'success');
      } else {
        this.studentService.add(this.newStudent);
        Swal.fire('Created!', 'Student added successfully.', 'success');
      }

      this.loadStudents();
      this.closeModal();
    } catch (err: any) {
      Swal.fire('Error', err.message, 'error');
    }
  }

  editStudent(student: StudentAccount) {
    this.openModal(student);
  }

  deleteStudent(id: string) {
    Swal.fire({
      title: 'Delete this student?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33'
    }).then(result => {
      if (result.isConfirmed) {
        this.studentService.delete(id);
        this.loadStudents();
        Swal.fire('Deleted!', '', 'success');
      }
    });
  }
}