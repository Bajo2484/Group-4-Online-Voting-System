import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-vote-success',
  imports: [CommonModule],
  templateUrl: './vote-success.html',
  styleUrl: './vote-success.css',
})
export class VoteSuccess {

  constructor(private router: Router) {}

  goDashboard() {
  this.router.navigate(['/student-dashboard']);
}

  viewResults() {
    this.router.navigate(['/student-result']);
  }
}
