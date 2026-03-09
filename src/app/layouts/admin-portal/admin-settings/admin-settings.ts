import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
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
  }
}