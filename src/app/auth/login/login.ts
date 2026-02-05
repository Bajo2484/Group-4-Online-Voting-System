import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  username = 'admin';
  password = 'admin123';

  constructor(private router: Router) {}

  login() {
    if (this.username && this.password)
    this.router.navigate(['/dashboard']);
  else {
      alert('Enter username and password');
    }
}
}