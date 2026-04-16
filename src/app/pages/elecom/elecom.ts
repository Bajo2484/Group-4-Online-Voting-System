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

  //  EDIT MODE STATE
  isEditMode: boolean = false;
  editId: string = '';

  //  FORM MODEL
  newElecom = {
    name: '',
    email: '',
    password: '',
    position: '',
    isActive: true,
  };

  //  POSITIONS
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

  //  LOAD DATA
  loadElecoms(): void {
    this.elecoms$ = this.elecomService.getAll();
  }

  //  CLICK EDIT
  editElecom(elecom: ElecomAccount): void {
    this.isEditMode = true;
    this.editId = elecom.uid ?? '';

    this.newElecom = {
      name: elecom.name,
      email: elecom.email,
      password: '',
      position: elecom.position,
      isActive: elecom.isActive ?? true,
    };
  }

  // CANCEL EDIT
  cancelEdit(): void {
    this.isEditMode = false;
    this.editId = '';

    this.newElecom = {
      name: '',
      email: '',
      password: '',
      position: '',
      isActive: true,
    };
  }

  // CREATE + UPDATE (COMBINED)
  async addElecom(): Promise<void> {
    const { name, email, password, position } = this.newElecom;

    // VALIDATION
    if (!name || !email || !position) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Required Fields',
        text: 'Full Name, Email, and Position are required.',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    try {
      //  UPDATE MODE
    
      if (this.isEditMode) {

        await this.elecomService.update(this.editId, {
          name,
          email,
          position,
          isActive: this.newElecom.isActive
        });

        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Elecom account updated successfully.',
          confirmButtonColor: '#28a745'
        });

        this.cancelEdit();
        return;
      }
      // CREATE MODE
      if (!password) {
        Swal.fire({
          icon: 'warning',
          title: 'Missing Password',
          text: 'Password is required for new accounts.',
          confirmButtonColor: '#3085d6'
        });
        return;
      }

      await this.elecomService.add(
        { name, email, position, isActive: true },
        password
      );

      Swal.fire({
        icon: 'success',
        title: 'Account Created!',
        text: 'Elecom account created successfully.',
        confirmButtonColor: '#28a745'
      });

      // RESET FORM
      this.newElecom = {
        name: '',
        email: '',
        password: '',
        position: '',
        isActive: true
      };

    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Operation failed.',
        confirmButtonColor: '#d33'
      });
    }
  }

  // DELETE
  async deleteElecom(uid: string): Promise<void> {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This Elecom account will be permanently removed!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await this.elecomService.delete(uid);

        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Elecom account has been removed.',
          confirmButtonColor: '#28a745'
        });

      } catch (error: any) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Unable to delete Elecom account.',
          confirmButtonColor: '#d33'
        });
      }
    }
  }
}