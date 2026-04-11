import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Firestore, collection, query, where, getDocs, doc, updateDoc } from '@angular/fire/firestore';
import { AuthService } from '@app/services/auth.service';
import { getAuth, updatePassword } from 'firebase/auth';

@Component({
  selector: 'app-student-settings',
  standalone: true,
  templateUrl: './student-setting.html',
  styleUrls: ['./student-setting.css'],
  imports: [FormsModule, CommonModule]
})
export class StudentSettingsComponent implements OnInit {

  private afs: Firestore = inject(Firestore);
  private auth: AuthService = inject(AuthService);
  private router: Router = inject(Router);
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  student: any = {};

  passwords = { newPassword: '', confirmPassword: '' };
  showPassword: boolean = false;

  showAnnouncements: boolean = true;
  showResults: boolean = true;

  firestoreDocId: string = '';

  loading: boolean = true;
  
  // INIT
  
  ngOnInit() {
    const currentUser = this.auth.getCurrentUser();
    if (!currentUser) {
      this.loading = false;
      alert('No student logged in!');
      this.router.navigate(['/login']);
      return;
    }

   setTimeout(() => {
  this.loadStudent();
});
  }

  // LOAD STUDENT (USING STUDENT ID)
  async loadStudent() {
    try {
      this.loading =true;

      this.student = {};
      this.firestoreDocId = '';

      const currentUser = this.auth.getCurrentUser();
      if (!currentUser?.email) {
        this.loading = false;
         return;
      }
      
      const studentId = currentUser.email.split('@')[0].trim();

      console.log('Loading student with ID:', studentId);

      const studentsCol = collection(this.afs, 'students');
      const q = query(studentsCol, where('id', '==', studentId));
      const querySnapshot = await getDocs(q);

      console.log('Query result count:', querySnapshot.size);

      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        this.firestoreDocId = docSnap.id;

        const data: any = docSnap.data();
        console.log('Student data loaded:', data);

        this.student = {
          fullName: data.name,
          studentId: data.id,
          course: data.course,
          yearLevel: data.yearLevel,
          section: data.section,
          email: data.email
        };

      } else {
        
        alert('Student record not found!');
        this.loading = false;
      }

    } catch (err) {
      console.error('Error loading student:', err);
      alert('Failed to load student data.');
    } finally {
      this.loading = false; 
      this.cdr.detectChanges();
    }
  }

  // =============================
  // SAVE PROFILE
  // =============================
  async saveProfile() {
    if (!this.firestoreDocId) return;

    if (!this.student.fullName || !this.student.email) {
      alert('Full name and email are required!');
      return;
    }

    try {
      const studentRef = doc(this.afs, `students/${this.firestoreDocId}`);

      await updateDoc(studentRef, {
        name: this.student.fullName,
        email: this.student.email.toLowerCase().trim()
      });

      alert('Profile updated successfully!');
      setTimeout(() => {
      this.loadStudent();
});

    } catch (err) {
      console.error('Profile update failed:', err);
      alert('Failed to update profile.');
    }
  }

  // =============================
  // CHANGE PASSWORD (AUTH)
  // =============================
  async changePassword() {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert('User not logged in!');
      return;
    }

    if (!this.passwords.newPassword || !this.passwords.confirmPassword) {
      alert('Please fill both password fields!');
      return;
    }

    if (this.passwords.newPassword !== this.passwords.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      await updatePassword(user, this.passwords.newPassword);
      alert('Password updated successfully!');
      this.passwords.newPassword = '';
      this.passwords.confirmPassword = '';

    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/requires-recent-login') {
        alert('Please login again before changing password.');
      } else {
        alert('Failed to update password.');
      }
    }
  }

 
  // LOGOUT
  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  
  // TOGGLE PASSWORD
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}