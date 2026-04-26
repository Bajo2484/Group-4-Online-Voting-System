import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, CurrentUser } from '../../services/auth.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

const swalUI = {
  background: '#ffffff',
  color: '#333',
  confirmButtonColor: '#4f46e5',
  buttonsStyling: false,
  customClass: {
    popup: 'custom-swal',
    confirmButton: 'swal-confirm-btn'
  }
};

@Component({
  selector: 'app-auth-login',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent {
  username = ''; 
  password = '';
  loading = false;

  constructor(
    private readonly router: Router,
    private readonly auth: AuthService
  ) {}

  async login() {
    this.loading=true;

    const input = this.username.trim();
    const password = this.password.trim();

    if (!input || !password) {
      this.loading = false;

      Swal.fire({
        ...swalUI,
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please enter username and password',
        confirmButtonText: 'OK',
      });
      return;
    }

    try {
      let user: CurrentUser;

      // Check if input is admin username
      if (!input.includes('@')) {
        
        user = await this.auth.login(input, password); 

        // Your AuthService.login now handles admin username internally
      } else {

        // For Elecom and Student
        let email = input;

        // Convert student ID to fake email
        if (/^\d+$/.test(input)) {
          email = `${input}@students.evoting.com`;
        }

        user = await this.auth.login(email, password);
      }

      
      if (user.role === 'elecom' && !user.isActive) {
        Swal.fire({
          ...swalUI,
          icon: 'warning',
          title: 'Account Inactive',
          text: 'This Elecom account is currently inactive.',
          confirmButtonText: 'Got it',
        });

        this.loading = false;
        return;
      }

      // Success alert
      await Swal.fire({
        ...swalUI,
        icon: 'success',
        title: `Welcome ${user.name || user.role}!`,
        text: 'Login successful',
        width: '360px',
        backdrop: 'rgba(15, 23, 42, 0.4)',
        timer: 1500,
        showConfirmButton: false,

        customClass: {
          popup: 'swal-popup-success'
        }
      });

      this.loading = false;

      // Redirect based on role
      if (user.role === 'admin') this.router.navigate(['/dashboard']);
      else if (user.role === 'student') this.router.navigate(['/student-dashboard']);
      else if (user.role === 'elecom') this.router.navigate(['/elecom-dashboard']);

    } catch (error: any) {
       this.loading = false;

      Swal.fire({
        ...swalUI,
        icon: 'error',
        title: 'Login Failed',
        text: error.message || 'Invalid username or password',
        confirmButtonText: 'Try Again',
      });
    }
  }
}