import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-profile.html',
  styleUrls: ['./student-profile.css']
})
export class StudentProfileComponent {


  studentName = 'Juan';
  studentID = '2026-001';
  department = 'BSIT';
  yearLevel = '3rd Year';
  email = 'JoanaCutie@gmail.com';
  profilePhoto: string | null = null;

  candidateInfo = {
    organization: 'ATLAS',
    position: 'PRESIDENT',
    status: 'Pending'
  };

  oldPassword = '';
  newPassword = '';
  confirmPassword = '';

  submitted = false;

  saveProfile() {
    console.log('Updated email:', this.email);
    this.submitted = true;

    setTimeout(() => {
      this.submitted = false;
    }, 3000);

    // TODO: call backend API to save updated info
    alert('Profile updated successfully!');
  }


  changePassword() {
    if (!this.oldPassword || !this.newPassword || !this.confirmPassword) {
      alert('Please fill out all password fields.');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      alert('New password and confirm password do not match.');
      return;
    }

    // TODO: call backend API to change password
    console.log('Changing password from', this.oldPassword, 'to', this.newPassword);
    alert('Password updated successfully!');

    this.oldPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }


  onPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => this.profilePhoto = reader.result as string;
      reader.readAsDataURL(file);
    }
  }

}
