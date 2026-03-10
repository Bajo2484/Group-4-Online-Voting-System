import { Component } from '@angular/core';
<<<<<<< HEAD
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
=======
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, CurrentUser } from '../../../services/auth.service';
>>>>>>> d55779593b30664f3eda9f9eec1350274bf88dd7

@Component({
  selector: 'app-admin-settings',
  standalone: true,
<<<<<<< HEAD
 imports: [FormsModule, NgFor], 
  templateUrl: './admin-settings.html',
  styleUrls: ['./admin-settings.css']
})
export class AdminSettingsComponent {

  // Admin Profile Data
  adminProfile = {
    name: 'Admin User',
    email: 'admin@example.com',
    contact: '09123456789',
    username: 'admin',
    role: 'Administrator'
  };

  // Security Settings
  twoFactorEnabled = false;
  autoVotingTimeout = 10;
  loginHistoryVisible = false;

  // Election Settings
  votingStartTime = '08:00';
  votingEndTime = '17:00';
  allowMultipleVoting = false;
  liveResultsDelay = 5;

  // Theme
  selectedTheme = 'light';

  // Actions
  toggleTheme(theme: string) {
    this.selectedTheme = theme;
  }

  saveSettings() {
    console.log('Settings saved!', {
      twoFactorEnabled: this.twoFactorEnabled,
      autoVotingTimeout: this.autoVotingTimeout,
      loginHistoryVisible: this.loginHistoryVisible,
      votingStartTime: this.votingStartTime,
      votingEndTime: this.votingEndTime,
      allowMultipleVoting: this.allowMultipleVoting,
      liveResultsDelay: this.liveResultsDelay,
      selectedTheme: this.selectedTheme
    });
    alert('Settings saved successfully!');
  }

  logout() {
    console.log('Logging out...');
    alert('You have been logged out!');
=======
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-settings.html',
  styleUrls: ['./admin-settings.css'],
})
export class AdminSettingsComponent {
  // Admin info
  adminName: string = '';
  adminEmail: string = '';

  // Password change
  oldPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  // System preferences
  theme: 'light' | 'dark' = 'light';
  language: 'en' | 'fil' = 'en';
  notifications: boolean = true;

  savedMessage: string = '';
  errorMessage: string = '';

  constructor(private auth: AuthService) {
    // Load current user info if exists
    const user: CurrentUser | undefined = this.auth.getCurrentUser();
    if (user) {
      this.adminName = user.role === 'admin' ? 'Admin User' : '';
      this.adminEmail = 'admin@example.com'; // replace with real property if exists
    }
  }

  updateProfile(): void {
    if (!this.adminName || !this.adminEmail) {
      this.errorMessage = 'Please fill in all profile fields.';
      return;
    }

    // Simulate saving profile to your backend
    // You can integrate your real API here
    this.savedMessage = 'Profile updated successfully!';
    this.errorMessage = '';
    setTimeout(() => (this.savedMessage = ''), 3000);
  }

  changePassword(): void {
    if (!this.oldPassword || !this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all password fields.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'New passwords do not match.';
      return;
    }

    if (this.newPassword.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters long.';
      return;
    }

    // Simulate saving password to backend
    this.savedMessage = 'Password changed successfully!';
    this.errorMessage = '';

    // Clear password fields
    this.oldPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';

    setTimeout(() => (this.savedMessage = ''), 3000);
  }

  updatePreferences(): void {
    // Save theme, language, notifications
    this.savedMessage = 'Preferences saved successfully!';
    this.errorMessage = '';
    setTimeout(() => (this.savedMessage = ''), 3000);
>>>>>>> d55779593b30664f3eda9f9eec1350274bf88dd7
  }
}