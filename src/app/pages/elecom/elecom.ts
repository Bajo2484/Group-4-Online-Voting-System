import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ElecomAccount, ElecomAccountService } from '../../services/elecom-account.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-elecom',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf],
  templateUrl: './elecom.html',
  styleUrls: ['./elecom.css'],
})
export class ElecomComponent {

  elecoms: ElecomAccount[] = [];

  newElecom = {
    username: '',
    name: '',
    email: '',
    password: '',
    isActive: true,
  };
errorMessage: any;
successMessage: any;

  constructor(private readonly elecomService: ElecomAccountService) {
    this.loadElecoms();
  }

  loadElecoms(): void {
    this.elecoms = this.elecomService.getAll();
  }

  addElecom(): void {

    const username = this.newElecom.username.trim();
    const name = this.newElecom.name.trim();
    const email = this.newElecom.email.trim();
    const password = this.newElecom.password.trim();

  
    if (!username || !name || !password) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Required Fields',
        text: 'Username, Full Name, and Password are required.',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    try {

      this.elecomService.add({
        username,
        name,
        password,
        email,
        isActive: true,
       
      });

      Swal.fire({
        icon: 'success',
        title: 'Account Created!',
        text: 'Elecom account created successfully.',
        confirmButtonColor: '#28a745'
      });

      this.newElecom = {
        username: '',
        name: '',
        email: '',
        password: '',
        isActive: true
      };

      this.loadElecoms();

    } catch (error) {

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text:
          (error instanceof Error && error.message) ||
          'Unable to create Elecom account.',
        confirmButtonColor: '#d33'
      });
    }
  }

  deleteElecom(username: string): void {

    Swal.fire({
      title: 'Are you sure?',
      text: 'This Elecom account will be permanently removed!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {

      if (result.isConfirmed) {

        this.elecomService.delete(username);
        this.loadElecoms();

        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Elecom account has been removed.',
          confirmButtonColor: '#28a745'
        });
      }

    });
  }

}
