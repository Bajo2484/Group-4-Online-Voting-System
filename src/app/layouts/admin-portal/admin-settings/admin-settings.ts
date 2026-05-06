import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { getAuth, Auth, signOut, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from '@angular/fire/auth';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  templateUrl: './admin-settings.html',
  styleUrls: ['./admin-settings.css'],
  imports: [FormsModule, CommonModule]
})
export class AdminSettingsComponent {

  activeTab: string = 'profile';

  admin = {
    fullName: 'Admin Name',
    contactNo: '',
    email: 'admin@school.edu',
    profilePic: '',
    language: 'en',
    theme: 'light',

    receiveNotifications: true,
    notifElectionUpdates: true,
    notifVotingReminders: true,
    notifResults: true,
    notifSystemAlerts: true,

    notifEmail: true,
    notifSMS: true,
    notifInApp: true,

    enable2FA: false,
    loginAlerts: true
  };

  password = {
    current: '',
    new: '',
    confirm: ''
  };

  selectedFile: any;

  faqs = [
    { q: "How do I reset a student's password?", a: "Use the Voters Management page from the sidebar.", open: false },
    { q: "How do I start an election?", a: "Use the Election Control page from the sidebar.", open: false },
    { q: "Who can access this admin panel?", a: "Only users with the Admin role.", open: false },
    { q: "How do I update student information?", a: "Open Voters Management, select the student, and click 'Edit'.", open: false },
    { q: "How can I track voter turnout?", a: "Use the Election Reports page to view real-time voting statistics.", open: false },
    { q: "What happens if a student forgets to vote?", a: "The system will mark them as 'Did Not Vote' in the report.", open: false },
    { q: "Can I send reminders to students?", a: "Yes, enable 'Voting Reminders' in the Notifications tab.", open: false },
    { q: "How do I enable 2FA for extra security?", a: "Go to Security settings and toggle 'Enable Two-Factor Authentication.'", open: false },
    { q: "Can I log out all devices remotely?", a: "Click 'Logout All Devices' under Security settings.", open: false },
    { q: "How do I view past election results?", a: "Open the Election Reports page and select the completed election.", open: false }
  ];

  constructor(
    private router: Router,
    private auth: Auth
  ) {

    const savedTheme = localStorage.getItem('theme');

    if (savedTheme) {
      this.admin.theme = savedTheme;

      if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
      }
    }
  }

  // THEME FUNCTION (IMPORTANT)
  setTheme(theme: string) {
    this.admin.theme = theme;

    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }

    localStorage.setItem('theme', theme);
  }

  toggleFAQ(index: number) {
    this.faqs[index].open = !this.faqs[index].open;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.admin.profilePic = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  updateProfile() {
    console.log('Profile updated:', this.admin);
    Swal.fire({
      icon: 'success',
      title: 'Profile Updated',
      text: 'Your profile has been updated successfully.',
      confirmButtonText: 'OK'
    });
  }

  async updatePassword() {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user || !user.email) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No user is currently logged in.',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (!this.password.current) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please enter your current password.',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (!this.password.new || !this.password.confirm) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please enter and confirm your new password.',
        confirmButtonText: 'OK'
      });
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        this.password.current
      );

      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, this.password.new);
      Swal.fire({ 
        icon: 'success',  
        title: 'Password Updated',
        text: 'Your password has been updated successfully.',
        confirmButtonText: 'OK'
      });

      this.password.current = '';
      this.password.new = '';
      this.password.confirm = '';

    } catch (error: any) {
      console.error(error);

      if (error.code === 'auth/wrong-password') {
        Swal.fire({
          icon: 'error',
          title: 'Password Error',
          text: 'Current password is incorrect.',
          confirmButtonText: 'OK'
        });
      } else if (error.code === 'auth/requires-recent-login') {
        Swal.fire({
          icon: 'error',
          title: 'Login Required',
          text: 'Please login again and try.',
          confirmButtonText: 'OK'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An error occurred while updating the password.',
          confirmButtonText: 'OK'
        });
      }
    }
  }

  saveNotifications() {
    Swal.fire({
      icon: 'success',
      title: 'Settings Saved',
      text: 'Notification settings have been saved.',
      confirmButtonText: 'OK'
    });
  }

  toggle2FA() {
    this.admin.enable2FA = !this.admin.enable2FA;
  }

 

  logout() {
  signOut(this.auth).then(() => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  });
}
}