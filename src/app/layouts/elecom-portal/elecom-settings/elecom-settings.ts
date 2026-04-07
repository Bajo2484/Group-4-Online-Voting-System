import { Component, OnInit, inject } from '@angular/core';
import { Firestore, doc, docData, updateDoc } from '@angular/fire/firestore';
import { getAuth, updatePassword, User } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { AuthService } from '@app/services/auth.service';
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
export class ElecomSettingsComponent implements OnInit {
  private firestore: Firestore = inject(Firestore);
  private storage = getStorage();
  private auth = getAuth();

  name: string = '';
  email: string = '';
  profileImage: string = '';

  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  selectedFile: File | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    const user = await this.authService.getCurrentUser();
    if (!user) return;

    this.email = user.email ?? '';

    const userDocRef = doc(this.firestore, `users/${user.uid}`);
    docData(userDocRef).subscribe((data: any) => {
      this.name = data?.name ?? '';
      this.profileImage = data?.profileImage ?? '';
    });
  }

  async updateProfile() {
    const user = await this.authService.getCurrentUser();
    if (!user) {
      alert('User not logged in');
      return;
    }

    const userDocRef = doc(this.firestore, `users/${user.uid}`);
    await updateDoc(userDocRef, { name: this.name });

    alert('Profile updated!');
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  async uploadProfilePicture() {
    if (!this.selectedFile) return;

    const user = await this.authService.getCurrentUser();
    if (!user) {
      alert('User not logged in');
      return;
    }

    try {
      const fileRef = ref(this.storage, `profilePictures/${user.uid}`);
      await uploadBytes(fileRef, this.selectedFile);

      const downloadURL = await getDownloadURL(fileRef);

      const userDocRef = doc(this.firestore, `users/${user.uid}`);
      await updateDoc(userDocRef, { profileImage: downloadURL });

      this.profileImage = downloadURL;
      alert('Profile picture updated!');
    } catch (error) {
      console.error(error);
      alert('Failed to upload profile picture');
    }
  }

  async changePassword() {
    if (this.newPassword !== this.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    const user: User | null = this.auth.currentUser;
    if (!user) {
      alert('User not logged in');
      return;
    }

    try {
      await updatePassword(user, this.newPassword);
      alert('Password updated!');
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';
    } catch (error) {
      console.error(error);
      alert('Error updating password. You may need to re-login.');
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}