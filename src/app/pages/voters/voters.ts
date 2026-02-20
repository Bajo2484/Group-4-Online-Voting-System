import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StudentAccount, StudentAccountService } from '../../services/student-account.service';
import { NgFor, NgIf } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-voters',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf],
  templateUrl: './voters.html',
  styleUrls: ['./voters.css']
})
export class VotersComponent {
  students: StudentAccount[] = [];

  showModal = false;
  isEditMode = false; 
  newStudent: StudentAccount = this.resetStudent();

  constructor(private studentService: StudentAccountService) {
    this.loadStudents();
  }

  loadStudents() {
    this.students = this.studentService.getAll();
  }


  openModal() {
    this.showModal = true;
    this.isEditMode = false;
    this.newStudent = this.resetStudent();
  }

  closeModal() {
    this.showModal = false;
    this.newStudent = this.resetStudent();
  }


  editStudent(student: StudentAccount) {
    this.newStudent = { ...student };
    this.isEditMode = true;
    this.showModal = true;
  }


  saveStudent() {
    if (!this.newStudent.id || !this.newStudent.firstName || !this.newStudent.lastName || !this.newStudent.password) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Fields',
        text: 'ID, First Name, Last Name, and Password are required.',
      });
      return;
    }

    if (this.isEditMode) {
      this.studentService.update(this.newStudent);
      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Student information has been updated.',
        timer: 2000,
        showConfirmButton: false
      });
    } else {
      this.studentService.add({ ...this.newStudent });
      Swal.fire({
        icon: 'success',
        title: 'Added!',
        text: 'New student has been registered.',
        timer: 2000,
        showConfirmButton: false
      });
    }

    this.closeModal();
    this.loadStudents();
  }

  
  deleteStudent(id: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: "This student account will be removed permanently!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.studentService.delete(id);
        this.loadStudents();
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Student account has been removed.',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }

 
  private resetStudent(): StudentAccount {
    return {
      id: '',
      firstName: '',
      middleName: '',
      lastName: '',
      gender: '',
      yearLevel: '',
      section: '',
      status: 'Undergraduate',
      email: '',
      mobile: '',
      password: '',
      hasVoted: false
    };
  }
}
