import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { getAuth, Auth, signOut, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from '@angular/fire/auth';
import Swal from 'sweetalert2';

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
  elecom = {
    fullName: 'Elecom Name',
    contactNo: '',
    email: 'elecomExample@gmail.com',
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
  constructor(
    private router: Router,
    private auth: Auth
  ) {}

  

  updateProfile() {
    console.log('Profile updated:', this.elecom);
    alert('Profile updated successfully!');
  }

  /** ================= Security Methods ================= */

  async updatePassword() {
    const auth = getAuth();
    const user = auth.currentUser;

   if (!user || !user.email) {
    alert('No user is currently logged in.');
    return;
  }
   if (!this.password.current ) {
    alert('Please enter your current password.');
    return;
   }

   if (!this.password.new || !this.password.confirm) {
    alert('Password do not match!');
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
        title: 'Update Failed',
        text: 'Failed to update password.',
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
toggle2FA(){
  this.elecom.enable2FA = !this.elecom.enable2FA;
}
logoutAllDevices() {
  Swal.fire({
    icon: 'success',
    title: 'Logged Out',
    text: 'All devices have been logged out.',
    confirmButtonText: 'OK'
  });
}

  /** ================= Other Methods ================= */
  logout() {
    signOut(this.auth).then(() => {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/login';
    })
  }
}