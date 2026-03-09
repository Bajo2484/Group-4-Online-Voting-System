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

  newElecom = {
    username: '',
    name: '',
    email: '',
    password: '',
    isActive: true,
  };

  constructor(private readonly elecomService: ElecomAccountService) {
    this.loadElecoms();
  }

  loadElecoms(): void {
    // ✅ Observable from AngularFire service
    this.elecoms$ = this.elecomService.getAll();
  }

  async addElecom(): Promise<void> {
    const { username, name, email, password } = this.newElecom;

    if (!username || !name || !email || !password) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Required Fields',
        text: 'Username, Full Name, Email, and Password are required.',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    try {
      await this.elecomService.add(
        { username, name, email, isActive: true },
        password
      );

      Swal.fire({
        icon: 'success',
        title: 'Account Created!',
        text: 'Elecom account created successfully.',
        confirmButtonColor: '#28a745'
      });

      this.newElecom = { username: '', name: '', email: '', password: '', isActive: true };

    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Unable to create Elecom account.',
        confirmButtonColor: '#d33'
      });
    }
  }

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