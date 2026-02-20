import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { StudentAccountService } from '../../services/student-account.service';
import { ElecomAccountService } from '../../services/elecom-account.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-auth-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {

  username = '';
  password = '';

  constructor(
    private readonly router: Router,
    private readonly auth: AuthService,
    private readonly studentAccounts: StudentAccountService,
    private readonly elecomAccounts: ElecomAccountService
  ) {}

  async login() {

    const trimmedUsername = this.username.trim();
    const trimmedPassword = this.password.trim();


    if (!trimmedUsername || !trimmedPassword) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please enter username and password'
      });
      return;
    }

    if (trimmedUsername === 'admin') {

      if (trimmedPassword === 'admin123') {

        this.auth.setCurrentUser({ role: 'admin' });

        await Swal.fire({
          icon: 'success',
          title: 'Welcome Admin!',
          text: 'Login successful',
          timer: 1500,
          showConfirmButton: false
        });

        this.router.navigate(['/dashboard']);

      } else {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Password',
          text: 'Incorrect admin password'
        });
      }

      return;
    }

    const student = this.studentAccounts.findByCredentials(trimmedUsername, trimmedPassword);

    if (student) {

      if (student.hasVoted) {
        Swal.fire({
          icon: 'info',
          title: 'Vote Already Cast',
          text: 'You have already voted. Thank you!'
        });
        return;
      }

      this.auth.setCurrentUser({
        role: 'student',
        studentId: student.id
      });

      await Swal.fire({
        icon: 'success',
        title: 'Login Successful!',
        text: 'Welcome Student',
        timer: 1500,
        showConfirmButton: false
      });

      this.router.navigate(['/student-dashboard']);
      return;
    }


    const elecom = this.elecomAccounts.findByCredentials(trimmedUsername, trimmedPassword);

    if (elecom) {

      if (!elecom.isActive) {
        Swal.fire({
          icon: 'warning',
          title: 'Account Inactive',
          text: 'This Elecom account is currently inactive.'
        });
        return;
      }

      this.auth.setCurrentUser({
        role: 'elecom',
        elecomUsername: elecom.username
      });

      await Swal.fire({
        icon: 'success',
        title: 'Welcome Elecom!',
        text: 'Login successful',
        timer: 1500,
        showConfirmButton: false
      });

      this.router.navigate(['/elecom-dashboard']);
      return;
    }

    Swal.fire({
      icon: 'error',
      title: 'Login Failed',
      text: 'Invalid username or password'
    });
  }
}
