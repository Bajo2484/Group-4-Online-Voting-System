import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-elecom-settings',
  standalone: true,
  templateUrl: './elecom-settings.html',
  styleUrls: ['./elecom-settings.css'],
  imports: [FormsModule, CommonModule]
})
export class ElecomSettingsComponent {

  // Active sidebar tab
  activeTab: string = 'profile';

  // Admin data model
  admin = {
    fullName: 'Admin Name',
    contactNo: '',
    email: 'admin@school.edu',
    language: 'en',
    theme: 'light',
  


  //notifications
  receiveNotifications: true,
  notifElectionUpdates: true,
  notifVotingReminders: true,
  notifResults: true,
  notifSystemAlerts: true,

  notifEmail: true,
  notifSMS: true,
  notifInApp: true,
 
  //security
  enable2FA: false,
  loginAlerts: true
};

password = {
  current: '',
  new: '',
  confirm: ''
};

  selectedFile:any;



// Add this array for FAQs
faqs = [
  { q: "How do I reset a student's password?", a: "Use the Voters Management page from the sidebar.", open: false },
  { q: "Who can access this admin panel?", a: "Only users with the Admin role.", open: false },
  { q: "How do I update student information?", a: "Open Voters Management, select the student, and click 'Edit'.", open: false },
  { q: "How can I track voter turnout?", a: "Use the Election Reports page to view real-time voting statistics.", open: false },
  { q: "What happens if a student forgets to vote?", a: "The system will mark them as 'Did Not Vote' in the report.", open: false },
  { q: "Can I send reminders to students?", a: "Yes, enable 'Voting Reminders' in the Notifications tab.", open: false },
  { q: "How do I enable 2FA for extra security?", a: "Go to Security settings and toggle 'Enable Two-Factor Authentication.'", open: false },
  { q: "Can I log out all devices remotely?", a: "Click 'Logout All Devices' under Security settings.", open: false },
  { q: "How do I view past election results?", a: "Open the Election Reports page and select the completed election.", open: false }
];


toggleFAQ(index: number) {
  this.faqs[index].open = !this.faqs[index].open;
}
  constructor(private router: Router) {}

  

  updateProfile() {
    console.log('Profile updated:', this.admin);
    alert('Profile updated successfully!');
  }

  /** ================= Security Methods ================= */
  updatePassword() {
    if (!this.password.current) {
      alert('Enter current password!');
    }

    if (this.password.new !== this.password.confirm) {
      alert('Passwords do not match!');
      return;
    }

    console.log('Password updated:', this.password.new);
    alert('Password updated successfully!');
    this.password.new = '';
    this.password.confirm = '';
  }

saveNotifications() {
  alert('Notification settings saved!');
}
toggle2FA(){
  this.admin.enable2FA = !this.admin.enable2FA;
}
logoutAllDevices() {
  alert('All devices logged out!');
}

  /** ================= Other Methods ================= */
  logout() {
    alert('Logging out...');
    this.router.navigate(['/login']);
  }
}