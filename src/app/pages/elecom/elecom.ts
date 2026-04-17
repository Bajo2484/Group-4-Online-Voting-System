import { Component } from '@angular/core';
import { NgFor, NgIf, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ElecomAccount, ElecomAccountService } from '../../services/elecom-account.service';
import Swal from 'sweetalert2';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-elecom',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, AsyncPipe],
  templateUrl: './elecom.html',
  styleUrls: ['./elecom.css'],
})
export class ElecomComponent {

  elecoms$!: Observable<ElecomAccount[]>;

  // MODAL STATE
  showModal: boolean = false;

  // EDIT MODE
  isEditMode: boolean = false;
  editId: string = '';

  // FORM MODEL (🔥 ADDED username)
  newElecom = {
    name: '',
    username: '',   // ✅ ADDED
    email: '',
    password: '',
    position: '',
    isActive: true,
  };

  positions: string[] = [
    'Chief Commissioner',
    'EMT Commissioner',
    'TCM Commissioner',
    'IT Commissioner',
    'EMT Electoral Rep.',
    'TCM Electoral Rep.',
    'IT Electoral Rep.'
  ];

  constructor(private readonly elecomService: ElecomAccountService) {
    this.loadElecoms();
  }

  loadElecoms(): void {
    this.elecoms$ = this.elecomService.getAll();
  }

  openModal(): void {
    this.isEditMode = false;
    this.editId = '';
    this.resetForm();
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditMode = false;
    this.editId = '';
    this.resetForm();
  }

  resetForm(): void {
    this.newElecom = {
      name: '',
      username: '',   // ✅ ADDED
      email: '',
      password: '',
      position: '',
      isActive: true,
    };
  }

  editElecom(elecom: ElecomAccount): void {
    this.isEditMode = true;
    this.editId = elecom.uid ?? '';

    this.newElecom = {
      name: elecom.name,
      username: (elecom as any).username || '', // ✅ SAFE FALLBACK
      email: elecom.email,
      password: '',
      position: elecom.position,
      isActive: elecom.isActive ?? true,
    };

    this.showModal = true;
  }

  async addElecom(): Promise<void> {
    const { name, username, email, password, position } = this.newElecom;

    if (!name || !username || !email || !position) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Required Fields',
        text: 'Full Name, Username, Email, and Position are required.',
      });
      return;
    }

    try {

      // UPDATE
      if (this.isEditMode) {

        await this.elecomService.update(this.editId, {
          name,
          username,   // ✅ ADDED
          email,
          position,
          isActive: this.newElecom.isActive
        });

        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Elecom account updated successfully.',
        });

        this.closeModal();
        return;
      }

      // CREATE
      if (!password) {
        Swal.fire({
          icon: 'warning',
          title: 'Missing Password',
          text: 'Password is required for new accounts.',
        });
        return;
      }

      await this.elecomService.add(
        { name, username, email, position, isActive: true }, // ✅ ADDED
        password
      );

      Swal.fire({
        icon: 'success',
        title: 'Account Created!',
        text: 'Elecom account created successfully.',
      });

      this.closeModal();

    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Operation failed.',
      });
    }
  }

  async deleteElecom(uid: string): Promise<void> {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This Elecom account will be permanently removed!',
      icon: 'warning',
      showCancelButton: true,
    });

    if (result.isConfirmed) {
      try {
        await this.elecomService.delete(uid);

        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Elecom account has been removed.',
        });

      } catch (error: any) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Unable to delete Elecom account.',
        });
      }
    }
  }
}