import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, CurrentUser } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-auth-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent {
  username = ''; // can be admin username, elecom email, or student ID
  password = '';

  constructor(
    private readonly router: Router,
    private readonly auth: AuthService
  ) {}

  async login() {
    const input = this.username.trim();
    const password = this.password.trim();

    if (!input || !password) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please enter username and password',
      });
      return;
    }

    try {
      let user: CurrentUser;

      // Check if input is admin username
      if (!input.includes('@')) {
        // try admin login by username
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

      // Check conditions
      if (user.role === 'student' && user.hasVoted) {
        Swal.fire({
          icon: 'info',
          title: 'Vote Already Cast',
          text: 'You have already voted. Thank you!',
        });
        return;
      }

      if (user.role === 'elecom' && !user.isActive) {
        Swal.fire({
          icon: 'warning',
          title: 'Account Inactive',
          text: 'This Elecom account is currently inactive.',
        });
        return;
      }

      // Success alert
      await Swal.fire({
        icon: 'success',
        title: `Welcome ${user.name || user.role}!`,
        text: 'Login successful',
        timer: 1500,
        showConfirmButton: false,
      });

      // Redirect based on role
      if (user.role === 'admin') this.router.navigate(['/dashboard']);
      else if (user.role === 'student') this.router.navigate(['/student-dashboard']);
      else if (user.role === 'elecom') this.router.navigate(['/elecom-dashboard']);

    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: error.message || 'Invalid username or password',
      });
    }
  }
}