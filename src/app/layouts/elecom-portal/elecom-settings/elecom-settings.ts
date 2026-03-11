import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-elecom-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './elecom-settings.html',
  styleUrls: ['./elecom-settings.css']
})
export class ElecomSettingsComponent {

  elecomName = 'Elecom Member';
  elecomEmail = 'elecom@example.com';
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';

  theme = 'light';
  language = 'English';
  notifications = true;

  updateProfile() {
    if (!this.elecomName || !this.elecomEmail) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please fill in your name and email.',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    Swal.fire({
      icon: 'success',
      title: 'Profile Updated!',
      html: `
        <strong>Name:</strong> ${this.elecomName} <br>
        <strong>Email:</strong> ${this.elecomEmail}
      `,
      confirmButtonColor: '#28a745'
    });
  }

  changePassword() {
    if (!this.oldPassword || !this.newPassword || !this.confirmPassword) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please fill all password fields.',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Password Mismatch',
        text: "New password and confirm password do not match.",
        confirmButtonColor: '#d33'
      });
      return;
    }

    Swal.fire({
      icon: 'success',
      title: 'Password Changed!',
      text: 'Your password has been updated successfully.',
      confirmButtonColor: '#28a745'
    });

    this.oldPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }

  updatePreferences() {
    Swal.fire({
      icon: 'success',
      title: 'Preferences Saved!',
      html: `
        <strong>Theme:</strong> ${this.theme} <br>
        <strong>Language:</strong> ${this.language} <br>
        <strong>Notifications:</strong> ${this.notifications ? 'Enabled' : 'Disabled'}
      `,
      confirmButtonColor: '#28a745'
    });

    console.log(
      `Theme: ${this.theme}, Language: ${this.language}, Notifications: ${this.notifications}`
    );
  }
}