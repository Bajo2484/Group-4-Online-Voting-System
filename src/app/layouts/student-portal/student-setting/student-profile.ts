import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './student-profile.html',
  styleUrl: './student-profile.css'
})
export class StudentProfileComponent {

  profileForm: FormGroup;
  isEditingEmail = false;
  showPasswordModal = false;

  constructor(private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      fullName: [{ value: 'John Doe', disabled: true }],
      email: [{ value: 'john.doe@email.com', disabled: true }],
      systemAlerts: [true],
      activityAlerts: [true],
      announcementAlerts: [true]
    });
  }

  toggleEmailEdit() {
    this.isEditingEmail = !this.isEditingEmail;
    if (this.isEditingEmail) {
      this.profileForm.get('email')?.enable();
    } else {
      this.profileForm.get('email')?.disable();
    }
  }

  saveEmail() {
    console.log(this.profileForm.getRawValue());
    alert('Email updated successfully!');
    this.toggleEmailEdit();
  }

  openPasswordModal() {
    this.showPasswordModal = true;
  }

  closePasswordModal() {
    this.showPasswordModal = false;
  }
}