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
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent {
  username = ''; 
  password = '';
  loading = false;

  showPassword = false;
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  constructor(
    private readonly router: Router,
    private readonly auth: AuthService
  ) {}

  openHelp() {
    Swal.fire({
      title: 'Online Voting System Help',
      html: `
        <div style="text-align:left; font-size:14px; line-height:1.6">
          <p><b>Login Issues</b></p>
          <p>If you cannot access your account, make sure you are using the correct username or Student ID and password provided by the system administrator.</p>
          <p><b>Student Accounts</b></p>
          <p>Students must use their registered Student ID or school email format to log in.</p>
          <p><b>Forgot Password</b></p>
          <p>If you forgot your password, please wait for system admin assistance or follow the password reset process if available in your institution.</p>
          <p><b>Important Note</b></p>
          <p>Accounts are managed by the election system administrator. Make sure your credentials are correct before trying again.</p>
        </div>
      `,
      confirmButtonText: 'Got it',
      width: '600px'
    });
  }

  async login() {
    if (this.loading) return;
    this.loading = true;

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

      // Admin login (no @ in username)
      if (!input.includes('@')) { 
        user = await this.auth.login(input, password); 
      } else {
        // Elecom or Student login
        let email = input;

        // Convert numeric student ID to Firebase email format
        if (/^\d+$/.test(input)) {
          email = `${input}@students.evoting.com`;
        }

        user = await this.auth.login(email, password);
      }

      // Handle inactive Elecom accounts
      if (user.role === 'elecom' && !user.isActive) {
        await Swal.fire({
          ...swalUI,
          icon: 'warning',
          title: 'Account Inactive',
          text: 'This Elecom account is currently inactive.',
          confirmButtonText: 'Got it',
        });
        this.username = '';
        this.password = '';
        return;
      }

      // Success alert
      await Swal.fire({
        ...swalUI,
        icon: 'success',
        title: `Welcome ${user.name || user.role}!`,
        text: 'Login successful',
        width: '400px',
        backdrop: 'rgba(15, 23, 42, 0.4)',
        timer: 1500,
        showConfirmButton: false,
        customClass: {
          popup: 'swal-popup-success'
        }
      });

      this.username = '';
      this.password = ''; 

      // Redirect based on role
      if (user.role === 'admin') {
        this.router.navigate(['/dashboard']);
      } else if (user.role === 'student') {
        this.router.navigate(['/student-dashboard']);
      } else if (user.role === 'elecom') {
        this.router.navigate(['/elecom-dashboard']);
      }

    } catch (error: any) {
      this.password = '';
      this.username = '';
      Swal.fire({
        ...swalUI,
        icon: 'error',
        title: 'Login Failed',
        text: error.message || 'Invalid username or password',
        confirmButtonText: 'Try Again',
      }).then(() => {
        window.location.reload(); 
      });
    } finally {
      this.loading = false;
    }
  }
}
